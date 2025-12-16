# Bridge API Guide - Extracted from vibechat1_ux.js

## Complete Flow for Video Chat

### 1. Login (via Fetch, not Bridge)
```javascript
import Fetch from 'https://proto2.makedo.com:8883/ux/scripts/fetch.js';

const result = await Fetch.login({ email, password });
// Returns: { status: 'loggedIn', email: 'user@example.com', pid: '12345' }
```

### 2. Initialize Bridge & WebSocket (after login)
```javascript
import Bridge from 'https://proto2.makedo.com:8883/ux/scripts/bridge.js';

this.bridge = new Bridge();
this.bridge.initDispatcher();  // Sets up WebSocket connection
```

### 2.5. Get List of Available Users (Optional)
```javascript
// Get users available for video chat
const users = await this.bridge.getUsersByQuery({
    query: '',      // Empty string returns all users, or search by name/email
    count: 20,      // Max number of users to return
    depth: 1        // Include basic user info
});

console.log('Available users:', users);
// Returns array of user objects:
// [
//   {
//     pid: '12345',                    // User's Makedo PID (use this for createQuickChatChannel)
//     username: 'John Doe',            // Display name
//     email: 'john@example.com',       // Email (if available)
//     status: 'available',             // User status
//     is_me: false,                    // true if this is you
//     avatar_pic: 'path/to/avatar',    // Avatar image path
//     headshot_pic: 'path/to/photo',   // Profile photo path
//     ...                              // Other user metadata
//   },
//   ...
// ]

// Filter out yourself
const otherUsers = users.filter(user => !user.is_me);

// Find a specific user
const marty = users.find(user => user.email === 'martybetz@gmail.com');
console.log('Marty\'s PID:', marty.pid);
```

**WebSocket Listeners** (optional, for advanced features):
```javascript
this.bridge.dispatcher.on({
    pattern: { type: 'command' },
    callback: (message) => {
        // Handle commands like 'newInvite'
    }
});

this.bridge.dispatcher.on({
    pattern: { type: 'member' },
    callback: (message) => {
        // Handle member updates (status, media changes)
    }
});
```

### 3. Create a Channel (1-on-1 video room)
```javascript
const channelResult = await this.bridge.createQuickChatChannel({
    invited: otherUserPid,      // The other person's Makedo PID
    message: 'Let\'s chat!'     // Optional message
});

console.log('Channel opened:', channelResult);
// Returns: { 
//   pid: 'channel_12345',           // Channel ID
//   members: [...],                 // Array of member objects
//   access_code: '413239',          // Default access code
//   ...
// }
```

### 4. Get Your Member Info
```javascript
const memberData = await this.bridge.getOrCreateMeMember({
    channel_id: channelResult.pid
});

console.log('Member data:', memberData);
// Returns: {
//   pid: 'member_67890',            // Your member ID
//   pub_id: 'pub_67890',            // Public member ID (use this for Galene)
//   access_code: '413239',
//   status: 'lobby_pre',            // Initial status
//   local_name: 'Your Name',
//   ...
// }
```

### 5. Setup Comms (Galene connection via Bridge)
```javascript
const memberId = memberData.pub_id || memberData.pid;
const accessCode = memberData.access_code || channelResult.access_code || "413239";

// Initialize connection to Galene SFU
this.bridge.remote_serverSetup(
    channelResult.pid,    // Channel ID
    memberId,             // Your member ID
    accessCode            // Access code
);

// Bridge now has this.bridge.comms available
console.log("Comms initialized!");
```

### 6. Setup Stream Callbacks (BEFORE joining)
```javascript
const self = this;

// Callback when you join successfully
this.bridge.comms.setOnJoinedChannel(function() {
    console.log("Successfully joined Galene!");
    
    // If video/audio were already on, broadcast them
    if (self.state.videoActive) {
        self.bridge.comms.inChannelSetStreamVideoTrack("camera", true);
    }
    if (self.state.audioActive) {
        self.bridge.comms.inChannelSetStreamAudioTrack("camera", true);
    }
});

// Callback when your stream is sent upstream (optional)
this.bridge.comms.setOnNewUpStream(function(streamId, memberId, type, stream) {
    console.log("My stream sent:", streamId, type);
});

// Callback when you receive remote stream (IMPORTANT!)
this.bridge.comms.setOnNewDownStream(function(streamId, memberId, type, stream) {
    console.log("Remote stream received:", streamId, memberId, type);
    
    // Ignore your own stream echo
    if (memberId === self.memberData?.pub_id || memberId === self.memberData?.pid) {
        return;
    }
    
    // Display remote video
    if (type === 'camera') {
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = stream;
        remoteVideo.play();
    }
});

// Callback when remote stream ends
this.bridge.comms.setOnEndDownStream(function(streamId, memberId, type) {
    console.log("Remote stream ended:", streamId);
    
    if (type === 'camera') {
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject = null;
    }
});

// Callback when you exit
this.bridge.comms.setOnExitedChannel(function() {
    console.log("Exited channel");
});
```

### 7. Create Local Stream (Camera/Mic)
```javascript
// Create stream BEFORE joining or while in preview mode
const stream = await this.bridge.comms.local_createStream(
    'camera',           // Stream type (always 'camera' for video/audio)
    audioEnabled,       // true/false for microphone
    videoEnabled        // true/false for camera
);

// Display your own video
const myVideo = document.getElementById('myVideo');
myVideo.srcObject = stream;
myVideo.play();
```

### 8. Join the Channel (Start Broadcasting)
```javascript
// Actually connect to Galene and start sending/receiving
this.bridge.comms.remote_serverJoin();

// After this, your onJoinedChannel callback fires
// And remote streams will trigger onNewDownStream callbacks
```

### 9. Toggle Video/Audio While In Call
```javascript
// Toggle video on/off
await this.bridge.comms.inChannelSetStreamVideoTrack('camera', videoEnabled);

// Toggle audio on/off
await this.bridge.comms.inChannelSetStreamAudioTrack('camera', audioEnabled);
```

### 10. Leave Channel
```javascript
// Leave but keep streams alive (for pause/preview)
this.bridge.comms.remote_serverLeave(false);

// OR completely kill streams
this.bridge.comms.remote_serverLeave(true);
```

### 11. Complete Cleanup
```javascript
// Stop all local tracks
const myVideo = document.getElementById('myVideo');
if (myVideo.srcObject) {
    myVideo.srcObject.getTracks().forEach(track => track.stop());
    myVideo.srcObject = null;
}

// Leave and destroy connection
this.bridge.comms.remote_serverLeave(true);
```

---

## Summary: Complete Minimal Flow

```javascript
// 1. Login
const loginResult = await Fetch.login({ email, password });

// 2. Init Bridge
this.bridge = new Bridge();
this.bridge.initDispatcher();

// 3. Create Channel
const channel = await this.bridge.createQuickChatChannel({
    invited: partnerPid,
    message: 'Let\'s chat!'
});

// 4. Get Member
const member = await this.bridge.getOrCreateMeMember({
    channel_id: channel.pid
});

// 5. Setup Comms
this.bridge.remote_serverSetup(
    channel.pid, 
    member.pub_id, 
    member.access_code || "413239"
);

// 6. Setup Callbacks
this.bridge.comms.setOnNewDownStream((streamId, memberId, type, stream) => {
    if (memberId !== member.pub_id && type === 'camera') {
        remoteVideo.srcObject = stream;
    }
});

// 7. Create Local Stream
const myStream = await this.bridge.comms.local_createStream('camera', true, true);
myVideo.srcObject = myStream;

// 8. Join
this.bridge.comms.remote_serverJoin();

// 9. During call: toggle video/audio
await this.bridge.comms.inChannelSetStreamVideoTrack('camera', false); // turn off video
await this.bridge.comms.inChannelSetStreamAudioTrack('camera', false); // turn off audio

// 10. End call
this.bridge.comms.remote_serverLeave(true);
```

---

## Key Bridge Methods Summary

| Method | Purpose | Parameters | Returns |
|--------|---------|------------|---------|
| `new Bridge()` | Create instance | None | Bridge instance |
| `bridge.initDispatcher()` | Setup WebSocket | None | void |
| `bridge.createQuickChatChannel()` | Create 1-on-1 channel | `{ invited: pid, message: str }` | Channel object |
| `bridge.getOrCreateMeMember()` | Get your membership | `{ channel_id: str }` | Member object |
| `bridge.remote_serverSetup()` | Init Galene connection | `(channelId, memberId, accessCode)` | void |
| `bridge.comms.local_createStream()` | Create local media | `(type, audio, video)` | MediaStream |
| `bridge.comms.remote_serverJoin()` | Join channel | None | void |
| `bridge.comms.inChannelSetStreamVideoTrack()` | Toggle video | `(type, enabled)` | Promise |
| `bridge.comms.inChannelSetStreamAudioTrack()` | Toggle audio | `(type, enabled)` | Promise |
| `bridge.comms.remote_serverLeave()` | Leave channel | `(killStreams)` | void |

## Key Callbacks

| Callback | When It Fires | Parameters |
|----------|---------------|------------|
| `setOnJoinedChannel()` | After successful join | None |
| `setOnNewDownStream()` | Remote stream arrives | `(streamId, memberId, type, stream)` |
| `setOnEndDownStream()` | Remote stream ends | `(streamId, memberId, type)` |
| `setOnNewUpStream()` | Your stream sent | `(streamId, memberId, type, stream)` |
| `setOnExitedChannel()` | You left channel | None |


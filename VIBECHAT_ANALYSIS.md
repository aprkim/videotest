# VibeChat Analysis & Redesign Plan

## What We Need from vibechat1_ux.js

### ✅ KEEP - Core Video Functionality
1. **Makedo Login** (via Fetch.login)
   - Already working separately
   - Returns: `{ status: 'loggedIn', email, pid }`

2. **Bridge/WebSocket Setup**
   ```javascript
   import Bridge from 'https://proto2.makedo.com:8883/ux/scripts/bridge.js';
   this.bridge = new Bridge();
   this.bridge.initDispatcher(); // WebSocket for signaling
   ```

3. **Channel Creation** (for 1-on-1 video)
   ```javascript
   const channel = await this.bridge.createQuickChatChannel({
       invited: otherUserPid,  // Their Makedo user ID
       message: 'Let\'s chat!'
   });
   // Returns: { pid: channelId, members: [...], access_code: ... }
   ```

4. **Member Management**
   ```javascript
   const memberData = await this.bridge.getOrCreateMeMember({
       channel_id: channelId
   });
   // Returns: { pid, pub_id, access_code, status, local_name }
   ```

5. **Galene SFU Connection**
   ```javascript
   // Initialize connection to Galene video server
   this.bridge.remote_serverSetup(channelId, memberId, accessCode);
   
   // Join the video room
   this.bridge.comms.remote_serverJoin();
   ```

6. **Media Streams**
   ```javascript
   // Create local camera/mic stream
   const stream = await this.bridge.comms.local_createStream('camera', audioEnabled, videoEnabled);
   
   // Broadcast to Galene
   await this.bridge.comms.inChannelSetStreamAudioTrack('camera', true);
   await this.bridge.comms.inChannelSetStreamVideoTrack('camera', true);
   ```

7. **SFU Callbacks** (receive remote streams)
   ```javascript
   this.bridge.comms.setOnNewDownStream(function(streamId, memberId, type, stream) {
       // Display remote user's video
       remoteVideo.srcObject = stream;
   });
   ```

### ❌ REMOVE - UI Specific to vibechat1.html
1. User list rendering
2. User selection logic
3. Join/Pause/Rejoin button states
4. Lobby/pre-lobby states
5. Invite acceptance logic
6. Manual channel selection
7. Status message display system

## Your App's Video Flow

### Current State (from script.js)
```
1. User selects language + level + interests
2. Click "Find Partner" → Show matching animation (10 seconds)
3. Match found → startVideoChat() called
4. Need to check Makedo login → Show modal if needed
5. Once logged in → Create channel with matched partner
6. Initialize video/audio streams
7. Show video chat UI with local + remote video
8. User can toggle camera/mic
9. User can end chat
```

### What We Need to Build: `tabbimate_video.js`

A simplified class that:
- ✅ Handles Makedo login (already done)
- ✅ Creates a 1-on-1 channel with a matched partner
- ✅ Manages video/audio streams
- ✅ Provides simple controls (toggle video, toggle audio, end chat)
- ❌ No user lists
- ❌ No manual join/pause/rejoin
- ❌ No lobby states
- ❌ Auto-starts video when matched

## Proposed New Implementation: `tabbimate_video.js`

```javascript
import Bridge from 'https://proto2.makedo.com:8883/ux/scripts/bridge.js';
import Fetch from 'https://proto2.makedo.com:8883/ux/scripts/fetch.js';

class TabbiMateVideo {
    constructor() {
        this.state = {
            loggedIn: false,
            currentUser: null,
            currentChannel: null,
            inCall: false,
            audioEnabled: true,
            videoEnabled: true
        };
        
        this.bridge = null;
        this.onRemoteStreamCallback = null;
    }
    
    // 1. Login to Makedo
    async login(email, password) { ... }
    
    // 2. Initialize Bridge after login
    async initBridge() { ... }
    
    // 3. Start a call with a matched partner
    async startCall(partnerMakedoPid) { ... }
    
    // 4. Toggle video on/off
    async toggleVideo() { ... }
    
    // 5. Toggle audio on/off
    async toggleAudio() { ... }
    
    // 6. End the call
    async endCall() { ... }
    
    // 7. Set callback for when remote video arrives
    onRemoteStream(callback) { ... }
}
```

## Key Differences

| Feature | vibechat1_ux.js | tabbimate_video.js |
|---------|-----------------|-------------------|
| User Selection | Manual from list | Auto-matched |
| Channel Join | Manual button | Automatic |
| UI Elements | Self-contained | Integrates with existing UI |
| Lobby/States | Complex (join/pause/rejoin) | Simple (in call / not in call) |
| Video Start | After clicking JOIN | Immediately after match |
| Dependencies | jQuery, protocol.js | Only Bridge, Fetch |

## Implementation Plan

1. **Create `tabbimate_video.js`** - New simplified class
2. **Keep using**: Bridge, Fetch, MakedoConfig from Makedo servers
3. **Remove**: All vibechat1_ux.js UI logic
4. **Integrate**: Directly with app.html's matching flow
5. **Test**: Full flow from language selection → match → video chat

## Questions to Consider

1. **Partner Identification**: How do we get the matched partner's Makedo PID?
   - Option A: During matching, also exchange Makedo PIDs
   - Option B: Store mapping between Tabbimate user IDs and Makedo PIDs
   
2. **Guest Users**: What if a matched partner hasn't logged into Makedo?
   - Need fallback or require Makedo login before matching

3. **Reconnection**: If video drops, should we auto-reconnect?

4. **Multiple Channels**: Can a user be in multiple channels? (probably not needed)

Let me know if you want me to proceed with creating `tabbimate_video.js`!


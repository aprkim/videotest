# TabbiMate Video - Usage Guide

## Overview

`tabbimate_video.js` is a simplified video chat handler specifically designed for TabbiMate's auto-matching flow. It wraps Makedo's Bridge API to provide a clean, simple interface.

## Key Differences from vibechat1_ux.js

| Feature | vibechat1_ux.js | tabbimate_video.js |
|---------|-----------------|-------------------|
| UI Dependencies | Requires specific DOM elements | No UI dependencies - you provide video elements |
| User Flow | Manual user selection from list | Direct partner PID input (from matching) |
| Video Start | Manual JOIN button click | Automatic after startCall() |
| Complexity | ~1000 lines with UI logic | ~350 lines, pure API wrapper |
| Integration | Self-contained | Integrates with your existing UI |

## Installation

```html
<!-- In app.html -->
<script type="module">
    import TabbiMateVideo from './tabbimate_video.js';
    window.TabbiMateVideo = TabbiMateVideo;
</script>
```

## Basic Usage

### 1. Initialize

```javascript
const videoChat = new TabbiMateVideo();
```

### 2. Setup Callbacks (Optional)

```javascript
videoChat.on('remoteStream', (stream) => {
    console.log('Partner\'s video arrived!');
    // Video is already displayed automatically
});

videoChat.on('remoteStreamEnded', () => {
    console.log('Partner left the call');
});

videoChat.on('callJoined', () => {
    console.log('Successfully joined the call!');
});

videoChat.on('callEnded', () => {
    console.log('Call ended');
});

videoChat.on('error', (type, error) => {
    console.error('Video error:', type, error);
});
```

### 3. Login to Makedo

```javascript
try {
    const result = await videoChat.login('user@example.com', 'password');
    console.log('Logged in as:', result.email);
    console.log('Makedo PID:', result.pid);
} catch (error) {
    console.error('Login failed:', error);
}
```

### 4. Start a Video Call

```javascript
// Get video elements from your DOM
const myVideo = document.getElementById('my-video');
const partnerVideo = document.getElementById('partner-video');

// Get partner's Makedo PID (from your matching system)
const partnerPid = matchedUser.makedoPid;

// Start the call
try {
    await videoChat.startCall(partnerPid, myVideo, partnerVideo);
    console.log('Call started!');
} catch (error) {
    console.error('Failed to start call:', error);
}
```

### 5. Toggle Video/Audio During Call

```javascript
// Toggle video
const videoBtn = document.getElementById('toggle-video');
videoBtn.addEventListener('click', async () => {
    const newState = await videoChat.toggleVideo();
    videoBtn.textContent = newState ? '📹 Video ON' : '📹 Video OFF';
});

// Toggle audio
const audioBtn = document.getElementById('toggle-audio');
audioBtn.addEventListener('click', async () => {
    const newState = await videoChat.toggleAudio();
    audioBtn.textContent = newState ? '🎤 Audio ON' : '🎤 Audio OFF';
});
```

### 6. End the Call

```javascript
const endBtn = document.getElementById('end-call');
endBtn.addEventListener('click', async () => {
    await videoChat.endCall(myVideo, partnerVideo);
    console.log('Call ended');
});
```

## Complete Example for app.html

```javascript
// Initialize video chat handler
const videoChat = new TabbiMateVideo();

// Setup callbacks
videoChat.on('remoteStream', () => {
    console.log('Partner connected!');
    document.getElementById('remote-placeholder').style.display = 'none';
});

videoChat.on('remoteStreamEnded', () => {
    console.log('Partner disconnected');
    document.getElementById('remote-placeholder').style.display = 'flex';
});

// When user clicks "Find Partner" and match is found
async function onMatchFound(matchedUser) {
    try {
        // 1. Check if logged into Makedo
        if (!videoChat.isLoggedIn()) {
            // Show Makedo login modal
            const loginResult = await showMakedoLoginModal();
            if (!loginResult.success) {
                console.error('Makedo login cancelled');
                return;
            }
        }
        
        // 2. Start video call with matched partner
        const myVideo = document.getElementById('my-video');
        const partnerVideo = document.getElementById('partner-video');
        
        await videoChat.startCall(
            matchedUser.makedoPid,  // Partner's Makedo PID
            myVideo,
            partnerVideo
        );
        
        // 3. Show video chat UI
        document.getElementById('video-chat-container').style.display = 'block';
        
    } catch (error) {
        console.error('Failed to start video:', error);
        alert('Failed to start video chat: ' + error.message);
    }
}

// Toggle controls
document.getElementById('toggle-camera').addEventListener('click', async () => {
    const isOn = await videoChat.toggleVideo();
    document.getElementById('toggle-camera').classList.toggle('off', !isOn);
});

document.getElementById('toggle-mic').addEventListener('click', async () => {
    const isOn = await videoChat.toggleAudio();
    document.getElementById('toggle-mic').classList.toggle('off', !isOn);
});

// End call
document.getElementById('end-call').addEventListener('click', async () => {
    const myVideo = document.getElementById('my-video');
    const partnerVideo = document.getElementById('partner-video');
    
    await videoChat.endCall(myVideo, partnerVideo);
    
    // Hide video chat UI
    document.getElementById('video-chat-container').style.display = 'none';
    
    // Return to language selection or show summary
    showSessionSummary();
});
```

## API Reference

### Methods

#### `constructor()`
Creates a new TabbiMateVideo instance.

#### `async login(email, password)`
Login to Makedo video service.
- **Parameters:**
  - `email` (string): User's email
  - `password` (string): User's password
- **Returns:** `Promise<{success: boolean, email: string, pid: string}>`
- **Throws:** Error if login fails

#### `async startCall(partnerPid, localVideoElement, remoteVideoElement)`
Start a video call with a partner.
- **Parameters:**
  - `partnerPid` (string): Partner's Makedo PID
  - `localVideoElement` (HTMLVideoElement): Video element for your camera
  - `remoteVideoElement` (HTMLVideoElement): Video element for partner's camera
- **Returns:** `Promise<void>`
- **Throws:** Error if not logged in or if call setup fails

#### `async toggleVideo()`
Toggle video on/off during a call.
- **Returns:** `Promise<boolean>` - New video state (true = on, false = off)
- **Throws:** Error if not in a call

#### `async toggleAudio()`
Toggle audio on/off during a call.
- **Returns:** `Promise<boolean>` - New audio state (true = on, false = off)
- **Throws:** Error if not in a call

#### `async endCall(localVideoElement, remoteVideoElement)`
End the current call and clean up resources.
- **Parameters:**
  - `localVideoElement` (HTMLVideoElement): Video element for your camera
  - `remoteVideoElement` (HTMLVideoElement): Video element for partner's camera
- **Returns:** `Promise<void>`

#### `on(event, callback)`
Register callback functions.
- **Events:**
  - `'remoteStream'` - `(stream) => {}`
  - `'remoteStreamEnded'` - `() => {}`
  - `'callJoined'` - `() => {}`
  - `'callEnded'` - `() => {}`
  - `'error'` - `(type, error) => {}`

#### `isLoggedIn()`
Check if logged into Makedo.
- **Returns:** `boolean`

#### `isInCall()`
Check if currently in a call.
- **Returns:** `boolean`

#### `getState()`
Get current state object.
- **Returns:** `Object` with `loggedIn`, `currentUser`, `inCall`, etc.

## State Management

The class maintains internal state:
```javascript
{
    loggedIn: false,          // Whether logged into Makedo
    currentUser: null,        // { email, pid }
    currentChannel: null,     // Current channel object
    memberData: null,         // Current member object
    inCall: false,            // Whether in an active call
    audioEnabled: true,       // Audio state
    videoEnabled: true        // Video state
}
```

## Error Handling

All async methods throw errors that should be caught:

```javascript
try {
    await videoChat.startCall(partnerPid, myVideo, partnerVideo);
} catch (error) {
    console.error('Call failed:', error);
    alert('Could not start video call. Please try again.');
}
```

Or use the error callback:

```javascript
videoChat.on('error', (type, error) => {
    console.error(`Video error [${type}]:`, error);
    // Handle different error types
    switch(type) {
        case 'login':
            alert('Login failed. Please check your credentials.');
            break;
        case 'start_call':
            alert('Could not start call. Please try again.');
            break;
        // ... other error types
    }
});
```

## Integration with Matching System

You need to map between your user system and Makedo PIDs:

### Option 1: Store Makedo PID in Firebase
```javascript
// When user logs into Makedo
const makedoResult = await videoChat.login(email, password);

// Save to Firebase user profile
await firebaseService.updateUser(userId, {
    makedoPid: makedoResult.pid,
    makedoEmail: makedoResult.email
});
```

### Option 2: Require Makedo Login Before Matching
```javascript
// In your matching flow
async function startMatching() {
    // Check Makedo login first
    if (!videoChat.isLoggedIn()) {
        await showMakedoLoginModal();
    }
    
    // Then proceed with matching
    const match = await findLanguagePartner();
    await videoChat.startCall(match.makedoPid, myVideo, partnerVideo);
}
```

## Next Steps

1. **Update script.js** to use `TabbiMateVideo` instead of `vibechat1_ux.js`
2. **Store Makedo PIDs** in your user database for matching
3. **Test the flow** from language selection → match → video call
4. **Handle edge cases** (partner not logged in, connection drops, etc.)


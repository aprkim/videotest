# Testing Guide - Video Connection

## 🎯 What We Added

### 1. Updated `tabbimate_video.js`
Added the `getUsers()` method to get a list of available users from Makedo:

```javascript
// Get all available users
const users = await videoChat.getUsers('', 20);
// Returns: Array of user objects with { pid, username, email, status, ... }

// Filter or search
const marty = users.find(user => user.email === 'martybetz@gmail.com');
console.log('Marty\'s PID:', marty.pid);
```

### 2. Updated `BRIDGE_API_GUIDE.md`
Added documentation for `bridge.getUsersByQuery()` with:
- Parameters: `{ query, count, depth }`
- Return value: Array of user objects
- User object structure

### 3. Created `test_video_connection.html`
A complete test interface to verify video chat between two users!

---

## 🧪 How to Test (Same Browser, Two Tabs)

### Setup
1. Make sure your local server is running: `python3 -m http.server 8000`
2. Open **two browser tabs**:
   - Tab 1: `http://localhost:8000/test_video_connection.html`
   - Tab 2: `http://localhost:8000/test_video_connection.html`

### Test Flow

#### Tab 1 (April)
1. **Step 1**: Login with:
   - Email: `aprkim@gmail.com`
   - Password: `skycolor`
   - Click "Login as April"
   - ✅ Should see: "Logged in! PID: xxxxx"

2. **Step 2**: Click "Get Users List"
   - ✅ Should see list of users including Marty
   - Click on Marty's name to select

3. **Step 3**: Click "Create Channel & Start Video"
   - ✅ Should see your camera turn on
   - ✅ Channel created, waiting for partner...

#### Tab 2 (Marty)
1. **Step 1**: Login with:
   - Email: `martybetz@gmail.com`
   - Password: (Marty's password)
   - Click "Login as Marty"

2. **Step 2**: Click "Get Users List"
   - ✅ Should see April in the list
   - Click on April's name

3. **Step 3**: Click "Create Channel & Start Video"
   - ✅ Both videos should connect!
   - ✅ Tab 1 should now show Marty's video
   - ✅ Tab 2 should now show April's video

#### Test Controls
- Toggle video on/off (camera icon)
- Toggle audio on/off (mic icon)
- End call

---

## 🧪 How to Test (Two Different Computers/Browsers)

### Computer 1 (April)
```
http://localhost:8000/test_video_connection.html
OR
https://aprkim.github.io/videotest/test_video_connection.html (if deployed)
```

Login as April, get users, select Marty, create channel.

### Computer 2 (Marty)
Same URL, login as Marty, get users, select April, create channel.

Both should connect!

---

## 📋 Expected Console Output

### After Login:
```
[timestamp] Logging in as April...
[timestamp] [TabbiMateVideo] Logging in...
[timestamp] [TabbiMateVideo] Login successful: { email: 'aprkim@gmail.com', pid: '12345' }
[timestamp] [TabbiMateVideo] Initializing Bridge...
[timestamp] [TabbiMateVideo] Bridge initialized with WebSocket
[timestamp] ✓ April logged in successfully! PID: 12345
```

### After Get Users:
```
[timestamp] Getting list of available users...
[timestamp] [TabbiMateVideo] Getting users...
[timestamp] [TabbiMateVideo] Found users: 1
[timestamp] ✓ Found 1 users
```

### After Create Channel:
```
[timestamp] Creating channel with partner PID: 67890...
[timestamp] [TabbiMateVideo] Starting call with partner: 67890
[timestamp] [TabbiMateVideo] Creating channel...
[timestamp] [TabbiMateVideo] Channel created: channel_xyz123
[timestamp] [TabbiMateVideo] Getting member info...
[timestamp] [TabbiMateVideo] Member data: { pid: 'member_abc', pub_id: 'pub_abc', ... }
[timestamp] [TabbiMateVideo] Setting up Galene connection...
[timestamp] [TabbiMateVideo] Galene setup complete
[timestamp] [TabbiMateVideo] Creating local stream...
[timestamp] [TabbiMateVideo] Local stream created and displayed
[timestamp] [TabbiMateVideo] Joining channel...
[timestamp] [TabbiMateVideo] Call started!
[timestamp] ✓ Channel created and video call started!
```

### When Partner Joins:
```
[timestamp] [TabbiMateVideo] Successfully joined channel!
[timestamp] [TabbiMateVideo] Remote stream received: stream_123 pub_67890 camera
[timestamp] [TabbiMateVideo] Remote video displayed
```

---

## 🔍 What Each Bridge Function Does

### `bridge.getUsersByQuery({ query, count, depth })`
**Purpose**: Get list of users available for video chat

**Parameters**:
- `query`: Search string (empty = all users)
- `count`: Max results (default 20)
- `depth`: Detail level (1 = basic info)

**Returns**:
```javascript
[
  {
    pid: '12345',              // Use this for createQuickChatChannel!
    username: 'John Doe',
    email: 'john@example.com',
    status: 'available',
    is_me: false,
    avatar_pic: 'path/to/pic',
    ...
  }
]
```

**Usage in your app**:
```javascript
// After Makedo login, get list of users
const users = await videoChat.getUsers();

// Find user by email (for matching)
const partner = users.find(u => u.email === matchedUser.email);

// Start call with their PID
await videoChat.startCall(partner.pid, myVideo, partnerVideo);
```

### `bridge.createQuickChatChannel({ invited, message })`
**Purpose**: Create a 1-on-1 video channel

**Parameters**:
- `invited`: Partner's Makedo PID (from getUsersByQuery)
- `message`: Optional invitation message

**Returns**:
```javascript
{
  pid: 'channel_abc123',      // Channel ID
  members: [...],             // Array of member objects
  access_code: '413239',      // Default access code
  ...
}
```

**This is called automatically** inside `videoChat.startCall()` - you don't need to call it directly!

---

## 🐛 Troubleshooting

### "Must be logged in before getting users"
- Make sure you clicked "Login" first
- Check console for login errors

### "No users found"
- Both test users need Makedo accounts
- Try empty search query: `getUsers('', 20)`

### "Failed to create channel"
- Make sure you selected a user (clicked on name in list)
- Check that partner's PID is valid
- Check console for detailed error

### Video doesn't show
- Allow camera/microphone permissions
- Check browser console for WebRTC errors
- Make sure both users are logged in and joined channel

### Remote video doesn't appear
- Partner needs to also call `startCall()`
- Check that both users are in the same channel
- Wait a few seconds for WebRTC negotiation

---

## 🚀 Integration with Your App

Once this test works, integrate into `script.js`:

```javascript
// After matching found
async function onMatchFound(matchedUser) {
    // 1. Ensure Makedo login
    if (!videoChat.isLoggedIn()) {
        await showMakedoLoginModal();
    }
    
    // 2. Get list of users to find partner's PID
    const users = await videoChat.getUsers();
    const partner = users.find(u => u.email === matchedUser.email);
    
    if (!partner) {
        console.error('Partner not found in Makedo users');
        return;
    }
    
    // 3. Start video call
    const myVideo = document.getElementById('my-video');
    const partnerVideo = document.getElementById('partner-video');
    
    await videoChat.startCall(partner.pid, myVideo, partnerVideo);
}
```

---

## ✅ What Works Now

✅ Login to Makedo via `Fetch.login()`  
✅ Get list of users via `bridge.getUsersByQuery()`  
✅ Create 1-on-1 channel via `bridge.createQuickChatChannel()`  
✅ Setup WebRTC connection via Bridge  
✅ Display local video (your camera)  
✅ Display remote video (partner's camera)  
✅ Toggle video on/off  
✅ Toggle audio on/off  
✅ End call and cleanup  

Everything is in place! Test it out! 🎉


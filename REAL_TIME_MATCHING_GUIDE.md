# Real-Time Matching System - Testing Guide

## System Overview

The new real-time matching system uses Firebase Firestore to match two users for video chat sessions.

### Architecture

```
User A (Browser 1)          Firestore Cloud          User B (Browser 2)
     |                              |                        |
     | 1. Click "Start Video"       |                        |
     |----------------------------->|                        |
     | 2. Add to matching queue     |                        |
     |                              |<-----------------------|
     |                              | 3. Click "Start Video" |
     |                              | 4. Add to queue        |
     |                              | 5. Find match!         |
     |<-----------------------------|----------------------->|
     | 6. Both get session ID       |                        |
     |                              |                        |
     | 7. Redirect to video-chat.html?session={id}           |
     |<----------------------------------------------------->|
     | 8. Both connect via Makedo using session data         |
```

## Testing Steps

### Setup (Do Once)

#### 1. Ensure Firestore is Enabled
- Go to [Firebase Console](https://console.firebase.google.com/)
- Select project: `videotest-9435c`
- Click **Firestore Database** in left menu
- Make sure it's in "Production mode" or "Test mode"

#### 2. Update Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Matching queue - anyone can read/write their own entry
    match /matchingQueue/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Video sessions - anyone can read
    match /videoSessions/{sessionId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### Testing with Two Browsers

#### Browser 1: aprkim@gmail.com

1. **Sign In**
   - Go to https://aprkim.github.io/videotest/
   - Click "Log in"
   - Sign in with `aprkim@gmail.com`

2. **Setup Profile**
   - Go to Dashboard
   - Add Language: **English**, Level: **Basic**
   - Add Interest: **Food**
   - Save Changes

3. **Connect Video Account**
   - Click "Connect Video Account"
   - Login with Makedo credentials
   - Wait for "Connected" status

4. **Start Video Chat**
   - Click "Start Video Chat" button (top right or Quick Actions)
   - Should see "Matching Screen" with countdown
   - Wait for match...

#### Browser 2: oct14@test.com

1. **Sign In**
   - Open a NEW BROWSER (Chrome Incognito, Firefox Private, or Safari)
   - Go to https://aprkim.github.io/videotest/
   - Click "Log in"
   - Sign in with `oct14@test.com`

2. **Setup Profile**
   - Go to Dashboard  
   - Add Language: **English**, Level: **Basic**
   - Add Interest: **Food**
   - Save Changes

3. **Connect Video Account**
   - Click "Connect Video Account"
   - Login with Makedo credentials for oct14@test.com
   - Wait for "Connected" status

4. **Start Video Chat**
   - Click "Start Video Chat"
   - Should immediately match with aprkim!
   - Both browsers redirect to video-chat.html with same session ID

### Expected Behavior

**When Match Found:**
1. Both users instantly redirect to `video-chat.html?session=session_1234567890_xxxxx`
2. Page shows "Loading session..." then "Logging into Makedo..."
3. Each user logs into Makedo with their credentials
4. System finds partner by Makedo email
5. Video call connects automatically
6. Both can see each other's video

**Match Timeout:**
- If no match found within 60 seconds, shows error
- User returns to language selection

## Troubleshooting

### "No session ID provided"
- URL is missing `?session=...` parameter
- User accessed video-chat.html directly instead of through matching

### "Session not found"
- Session may have expired
- Check Firestore → videoSessions collection
- Verify session document exists

### "Partner not found"
- Partner's Makedo email doesn't match
- Check sessionData in console
- Verify both users logged into Makedo with correct emails

### "Video account not connected"
- User didn't connect Makedo account
- Go to Dashboard → Connect Video Account

### Match Never Happens
1. Check browser console for errors
2. Verify Firestore rules allow read/write
3. Check matchingQueue collection in Firestore
4. Ensure both users have:
   - Same language
   - Same level  
   - Both logged in
   - Both clicked "Start Video Chat"

## Firestore Structure

### Collection: `matchingQueue`
```javascript
{
  "{userId}": {
    userId: "abc123",
    email: "aprkim@gmail.com",
    language: "english",
    level: "Basic",
    interests: ["Food"],
    makedoEmail: "aprkim@gmail.com",
    timestamp: Timestamp,
    status: "waiting" | "matched",
    sessionId: "session_xxx" (when matched)
  }
}
```

### Collection: `videoSessions`
```javascript
{
  "session_1234567890_xxxxx": {
    sessionId: "session_1234567890_xxxxx",
    user1: {
      userId: "abc123",
      email: "aprkim@gmail.com",
      makedoEmail: "aprkim@gmail.com"
    },
    user2: {
      userId: "def456",
      email: "oct14@test.com",
      makedoEmail: "oct14@test.com"
    },
    language: "english",
    level: "Basic",
    createdAt: Timestamp,
    status: "active"
  }
}
```

## Console Debugging

### Key Log Messages

**Matching:**
```
=== Starting real-time matching ===
Joining matching queue with data: {...}
Added to matching queue: abc123
Looking for matches: ...
Match found! Session ID: session_xxx
```

**Video Chat:**
```
=== Video Chat Session: session_xxx ===
Session data loaded: {...}
My Makedo email: aprkim@gmail.com
Partner Makedo email: oct14@test.com
Logging into Makedo...
Looking for your partner...
Partner found! Connecting...
```

## Success Criteria

✅ Both users matched within seconds
✅ Both redirect to same session URL
✅ Both see partner's name in video chat
✅ Video streams connect successfully
✅ Can see and hear each other
✅ Controls (video/audio toggle) work
✅ End call returns to dashboard

## Next Steps

After testing works:
1. Add session duration timer
2. Add session history/analytics
3. Add reconnection logic if connection drops
4. Add multiple matching criteria (interests, etc.)
5. Add "Invite Friend" feature with direct session links


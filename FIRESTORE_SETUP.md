# Firestore Database Setup Guide

## 🔥 Firebase Firestore Configuration

This guide walks you through setting up Firestore Database for the real-time matching system.

---

## Step 1: Create Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your `videotest-9435c` project
3. Click on **Firestore Database** in the left sidebar
4. Click **Create database**
5. Choose **Start in test mode** (we'll add proper security rules later)
6. Select your preferred location (choose one close to your users, e.g., `us-central1`)
7. Click **Enable**

---

## Step 2: Configure Security Rules

After the database is created, set up security rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Matching Queue Collection
    match /matchingQueue/{userId} {
      // Users can read and write their own queue entry
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Allow users to read other waiting users for matching
      allow read: if request.auth != null;
    }
    
    // Video Sessions Collection
    match /videoSessions/{sessionId} {
      // Allow authenticated users to read any session
      allow read: if request.auth != null;
      
      // Allow authenticated users to create sessions
      allow create: if request.auth != null;
      
      // Only participants can update their own session
      allow update: if request.auth != null && 
        (resource.data.user1.userId == request.auth.uid || 
         resource.data.user2.userId == request.auth.uid);
    }
  }
}
```

3. Click **Publish**

---

## Step 3: Create Collections (Optional)

Firestore will automatically create collections when the first document is added. However, you can create them manually for testing:

### Collection: `matchingQueue`

**Purpose**: Stores users waiting to be matched

**Document Structure**:
```javascript
{
  userId: "string",           // Firebase Auth UID
  email: "string",            // User's email
  language: "string",         // e.g., "english"
  level: "string",            // e.g., "Basic", "Intermediate"
  interests: ["string"],      // Array of interests
  makedoEmail: "string",      // Makedo/video account email
  timestamp: Timestamp,       // Server timestamp
  status: "string",           // "waiting" or "matched"
  sessionId: "string | null", // Session ID when matched
  matchedWith: "string | null" // Partner's userId when matched
}
```

### Collection: `videoSessions`

**Purpose**: Stores active video chat sessions

**Document Structure**:
```javascript
{
  sessionId: "string",        // Unique session identifier
  user1: {
    userId: "string",         // Firebase Auth UID
    email: "string",          // User's email
    makedoEmail: "string"     // Makedo account email
  },
  user2: {
    userId: "string",
    email: "string",
    makedoEmail: "string"
  },
  language: "string",         // Session language
  level: "string",            // Session level
  createdAt: Timestamp,       // Session creation time
  status: "string"            // "active", "completed", "cancelled"
}
```

---

## Step 4: Create Indexes (Optional but Recommended)

For better query performance:

1. Go to **Firestore Database** → **Indexes** tab
2. Click **Create Index**
3. Create the following composite index:

**Collection**: `matchingQueue`
- Field: `status` (Ascending)
- Field: `language` (Ascending)
- Field: `timestamp` (Ascending)
- Query scope: Collection

This index allows efficient queries like:
```javascript
matchingQueue
  .where('status', '==', 'waiting')
  .where('language', '==', 'english')
  .orderBy('timestamp')
```

---

## Step 5: Test the Setup

### Using the Test Page

1. Open `test-matching.html` in your browser:
   ```
   https://aprkim.github.io/videotest/test-matching.html
   ```

2. Make sure you're logged in (you should see your email)

3. Open a second browser or incognito window with a different account

4. Click **"Start Matching"** in both browsers within 60 seconds

5. Both users should match and redirect to `video-chat.html`

### Manual Testing via Firebase Console

1. Go to **Firestore Database** → **Data** tab
2. You should see collections being created: `matchingQueue` and `videoSessions`
3. When users click "Start Matching", you should see documents appear in `matchingQueue`
4. When a match is found, both users should have `status: "matched"` and a `sessionId`
5. A new document should appear in `videoSessions` with both users' data

---

## Step 6: Monitor Real-Time Activity

### Check Queue Status

In `test-matching.html`, click **"Check Queue"** to see:
- How many users are currently waiting
- Their language/level preferences
- Their match status

### View Console Logs

The test page provides detailed console output for:
- ✅ Successful operations (green)
- ⚠️ Warnings (orange)
- ❌ Errors (red)
- ℹ️ Info messages (blue)

---

## Common Issues

### Issue 1: "Firebase not initialized"
**Solution**: Make sure `firebase-config.js` is loaded before `matching-service.js`

### Issue 2: "Permission denied"
**Solution**: Check that:
- User is logged in (Firebase Authentication)
- Security rules are published
- Rules allow the operation

### Issue 3: "No match found after 60 seconds"
**Solution**: 
- Make sure both users have the same language/level
- Check that both users clicked "Start Matching" within 60 seconds
- Verify both users have Makedo accounts connected

### Issue 4: Users can't read matchingQueue
**Solution**: Update security rules to allow authenticated users to read the entire collection:
```javascript
allow read: if request.auth != null;
```

---

## Testing Checklist

Before testing with real users, verify:

- [x] Firestore Database is created and enabled
- [x] Security rules are published
- [x] Both test users can log in successfully
- [x] Both users have Makedo accounts connected
- [x] Both users select the same language/level (English/Basic/Food)
- [x] `test-matching.html` page loads without errors
- [x] Console shows "Matching service initialized"
- [x] Clicking "Start Matching" adds user to queue
- [x] Both users match within 60 seconds
- [x] Users are redirected to `video-chat.html?session=SESSION_ID`

---

## Next Steps

After confirming the matching system works:

1. **Integrate into Dashboard**: Update `dashboard.html` to use the real-time matching when users click "Start Video Chat"

2. **Add Session Cleanup**: Implement a Cloud Function to clean up old sessions and queue entries

3. **Improve Matching Algorithm**: Add interest-based matching, skill level compatibility, etc.

4. **Add Analytics**: Track match success rate, average wait time, etc.

5. **Production Security Rules**: Tighten security rules for production use

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Firebase Console → **Firestore Database** → **Data** to see actual documents
3. Check Firebase Console → **Authentication** to verify users are logged in
4. Use `test-matching.html` to debug the matching flow

---

**🎉 Ready to test!** Open two browsers and start matching!


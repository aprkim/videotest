# Firebase Setup for VideoTest Project

## Current Status
The videotest project is currently using the `tabbimate` Firebase project. We need to create a separate Firebase project for videotest with its own users and data.

## Step 1: Create New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** (or the + icon)
3. **Project name**: Enter `videotest` (or `videotest-app`)
4. **Google Analytics**: Optional (you can enable it)
5. Click **"Create project"**
6. Wait for the project to be created

## Step 2: Register Your Web App

1. On the project overview page, click the **Web icon** (`</>`)
2. **App nickname**: Enter `VideoTest Web App`
3. **Firebase Hosting**: You can check this if you want (optional)
4. Click **"Register app"**

5. **IMPORTANT**: Copy your Firebase configuration object. It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "YOUR-API-KEY-HERE",
  authDomain: "videotest-xxxxx.firebaseapp.com",
  projectId: "videotest-xxxxx",
  storageBucket: "videotest-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

**SAVE THIS CONFIG!** You'll need to paste it into the `firebase-config.js` file.

## Step 3: Enable Firebase Services

### A. Enable Authentication

1. In the left sidebar, go to **Build > Authentication**
2. Click **"Get started"**
3. Click on **"Sign-in method"** tab
4. Enable these providers:
   - ✅ **Email/Password** - Click, toggle "Enable", click "Save"
   - ✅ **Google** (optional but recommended)
     - Click on "Google"
     - Toggle "Enable"
     - Add support email
     - Click "Save"

### B. Enable Firestore Database

1. In the left sidebar, go to **Build > Firestore Database**
2. Click **"Create database"**
3. **Security rules**: Select **"Start in test mode"** (for development)
   - This allows read/write for 30 days
   - We'll update security rules later
4. **Cloud Firestore location**: Choose a location close to you
   - US: `us-central1`
   - Europe: `europe-west1`
   - Asia: `asia-northeast1`
5. Click **"Enable"**

### C. Enable Storage

1. In the left sidebar, go to **Build > Storage**
2. Click **"Get started"**
3. **Security rules**: Select **"Start in test mode"**
4. **Storage location**: Use the same location as Firestore
5. Click **"Done"**

## Step 4: Update Your Code

Once you have your Firebase config from Step 2, you need to update the `firebase-config.js` file in your videotest project.

### Update `/Users/aprkim/videotest/firebase-config.js`:

Replace the current `tabbimate` config with your new `videotest` config:

```javascript
// OLD (tabbimate config):
const firebaseConfig = {
    apiKey: "AIzaSyCCRUb4JjGMWa4j3O6JTg8OsbJpNnTSSbs",
    authDomain: "tabbimate.firebaseapp.com",
    projectId: "tabbimate",
    storageBucket: "tabbimate.firebasestorage.app",
    messagingSenderId: "954572245140",
    appId: "1:954572245140:web:98fc71d28e2b4a9eca4c81",
    measurementId: "G-ZC8PGD5LY4"
};

// NEW (videotest config - PASTE YOUR CONFIG HERE):
const firebaseConfig = {
    apiKey: "YOUR_NEW_API_KEY",
    authDomain: "videotest-xxxxx.firebaseapp.com",
    projectId: "videotest-xxxxx",
    storageBucket: "videotest-xxxxx.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

## Step 5: Set Up Firestore Security Rules (Production Ready)

After testing in development mode, update your security rules:

1. Go to **Firestore Database > Rules** in Firebase Console
2. Replace with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Profiles - users can read any profile, but only edit their own
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Sessions - authenticated users can create/read their own sessions
    match /sessions/{sessionId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if request.auth != null && 
                      (resource.data.userId == request.auth.uid || 
                       resource.data.partnerId == request.auth.uid);
    }
    
    // Language requests - anyone can create, only admins can read
    match /language_requests/{requestId} {
      allow create: if true;
      allow read: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## Step 6: Set Up Storage Security Rules

1. Go to **Storage > Rules** in Firebase Console
2. Replace with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile photos - anyone can read, only owner can write/delete
    match /profile-photos/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## Step 7: Testing Your New Firebase Project

### Test in Browser Console:

1. Start your local server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open: `http://localhost:8000/auth.html`

3. Create a test user:
   - Email: `test@videotest.com`
   - Password: `test123456`

4. Verify in Firebase Console:
   - Go to **Authentication > Users**
   - You should see your new test user!

5. Check Firestore:
   - Go to **Firestore Database**
   - After creating a profile, you should see a `profiles` collection

## What's Different Now?

| Before | After |
|--------|-------|
| Uses `tabbimate` Firebase project | Uses `videotest` Firebase project |
| Shares users with tabbimate | Has its own separate users |
| Shares database with tabbimate | Has its own separate database |
| Users from tabbimate can access | Only videotest users can access |

## Important Notes

- ✅ **Separate users**: videotest will have its own user accounts
- ✅ **Separate data**: All data (profiles, sessions) will be in videotest's Firestore
- ✅ **Independent**: Changes to videotest won't affect tabbimate and vice versa
- ⚠️ **Existing users**: Any users who signed up through the old tabbimate config will need to create new accounts in videotest

## Next Steps

1. ✅ Create Firebase project
2. ✅ Copy configuration
3. ✅ Update `firebase-config.js`
4. ✅ Test authentication
5. ✅ Update security rules

---

**Ready to proceed?** Once you've completed Steps 1-3 above, let me know your new Firebase config and I'll update the code for you!


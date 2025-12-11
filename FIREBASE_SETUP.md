# Firebase Setup Guide for TabbiMate

## Overview
This guide will help you integrate Firebase into TabbiMate for authentication, database, and storage.

## Prerequisites
- A Google account
- TabbiMate project files

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `tabbimate` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Register Your Web App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `TabbiMate Web`
3. **Enable Firebase Hosting** (optional, for deployment)
4. Click "Register app"
5. **Copy the Firebase configuration object** - you'll need this!

Example config (yours will have different values):
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tabbimate.firebaseapp.com",
  projectId: "tabbimate",
  storageBucket: "tabbimate.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 3: Enable Firebase Services

### A. Authentication
1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable sign-in methods:
   - ✅ **Email/Password** (recommended)
   - ✅ **Google** (recommended for quick sign-in)
   - Optional: Facebook, GitHub, etc.

### B. Firestore Database
1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (for development)
   - Later, update security rules for production
4. Select a location (choose closest to your users)
5. Click "Enable"

### C. Storage
1. Go to **Build > Storage**
2. Click "Get started"
3. Choose **Start in test mode** (for development)
4. Click "Done"

## Step 4: Configure Your Code

### Update `firebase-config.js`

Open `/Users/aprkim/vibecoding-tabbimate/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",           // Replace with your actual API key
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## Step 5: Add Firebase SDK to HTML Files

Add these scripts **before your custom JavaScript** in your HTML files:

### For `index.html`:
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-storage-compat.js"></script>

<!-- Firebase Config -->
<script src="firebase-config.js"></script>
<script src="firebase-service.js"></script>

<!-- Your existing script.js -->
<script src="script.js"></script>
```

### For `profile.html`:
```html
<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-storage-compat.js"></script>

<!-- Cropper.js Library -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js"></script>

<!-- Firebase Config -->
<script src="firebase-config.js"></script>
<script src="firebase-service.js"></script>

<!-- Your existing profile.js -->
<script src="profile.js"></script>
```

## Step 6: Update Security Rules (Production)

### Firestore Rules
Go to **Firestore Database > Rules** and update:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Profiles - users can only read/write their own
    match /profiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Sessions - authenticated users can create/read/update
    match /sessions/{sessionId} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null;
    }
    
    // Language requests - anyone can submit
    match /language_requests/{requestId} {
      allow create: if true;
      allow read: if request.auth != null;
    }
  }
}
```

### Storage Rules
Go to **Storage > Rules** and update:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId}/{fileName} {
      allow read: if true;  // Public photos
      allow write: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 7: Firestore Data Structure

### Collections

#### `profiles`
```javascript
{
  userId: "uid123",
  email: "user@example.com",
  languages: [
    { id: "lang1", name: "English", level: "Native", match: true }
  ],
  interests: ["Cooking", "Travel"],
  location: {
    city: "San Francisco",
    country: "USA",
    coordinates: { lat: 37.7749, lon: -122.4194 },
    verified: true,
    displayName: "San Francisco, CA, USA"
  },
  photoUrl: "https://...",
  favorites: ["uid456", "uid789"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `sessions`
```javascript
{
  sessionId: "session123",
  userId: "uid123",
  partnerId: "uid456",
  language: "Spanish",
  level: "Intermediate",
  duration: 15,
  startTime: timestamp,
  endTime: timestamp,
  status: "active" | "completed",
  rating: 4
}
```

#### `language_requests`
```javascript
{
  language: "Portuguese",
  email: "user@example.com",
  createdAt: timestamp,
  status: "pending" | "approved" | "rejected"
}
```

## Step 8: Usage Examples

### Initialize Firebase (in your code)
```javascript
// This runs automatically when firebase-config.js loads
initializeFirebase();
```

### Authentication
```javascript
// Sign up
const result = await firebaseService.signUp("user@example.com", "password123");
if (result.success) {
  console.log("User created:", result.user);
}

// Sign in
const result = await firebaseService.signIn("user@example.com", "password123");
if (result.success) {
  console.log("User logged in:", result.user);
}

// Sign in with Google
const result = await firebaseService.signInWithGoogle();

// Sign out
await firebaseService.signOut();

// Check auth state
firebaseService.onAuthStateChanged((user) => {
  if (user) {
    console.log("User is signed in:", user);
  } else {
    console.log("User is signed out");
  }
});
```

### Profile Management
```javascript
// Save profile
await firebaseService.saveProfile({
  languages: profile.languages,
  interests: profile.interests,
  location: profile.location,
  photoUrl: profile.photoUrl
});

// Get profile
const result = await firebaseService.getProfile();
if (result.success) {
  console.log("Profile:", result.profile);
}

// Listen to real-time updates
firebaseService.listenToProfile((result) => {
  if (result.success) {
    console.log("Profile updated:", result.profile);
  }
});
```

### Photo Upload
```javascript
// Upload photo
const file = event.target.files[0];
const result = await firebaseService.uploadProfilePhoto(file);
if (result.success) {
  console.log("Photo URL:", result.url);
  // Save URL to profile
  await firebaseService.saveProfile({ photoUrl: result.url });
}
```

## Step 9: Migration from localStorage

To migrate existing localStorage data to Firebase:

```javascript
// In profile.js or script.js
async function migrateToFirebase() {
  // Get localStorage data
  const localProfile = localStorage.getItem('tabbimate_profile_v1');
  if (!localProfile) return;

  const profile = JSON.parse(localProfile);
  
  // Save to Firebase
  const result = await firebaseService.saveProfile(profile);
  if (result.success) {
    console.log("Profile migrated to Firebase");
    // Optional: clear localStorage
    // localStorage.removeItem('tabbimate_profile_v1');
  }
}

// Run migration after user signs in
firebaseService.onAuthStateChanged(async (user) => {
  if (user) {
    await migrateToFirebase();
  }
});
```

## Step 10: Testing

### Test Authentication
1. Open `index.html` in browser
2. Open browser console (F12)
3. Test sign-up:
   ```javascript
   await firebaseService.signUp("test@example.com", "password123");
   ```
4. Check Firebase Console > Authentication to see new user

### Test Database
1. Save a profile:
   ```javascript
   await firebaseService.saveProfile({
     languages: [{ id: "1", name: "English", level: "Native", match: true }],
     interests: ["Test"],
     location: { city: "Test City", country: "Test Country" }
   });
   ```
2. Check Firebase Console > Firestore Database to see data

### Test Storage
1. Upload a photo through the profile page
2. Check Firebase Console > Storage to see uploaded file

## Deployment with Firebase Hosting (Optional)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init

# Select:
# - Hosting
# - Use existing project
# - Public directory: . (current directory)
# - Single page app: No

# Deploy
firebase deploy
```

Your site will be live at: `https://your-project-id.web.app`

## Troubleshooting

### "Firebase not defined"
- Make sure Firebase SDK scripts are loaded before your code
- Check browser console for script loading errors

### "Permission denied"
- Check Firestore/Storage security rules
- Verify user is authenticated
- Check that userId matches authenticated user

### CORS errors
- Enable appropriate origins in Firebase Console
- Check Storage CORS configuration

### Data not syncing
- Check internet connection
- Verify Firestore rules allow read/write
- Check browser console for errors

## Next Steps

1. ✅ Create Firebase project
2. ✅ Add Firebase SDK to HTML files
3. ✅ Update `firebase-config.js` with your config
4. ✅ Test authentication
5. ✅ Test profile save/load
6. ✅ Update security rules for production
7. ✅ Deploy to Firebase Hosting

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
- [Stack Overflow - Firebase](https://stackoverflow.com/questions/tagged/firebase)

---

**Status**: Ready for integration  
**Created**: December 11, 2025  
**Version**: 1.0.0


# Enable Google Sign-In for VideoTest

## Problem
Google sign-in button not working on https://aprkim.github.io/videotest/

## Solution Steps

### 1. Enable Google Sign-In Provider in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **videotest-9435c**
3. Click on **Authentication** in the left sidebar
4. Click on **Sign-in method** tab
5. Find **Google** in the providers list
6. Click on **Google**
7. Toggle **Enable** to ON
8. Set the **Project support email** (use your email: aprkim@gmail.com)
9. Click **Save**

### 2. Add Authorized Domain (if needed)

Still in the **Sign-in method** tab:

1. Scroll down to **Authorized domains**
2. Make sure these domains are listed:
   - `aprkim.github.io` ✅
   - `localhost` ✅ (for local testing)
3. If `aprkim.github.io` is not there, click **Add domain** and add it

### 3. Test Google Sign-In

After enabling:

1. Go to https://aprkim.github.io/videotest/auth.html
2. Click **Continue with Google** button
3. A Google sign-in popup should appear
4. Select your Google account
5. You should be signed in and redirected to the dashboard

## Common Errors and Solutions

### Error: "This app is not authorized to use Firebase Authentication"
**Solution**: Enable Google provider in Firebase Console (Step 1)

### Error: "Pop-up blocked"
**Solution**: Allow pop-ups for aprkim.github.io in your browser settings

### Error: "unauthorized-domain"
**Solution**: Add aprkim.github.io to authorized domains (Step 2)

### Error: "auth/popup-closed-by-user"
**Solution**: User closed the popup - not an error, just cancelled

## How to Check if It's Working

Open browser console (F12) and look for these logs:
```
=== Google Sign In Initiated ===
Google sign in result: {success: true, user: {...}}
Google sign in successful, redirecting to dashboard
```

If you see an error instead:
```
Google sign in failed: [error message]
```

Share the error message for further debugging.

## Current Status

✅ Code is implemented correctly
✅ Firebase config is correct
❓ Google provider needs to be enabled in Firebase Console (most likely issue)


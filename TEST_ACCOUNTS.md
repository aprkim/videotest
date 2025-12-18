# Test Accounts for Tabbimate

This document contains test accounts for development and testing purposes.

## Quick Start - Automated Creation

**Easiest Method:** Open this file in your browser:
```
create-test-accounts.html
```

Click "Create All Test Accounts" and wait for the process to complete. This will automatically:
- Create 5 Firebase authentication accounts
- Set up complete profiles in Firestore
- Configure languages and interests for each user

## Test Account Credentials

All accounts use the same password: **Test123456!**

### Account 1: Alex Chen
- **Email:** test1@tabbimate.com
- **Password:** Test123456!
- **Location:** San Francisco, CA
- **Languages:** English (Native), Spanish (Intermediate)
- **Interests:** Travel, Music, Cooking
- **Bio:** Language enthusiast passionate about learning Spanish

### Account 2: Maria Garcia
- **Email:** test2@tabbimate.com
- **Password:** Test123456!
- **Location:** Madrid, Spain
- **Languages:** Spanish (Native), English (Advanced)
- **Interests:** Movies, Technology, Sports
- **Bio:** Native Spanish speaker looking to practice English

### Account 3: Sophie Laurent
- **Email:** test3@tabbimate.com
- **Password:** Test123456!
- **Location:** Paris, France
- **Languages:** French (Native), English (Professional)
- **Interests:** Reading, Photography, Art
- **Bio:** French teacher helping others learn the language

### Account 4: Yuki Tanaka
- **Email:** test4@tabbimate.com
- **Password:** Test123456!
- **Location:** Tokyo, Japan
- **Languages:** Japanese (Native), English (Intermediate)
- **Interests:** Anime, Gaming, Cooking
- **Bio:** Japanese speaker wanting to improve English skills

### Account 5: Sarah Kim
- **Email:** test5@tabbimate.com
- **Password:** Test123456!
- **Location:** Los Angeles, CA
- **Languages:** English (Native), Korean (Basic)
- **Interests:** K-pop, Travel, Food
- **Bio:** Beginning my Korean language journey

## Creation Methods

### Method 1: Automated HTML Tool (Recommended)

1. Open `create-test-accounts.html` in a web browser
2. Click "Create All Test Accounts"
3. Wait for all accounts to be created
4. Done! All profiles are automatically configured

### Method 2: Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/project/videotest-9435c/authentication/users)
2. Click "Add user"
3. Enter email and password for each account
4. Sign in to each account at `auth.html` to complete the profile

### Method 3: Manual Sign-Up

1. Go to `auth.html`
2. Click "Sign Up"
3. Enter credentials from the list above
4. Complete profile with the information provided
5. Sign out and repeat for each account

## Testing Scenarios

### Language Matching
- **English ↔ Spanish:** Use Account 1 (Alex) and Account 2 (Maria)
- **English ↔ French:** Use Account 3 (Sophie) with Account 1, 4, or 5
- **English ↔ Japanese:** Use Account 4 (Yuki) with Account 1, 2, 3, or 5
- **English ↔ Korean:** Use Account 5 (Sarah) with any other account

### Interest Matching
- **Cooking:** Accounts 1, 4
- **Travel:** Accounts 1, 5
- **Technology:** Account 2
- **Art/Photography:** Account 3

## Firestore Data Structure

Each test account will have data in two collections:

### `/users/{userId}`
```json
{
  "name": "User Name",
  "email": "test@tabbimate.com",
  "languages": [
    { "language": "English", "level": "Native" }
  ],
  "interests": ["Travel", "Music", "Cooking"],
  "location": "City, Country",
  "bio": "User bio text",
  "isTestAccount": true,
  "createdAt": "2024-xx-xx..."
}
```

### localStorage Keys
- `videotest_profile_{userId}`: User profile data
- `videotest_stats_{userId}`: User statistics
- `firebase:authUser:{apiKey}:...`: Firebase auth session

## Cleanup

To remove test accounts:
1. Go to [Firebase Console - Authentication](https://console.firebase.google.com/project/videotest-9435c/authentication/users)
2. Select test accounts (look for @tabbimate.com emails or isTestAccount: true flag)
3. Click Delete

Or use the Firebase Console Firestore section to delete user documents manually.

## Notes

- All test accounts are marked with `isTestAccount: true` in Firestore
- Test accounts can be reset by deleting and recreating them
- For video chat testing, you'll need to connect Makedo accounts separately
- Default password works for all accounts for easy testing

## Troubleshooting

**"Email already in use" error:**
- Account already exists
- Use existing credentials or delete account from Firebase Console

**"Profile not loading" error:**
- Sign in to the account
- Go to dashboard.html
- Complete the profile manually
- Or recreate the account using the automated tool

**"Can't start video chat" error:**
- Make sure languages are added to the profile
- Check that at least one language is configured
- Try signing out and signing back in

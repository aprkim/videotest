# Security Guide - Firebase Credentials

## 🔐 Important Security Practices

### Never Commit Credentials to Git

The following files are already in `.gitignore` and should NEVER be committed:
- `*firebase*adminsdk*.json` - Firebase service account keys
- `*service*account*.json` - Any service account credentials
- `.env` - Environment variables with secrets

### Setting Up Firebase Admin SDK (for Node.js scripts)

#### Option 1: Environment Variable (Recommended)

1. **Download your service account key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Project Settings > Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file to a secure location **outside your git repository**

2. **Set the environment variable:**
   ```bash
   # On Mac/Linux (add to ~/.zshrc or ~/.bashrc for persistence)
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"

   # On Windows (PowerShell)
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\serviceAccountKey.json"
   ```

3. **Run your Node.js scripts:**
   ```bash
   node list-firebase-users.js
   ```

#### Option 2: Store in Project (if needed)

If you must store the key in your project:

1. Create a `credentials/` folder (already in `.gitignore`)
2. Move your service account key there:
   ```bash
   mkdir -p credentials
   mv ~/Downloads/videotest-*-firebase-adminsdk-*.json credentials/serviceAccountKey.json
   ```

3. Update your scripts to use the local path:
   ```javascript
   const serviceAccount = require('./credentials/serviceAccountKey.json');
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount)
   });
   ```

### Frontend Firebase Config (firebase-config.js)

The client-side Firebase config contains public API keys and is safe to commit. These keys are meant to be public and are protected by:
- Firebase Security Rules
- App restrictions in Google Cloud Console
- Domain restrictions

## 🚨 If Credentials Are Exposed

If you accidentally expose credentials:

1. **Immediately revoke the key:**
   - Firebase Console > Project Settings > Service Accounts
   - Find and delete the compromised key

2. **Generate a new key** following the steps above

3. **Check git history:**
   ```bash
   git log --all --full-history -- "*credentials*" "*.json"
   ```

4. **If committed, remove from history:**
   ```bash
   # Use git-filter-branch or BFG Repo-Cleaner
   # Or create a new repository if it's early in development
   ```

## ✅ Current Protection Status

- [x] `.gitignore` updated with credential patterns
- [x] Service account key in Downloads (not in repo)
- [x] Environment variable setup documented
- [ ] **ACTION REQUIRED:** Revoke exposed service account key
- [ ] **ACTION REQUIRED:** Generate new service account key

# Makedo Login Fix - ES6 Module Import

## Problem
The Makedo video login was failing because we were incorrectly trying to use `Fetch` from `protocol.js`. After reviewing `vibechat1_ux.js`, we discovered that:
- `protocol.js` has nothing to do with `Fetch`
- The correct approach is to import `Fetch` directly from `fetch.js` as an ES6 module

## Solution
Updated all files to properly import and use `Fetch` from `https://proto2.makedo.com:8883/ux/scripts/fetch.js`:

### Files Changed

1. **app.html**
   - Removed jQuery and protocol.js scripts (not needed)
   - Updated the module script to import both `VibeChat` and `Fetch`
   - Made `Fetch` available globally via `window.Fetch`
   - Changed `script.js` to load as a module

2. **script.js**
   - Uses `window.Fetch.login()` (loaded from app.html)
   - Removed the incorrect protocol.js fallback code
   - Simplified login flow

3. **dashboard.html**
   - Removed jQuery and protocol.js scripts
   - Changed main script tag to `type="module"`
   - Added ES6 import for `Fetch` at the top of the script
   - Uses `Fetch.login()` directly
   - Removed the incorrect waiting/fallback code

4. **profile.html**
   - Removed jQuery and protocol.js scripts
   - Changed `profile.js` script tag to `type="module"`

5. **profile.js**
   - Added ES6 import for `Fetch` at the top
   - Uses `Fetch.login()` directly
   - Removed the incorrect waiting/fallback code

## How It Works (Like vibechat1_ux.js)

```javascript
// Import Fetch as ES6 module
import Fetch from 'https://proto2.makedo.com:8883/ux/scripts/fetch.js';

// Use it to login
const result = await Fetch.login({ email, password });

if (result.status === 'loggedIn') {
    // Success!
    console.log('Logged in:', result.email, result.pid);
}
```

## Testing
The local server is running on http://localhost:8000

Test the Makedo login on:
- Dashboard: http://localhost:8000/dashboard.html
- Profile: http://localhost:8000/profile.html
- App: http://localhost:8000/app.html (as guest or logged-in user)

## Important Fix: VibeChat Initialization

**Issue**: `VibeChat` was being instantiated on the dashboard and profile pages, but it expects specific DOM elements (like `audioBtn`, `videoBtn`, `joinBtn`, `exitBtn`) that only exist on `app.html`. This caused a `TypeError: Cannot read properties of null`.

**Solution**: 
- Dashboard and profile pages now ONLY handle Makedo login and save the state to localStorage
- They do NOT instantiate `VibeChat`
- `VibeChat` is only instantiated on `app.html` where the actual video chat UI exists
- When a user goes to `app.html`, it reads the Makedo login state from localStorage and initializes VibeChat if needed

## Expected Behavior
1. Click "Connect Video Account" or the Makedo login button (on dashboard or profile)
2. Enter email (e.g., `aprkim@gmail.com`) and password
3. The login should call `Fetch.login()` from `fetch.js`
4. On success, you should see `status: 'loggedIn'` in the console
5. The UI should update to show "Connected" status
6. Login state is saved to localStorage
7. When you navigate to `app.html` and start a video chat, VibeChat will be initialized there


# Testing with Two Aprils - Workaround

## Issue
When using video-chat.html, both April sessions try to connect to Marty (Martin Scott Betz) if he appears in the user list, instead of connecting to each other.

## Solution: Use the Test Page

Instead of the dashboard flow, use the dedicated test page which lets you **select** who to connect to:

### Steps:

**Browser 1 (Chrome):**
1. Go to: `https://aprkim.github.io/videotest/test_video_connection.html`
2. Click "Login as April" (email and password pre-filled)
3. Click "Get Users List"
4. **You'll see a list of available users** (might include yourself from other sessions, Marty, etc.)
5. **Don't click anyone yet** - wait for Browser 2

**Browser 2 (Firefox/Safari):**
1. Go to: `https://aprkim.github.io/videotest/test_video_connection.html`
2. Click "Login as April"
3. Click "Get Users List"
4. **Look for another user in the list** (might show as "April" or "aprkim@gmail.com")
5. **Click on that user** to select them
6. Click "Create Channel & Start Video"
7. **Video should connect!** 🎥

**Browser 1:**
- Will automatically receive the connection from Browser 2
- Both videos appear!

---

## Why This Works Better

The test page:
- ✅ Shows you ALL available users
- ✅ Lets you SELECT who to connect to
- ✅ Doesn't auto-connect to the first user
- ✅ Better for testing with multiple sessions

---

## Alternative: Manually Connect to Each Other

If you see multiple users, you can:
1. Browser 1: Select the user that appeared after Browser 2 logged in
2. Browser 2: Select the user that appeared after Browser 1 logged in
3. Both create channels
4. You'll be in the same video session!

---

## Future Fix

To fix the auto-connect issue in video-chat.html, we could:
1. Add a user selection screen before auto-connecting
2. Filter out unavailable users
3. Prioritize users who just joined (timestamps)
4. Allow manual partner selection

For now, use the test page for best results! 🚀


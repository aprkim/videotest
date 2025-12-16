/**
 * Firebase Configuration for TabbiMate
 * 
 * Setup Instructions:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project (or select existing)
 * 3. Click "Add app" and choose "Web"
 * 4. Copy your Firebase config object
 * 5. Replace the config below with your actual values
 * 6. Enable Authentication (Email/Password, Google, etc.)
 * 7. Enable Firestore Database
 * 8. Enable Storage (for profile photos)
 */

// Firebase configuration for VideoTest Project
const firebaseConfig = {
    apiKey: "AIzaSyCDa8BY71QImZ2_SpSklCitqU4dKFdoJzs",
    authDomain: "videotest-9435c.firebaseapp.com",
    projectId: "videotest-9435c",
    storageBucket: "videotest-9435c.firebasestorage.app",
    messagingSenderId: "698822546154",
    appId: "1:698822546154:web:e449341f3bee5e11333d93"
};
  

// Initialize Firebase
let app, auth, db, storage;

function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded. Make sure to include Firebase scripts in HTML.');
        return false;
    }

    try {
        // Check if Firebase is already initialized
        if (firebase.apps.length === 0) {
            // Initialize Firebase only if not already initialized
            app = firebase.initializeApp(firebaseConfig);
        } else {
            // Use existing app
            app = firebase.app();
        }
        
        auth = firebase.auth();
        db = firebase.firestore();
        
        // Only initialize storage if the SDK is loaded
        if (firebase.storage) {
            storage = firebase.storage();
            console.log('Firebase Storage initialized');
        } else {
            console.log('Firebase Storage SDK not loaded - this is OK for auth-only pages');
            storage = null;
        }

        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Auto-initialize Firebase when this script loads
initializeFirebase();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, initializeFirebase };
}


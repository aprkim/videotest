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

// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyCCRUb4JjGMWa4j3O6JTg8OsbJpNnTSSbs",
    authDomain: "tabbimate.firebaseapp.com",
    projectId: "tabbimate",
    storageBucket: "tabbimate.firebasestorage.app",
    messagingSenderId: "954572245140",
    appId: "1:954572245140:web:98fc71d28e2b4a9eca4c81",
    measurementId: "G-ZC8PGD5LY4"
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
        if (typeof firebase.storage === 'function') {
            storage = firebase.storage();
        } else {
            console.warn('Firebase Storage SDK not loaded');
            storage = null;
        }

        console.log('Firebase initialized successfully');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, initializeFirebase };
}


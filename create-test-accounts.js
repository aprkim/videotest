/**
 * Create Test Accounts Script
 *
 * This script creates test Firebase accounts for testing purposes.
 * Run with: node create-test-accounts.js
 *
 * Note: This uses Firebase Admin SDK which requires a service account key.
 * For simple testing, you can also use the web interface or create accounts manually.
 */

// const admin = require('firebase-admin');

// Test accounts to create
const testAccounts = [
    {
        email: 'test1@tabbimate.com',
        password: 'test123456',
        displayName: 'Test User 1',
        profile: {
            languages: [
                { language: 'English', level: 'Native' },
                { language: 'Spanish', level: 'Intermediate' }
            ],
            interests: ['Travel', 'Music', 'Cooking'],
            location: 'San Francisco, CA',
            bio: 'Language enthusiast passionate about learning Spanish'
        }
    },
    {
        email: 'test2@tabbimate.com',
        password: 'test123456',
        displayName: 'Test User 2',
        profile: {
            languages: [
                { language: 'Spanish', level: 'Native' },
                { language: 'English', level: 'Advanced' }
            ],
            interests: ['Movies', 'Technology', 'Sports'],
            location: 'Madrid, Spain',
            bio: 'Native Spanish speaker looking to practice English'
        }
    },
    {
        email: 'test3@tabbimate.com',
        password: 'test123456',
        displayName: 'Test User 3',
        profile: {
            languages: [
                { language: 'French', level: 'Native' },
                { language: 'English', level: 'Professional' }
            ],
            interests: ['Reading', 'Photography', 'Art'],
            location: 'Paris, France',
            bio: 'French teacher helping others learn the language'
        }
    },
    {
        email: 'test4@tabbimate.com',
        password: 'test123456',
        displayName: 'Test User 4',
        profile: {
            languages: [
                { language: 'Japanese', level: 'Native' },
                { language: 'English', level: 'Intermediate' }
            ],
            interests: ['Anime', 'Gaming', 'Cooking'],
            location: 'Tokyo, Japan',
            bio: 'Japanese speaker wanting to improve English skills'
        }
    },
    {
        email: 'test5@tabbimate.com',
        password: 'test123456',
        displayName: 'Test User 5',
        profile: {
            languages: [
                { language: 'English', level: 'Native' },
                { language: 'Korean', level: 'Basic' }
            ],
            interests: ['K-pop', 'Travel', 'Food'],
            location: 'Los Angeles, CA',
            bio: 'Beginning my Korean language journey'
        }
    }
];

// Firebase project configuration
const firebaseConfig = {
    projectId: "videotest-9435c",
    // Add your service account key path here
    // credential: admin.credential.cert(require('./serviceAccountKey.json'))
};

async function createTestAccounts() {
    console.log('🔥 Firebase Test Account Creator\n');
    console.log('⚠️  IMPORTANT: This script requires Firebase Admin SDK and a service account key.');
    console.log('For simple testing, use the manual method below instead.\n');

    console.log('📋 Test Accounts to Create:\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    testAccounts.forEach((account, index) => {
        console.log(`Account ${index + 1}:`);
        console.log(`  Email:    ${account.email}`);
        console.log(`  Password: ${account.password}`);
        console.log(`  Name:     ${account.displayName}`);
        console.log(`  Location: ${account.profile.location}`);
        console.log(`  Languages: ${account.profile.languages.map(l => `${l.language} (${l.level})`).join(', ')}`);
        console.log(`  Interests: ${account.profile.interests.join(', ')}`);
        console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('📝 MANUAL SETUP INSTRUCTIONS:\n');
    console.log('1. Go to: https://videotest-9435c.firebaseapp.com/auth.html');
    console.log('2. For each account above:');
    console.log('   - Click "Sign Up"');
    console.log('   - Enter the email and password');
    console.log('   - Complete the profile with the information listed');
    console.log('   - Sign out and repeat for the next account\n');

    console.log('🚀 ALTERNATIVE: Use Firebase Console\n');
    console.log('1. Go to: https://console.firebase.google.com/project/videotest-9435c/authentication/users');
    console.log('2. Click "Add user"');
    console.log('3. Enter email and password for each account');
    console.log('4. Then sign in to each account to complete the profile\n');

    console.log('💡 For automated creation, you need to:');
    console.log('1. Download your service account key from Firebase Console');
    console.log('2. Save it as serviceAccountKey.json in this directory');
    console.log('3. Uncomment the credential line in this script');
    console.log('4. Run: npm install firebase-admin');
    console.log('5. Run: node create-test-accounts.js\n');
}

// Run the function
createTestAccounts();

// Export test accounts for reference
module.exports = { testAccounts };

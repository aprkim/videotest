/**
 * Create test26 account on Firebase and Makedo
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('/Users/aprkim/중요키 -2025/videotest-9435c-firebase-adminsdk-fbsvc-60ef7ff8b2.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const account = {
    email: 'test26@tabbimate.test',
    password: 'test123456',
    displayName: 'Test User 26',
    profile: {
        languages: [
            { language: 'English', level: 'Basic' }
        ],
        interests: [],
        location: '',
        bio: 'Test account 26',
        connectedTo: 'makedo'
    }
};

async function createAccount() {
    try {
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email: account.email,
            password: account.password,
            displayName: account.displayName
        });

        console.log(`✅ Created Firebase auth user: ${account.email}`);
        console.log(`   UID: ${userRecord.uid}`);

        // Create user profile in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            email: account.email,
            displayName: account.displayName,
            languages: account.profile.languages,
            interests: account.profile.interests,
            location: account.profile.location,
            bio: account.profile.bio,
            connectedTo: account.profile.connectedTo,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Created Firestore profile for: ${account.email}`);
        console.log(`   Language: English (Basic)`);
        console.log(`   Connected to: makedo`);
        console.log('');
        console.log('✨ Account created successfully!');
        console.log('   Email: test26@tabbimate.test');
        console.log('   Password: test123456');
        console.log('');
        console.log('Next step: Register on Makedo server');
        console.log('Open: http://localhost:8080/register-test26.html');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating account:', error.message);
        process.exit(1);
    }
}

createAccount();

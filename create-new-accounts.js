/**
 * Create 5 New Test Accounts (test21-test25)
 * All accounts:
 * - Email: test21@tabbimate.test to test25@tabbimate.test
 * - Password: test123456
 * - Language: English (Basic)
 * - Connected to makedo user
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('/Users/aprkim/중요키 -2025/videotest-9435c-firebase-adminsdk-fbsvc-60ef7ff8b2.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

// New accounts to create
const newAccounts = [
    {
        email: 'test21@tabbimate.test',
        password: 'test123456',
        displayName: 'Test User 21',
        profile: {
            languages: [
                { language: 'English', level: 'Basic' }
            ],
            interests: [],
            location: '',
            bio: 'Test account 21',
            connectedTo: 'makedo'
        }
    },
    {
        email: 'test22@tabbimate.test',
        password: 'test123456',
        displayName: 'Test User 22',
        profile: {
            languages: [
                { language: 'English', level: 'Basic' }
            ],
            interests: [],
            location: '',
            bio: 'Test account 22',
            connectedTo: 'makedo'
        }
    },
    {
        email: 'test23@tabbimate.test',
        password: 'test123456',
        displayName: 'Test User 23',
        profile: {
            languages: [
                { language: 'English', level: 'Basic' }
            ],
            interests: [],
            location: '',
            bio: 'Test account 23',
            connectedTo: 'makedo'
        }
    },
    {
        email: 'test24@tabbimate.test',
        password: 'test123456',
        displayName: 'Test User 24',
        profile: {
            languages: [
                { language: 'English', level: 'Basic' }
            ],
            interests: [],
            location: '',
            bio: 'Test account 24',
            connectedTo: 'makedo'
        }
    },
    {
        email: 'test25@tabbimate.test',
        password: 'test123456',
        displayName: 'Test User 25',
        profile: {
            languages: [
                { language: 'English', level: 'Basic' }
            ],
            interests: [],
            location: '',
            bio: 'Test account 25',
            connectedTo: 'makedo'
        }
    }
];

async function createAccount(accountData) {
    try {
        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email: accountData.email,
            password: accountData.password,
            displayName: accountData.displayName
        });

        console.log(`✅ Created auth user: ${accountData.email} (UID: ${userRecord.uid})`);

        // Create user profile in Firestore
        await db.collection('users').doc(userRecord.uid).set({
            email: accountData.email,
            displayName: accountData.displayName,
            languages: accountData.profile.languages,
            interests: accountData.profile.interests,
            location: accountData.profile.location,
            bio: accountData.profile.bio,
            connectedTo: accountData.profile.connectedTo,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Created Firestore profile for: ${accountData.email}`);
        console.log(`   - Language: English (Basic)`);
        console.log(`   - Connected to: makedo\n`);

        return { success: true, uid: userRecord.uid };
    } catch (error) {
        console.error(`❌ Error creating ${accountData.email}:`, error.message);
        return { success: false, error: error.message };
    }
}

async function createAllAccounts() {
    console.log('🔥 Creating 5 New Test Accounts\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const results = [];

    for (const account of newAccounts) {
        const result = await createAccount(account);
        results.push({ email: account.email, ...result });
    }

    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('📊 Summary:\n');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successfully created: ${successful.length} accounts`);
    successful.forEach(r => console.log(`   - ${r.email} (UID: ${r.uid})`));

    if (failed.length > 0) {
        console.log(`\n❌ Failed to create: ${failed.length} accounts`);
        failed.forEach(r => console.log(`   - ${r.email}: ${r.error}`));
    }

    console.log('\n✨ All accounts use:');
    console.log('   - Password: test123456');
    console.log('   - Language: English (Basic)');
    console.log('   - Connected to: makedo');
    console.log('\n');

    process.exit(0);
}

// Run the script
createAllAccounts().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});

// List all Firebase users
// Run with: node list-firebase-users.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (uses environment variable GOOGLE_APPLICATION_CREDENTIALS)
// Or you can use a service account key file
try {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: 'videotest-9435c'
    });
} catch (error) {
    console.log('Using existing Firebase app instance');
}

const auth = admin.auth();
const db = admin.firestore();

async function listAllUsers() {
    try {
        console.log('📋 Fetching all Firebase users...\n');

        // List all users from Authentication
        const listUsersResult = await auth.listUsers(1000); // Max 1000 users

        console.log(`Found ${listUsersResult.users.length} users:\n`);
        console.log('═══════════════════════════════════════════════════════════════');

        for (const user of listUsersResult.users) {
            console.log(`Email: ${user.email}`);
            console.log(`UID: ${user.uid}`);
            console.log(`Display Name: ${user.displayName || 'Not set'}`);
            console.log(`Created: ${user.metadata.creationTime}`);
            console.log(`Last Sign In: ${user.metadata.lastSignInTime || 'Never'}`);
            console.log(`Email Verified: ${user.emailVerified}`);

            // Try to get Firestore profile data
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const data = userDoc.data();
                    console.log(`Profile Data:`);
                    console.log(`  - Languages: ${data.languages?.length || 0} languages`);
                    console.log(`  - Interests: ${data.interests?.length || 0} interests`);
                    if (data.languages) {
                        data.languages.forEach(lang => {
                            console.log(`    • ${lang.language} (${lang.level})`);
                        });
                    }
                    if (data.interests) {
                        console.log(`    Interests: ${data.interests.join(', ')}`);
                    }
                } else {
                    console.log(`Profile Data: No Firestore document`);
                }
            } catch (firestoreError) {
                console.log(`Profile Data: Error fetching - ${firestoreError.message}`);
            }

            console.log('───────────────────────────────────────────────────────────────');
        }

        // Filter for test users
        const testUsers = listUsersResult.users.filter(u =>
            u.email && u.email.includes('@tabbimate.test')
        );

        console.log(`\n🧪 Test Users (@tabbimate.test): ${testUsers.length}`);
        testUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.uid})`);
        });

    } catch (error) {
        console.error('Error listing users:', error);

        if (error.code === 'app/invalid-credential') {
            console.log('\n⚠️  Authentication Error:');
            console.log('You need to set up Firebase Admin credentials.');
            console.log('\nOptions:');
            console.log('1. Download service account key from Firebase Console:');
            console.log('   Project Settings > Service Accounts > Generate New Private Key');
            console.log('2. Set environment variable:');
            console.log('   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/serviceAccountKey.json"');
            console.log('3. Run this script again');
        }
    }
}

// Run the script
listAllUsers().then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

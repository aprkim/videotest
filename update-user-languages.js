// Update user language information in Firestore
// Run with: node update-user-languages.js

const admin = require('firebase-admin');

// Initialize Firebase Admin
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

// Example user language data
// Language levels: Native, Professional, Advanced, Intermediate, Basic
const userLanguageUpdates = [
    {
        email: 'test01@tabbimate.test',
        languages: [
            { language: 'Korean', level: 'Native' },
            { language: 'English', level: 'Intermediate' }
        ],
        interests: ['Language Exchange', 'Korean Culture'],
        bio: 'Korean native speaker learning English'
    },
    {
        email: 'test02@tabbimate.test',
        languages: [
            { language: 'Spanish', level: 'Native' },
            { language: 'English', level: 'Basic' },
            { language: 'Korean', level: 'Basic' }
        ],
        interests: ['Travel', 'Languages', 'Culture'],
        bio: 'Spanish speaker exploring English and Korean'
    },
    {
        email: 'test03@tabbimate.test',
        languages: [
            { language: 'English', level: 'Native' },
            { language: 'Korean', level: 'Intermediate' }
        ],
        interests: ['K-pop', 'Korean Drama', 'Language Learning'],
        bio: 'English native learning Korean'
    },
    {
        email: 'test04@tabbimate.test',
        languages: [
            { language: 'Korean', level: 'Native' },
            { language: 'Spanish', level: 'Basic' }
        ],
        interests: ['Spanish Culture', 'Music', 'Travel'],
        bio: 'Korean speaker starting Spanish journey'
    },
    {
        email: 'test05@tabbimate.test',
        languages: [
            { language: 'Spanish', level: 'Native' },
            { language: 'English', level: 'Professional' }
        ],
        interests: ['Business', 'Technology', 'Languages'],
        bio: 'Professional Spanish speaker with strong English'
    },
    {
        email: 'test06@tabbimate.test',
        languages: [
            { language: 'English', level: 'Native' },
            { language: 'Spanish', level: 'Intermediate' },
            { language: 'Korean', level: 'Basic' }
        ],
        interests: ['Multilingual Learning', 'Travel', 'Food'],
        bio: 'English native learning Spanish and Korean'
    },
    {
        email: 'test07@tabbimate.test',
        languages: [
            { language: 'Korean', level: 'Native' },
            { language: 'English', level: 'Professional' },
            { language: 'Spanish', level: 'Basic' }
        ],
        interests: ['International Business', 'Languages', 'Culture'],
        bio: 'Korean professional exploring Spanish'
    },
    {
        email: 'test08@tabbimate.test',
        languages: [
            { language: 'Spanish', level: 'Native' },
            { language: 'Korean', level: 'Intermediate' }
        ],
        interests: ['Korean Culture', 'K-drama', 'Language Exchange'],
        bio: 'Spanish speaker passionate about Korean'
    },
    {
        email: 'test09@tabbimate.test',
        languages: [
            { language: 'English', level: 'Native' },
            { language: 'Korean', level: 'Basic' }
        ],
        interests: ['Korean Language', 'Culture', 'Travel'],
        bio: 'English native beginning Korean'
    },
    {
        email: 'test10@tabbimate.test',
        languages: [
            { language: 'Korean', level: 'Native' },
            { language: 'English', level: 'Intermediate' }
        ],
        interests: ['English Learning', 'Movies', 'Technology'],
        bio: 'Korean speaker improving English'
    }
];

async function updateUserLanguages() {
    try {
        console.log('🔄 Updating user language information...\n');

        let updated = 0;
        let failed = 0;

        for (const userData of userLanguageUpdates) {
            try {
                // Find user by email
                const userRecord = await auth.getUserByEmail(userData.email);
                const uid = userRecord.uid;

                console.log(`📝 Updating ${userData.email} (${uid})`);

                // Get existing profile data
                const userDocRef = db.collection('users').doc(uid);
                const userDoc = await userDocRef.get();

                const existingData = userDoc.exists ? userDoc.data() : {};

                // Prepare update data
                const updateData = {
                    ...existingData,
                    languages: userData.languages,
                    interests: userData.interests || existingData.interests || [],
                    bio: userData.bio || existingData.bio || '',
                    email: userData.email,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                };

                // If creating new document, add createdAt
                if (!userDoc.exists) {
                    updateData.createdAt = admin.firestore.FieldValue.serverTimestamp();
                }

                // Update Firestore
                await userDocRef.set(updateData, { merge: true });

                console.log(`   ✓ Added ${userData.languages.length} language(s):`);
                userData.languages.forEach(lang => {
                    console.log(`     • ${lang.language} (${lang.level})`);
                });
                console.log('');

                updated++;

            } catch (error) {
                console.error(`   ✗ Error updating ${userData.email}:`, error.message);
                failed++;
            }
        }

        console.log('═══════════════════════════════════════════════════════════════');
        console.log(`✅ Complete: ${updated} updated, ${failed} failed`);

        if (updated > 0) {
            console.log('\n📊 To verify the updates, run: node list-firebase-users.js');
        }

    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Interactive mode - allow adding language data for a specific user
async function addLanguageToUser(email, languages, interests, bio) {
    try {
        const userRecord = await auth.getUserByEmail(email);
        const uid = userRecord.uid;

        console.log(`📝 Adding language data for ${email}`);

        const userDocRef = db.collection('users').doc(uid);
        const userDoc = await userDocRef.get();
        const existingData = userDoc.exists ? userDoc.data() : {};

        const updateData = {
            ...existingData,
            languages: languages,
            interests: interests || existingData.interests || [],
            bio: bio || existingData.bio || '',
            email: email,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        if (!userDoc.exists) {
            updateData.createdAt = admin.firestore.FieldValue.serverTimestamp();
        }

        await userDocRef.set(updateData, { merge: true });

        console.log(`✓ Successfully updated ${email}`);
        return true;

    } catch (error) {
        console.error(`Error updating user:`, error.message);
        return false;
    }
}

// Check if running with command line arguments
const args = process.argv.slice(2);

if (args.length > 0 && args[0] === '--help') {
    console.log(`
Usage:
  node update-user-languages.js                    Update users defined in the script
  node update-user-languages.js --help             Show this help message

To add language data for users:
1. Edit this file and add user data to the 'userLanguageUpdates' array
2. Run: node update-user-languages.js

Example language data structure:
{
    email: 'user@example.com',
    languages: [
        { language: 'English', level: 'Native' },
        { language: 'Spanish', level: 'Intermediate' }
    ],
    interests: ['Travel', 'Music', 'Cooking'],
    bio: 'Language enthusiast'
}

Available language levels:
- Native
- Professional
- Advanced
- Intermediate
- Basic
    `);
    process.exit(0);
}

// Run the update
updateUserLanguages().then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
}).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('/Users/aprkim/중요키 -2025/videotest-9435c-firebase-adminsdk-fbsvc-60ef7ff8b2.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkUser() {
    const email = process.argv[2];

    if (!email) {
        console.log('Usage: node check-user-profile.js <email>');
        console.log('Example: node check-user-profile.js blah01@tabbimate.test');
        process.exit(1);
    }

    try {
        const usersSnapshot = await db.collection('users').where('email', '==', email).get();

        if (usersSnapshot.empty) {
            console.log(`❌ User not found: ${email}`);
            process.exit(1);
        }

        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();

        console.log('\n📧 Email:', userData.email);
        console.log('🆔 User ID:', userDoc.id);
        console.log('👤 Display Name:', userData.displayName || 'Not set');
        console.log('\n🌍 Languages:');

        if (userData.languages && userData.languages.length > 0) {
            userData.languages.forEach((lang, i) => {
                console.log(`  ${i + 1}. ${lang.language} (${lang.level})`);
            });
        } else {
            console.log('  (No languages set)');
        }

        console.log('\n💡 Interests:');
        if (userData.interests && userData.interests.length > 0) {
            userData.interests.forEach((interest, i) => {
                console.log(`  ${i + 1}. ${interest}`);
            });
        } else {
            console.log('  (No interests set)');
        }

        if (userData.makedoPid) {
            console.log('\n🎥 Makedo PID:', userData.makedoPid);
            console.log('📧 Makedo Email:', userData.makedoEmail);
        } else {
            console.log('\n⚠️  No Makedo PID (not registered on Makedo yet)');
        }

        console.log('\n📍 Location:', userData.location || 'Not set');
        console.log('📝 Bio:', userData.bio || 'Not set');
        console.log('\n✅ Done!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkUser();

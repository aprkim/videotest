/**
 * Firebase Service Layer for TabbiMate
 * 
 * Provides methods for:
 * - User Authentication
 * - Profile Management (Firestore)
 * - Photo Upload (Storage)
 * - Real-time Updates
 */

class FirebaseService {
    constructor() {
        this.currentUser = null;
        this.unsubscribeProfile = null;
    }

    // Authentication Methods
    async signUp(email, password) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogle() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await auth.signInWithPopup(provider);
            this.currentUser = userCredential.user;
            return { success: true, user: this.currentUser };
        } catch (error) {
            console.error('Google sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            await auth.signOut();
            this.currentUser = null;
            if (this.unsubscribeProfile) {
                this.unsubscribeProfile();
            }
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    async resetPassword(email) {
        try {
            await auth.sendPasswordResetEmail(email);
            return { success: true };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, error: error.message };
        }
    }

    getCurrentUser() {
        return auth.currentUser;
    }

    onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(callback);
    }

    // Profile Management (Firestore)
    async saveProfile(profileData) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            await db.collection('profiles').doc(user.uid).set({
                ...profileData,
                userId: user.uid,
                email: user.email,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            return { success: true };
        } catch (error) {
            console.error('Save profile error:', error);
            return { success: false, error: error.message };
        }
    }

    async getProfile(userId = null) {
        const targetUserId = userId || this.getCurrentUser()?.uid;
        if (!targetUserId) {
            return { success: false, error: 'No user ID provided' };
        }

        try {
            const doc = await db.collection('profiles').doc(targetUserId).get();
            if (doc.exists) {
                return { success: true, profile: doc.data() };
            } else {
                return { success: false, error: 'Profile not found' };
            }
        } catch (error) {
            console.error('Get profile error:', error);
            return { success: false, error: error.message };
        }
    }

    listenToProfile(callback) {
        const user = this.getCurrentUser();
        if (!user) {
            console.error('User not authenticated');
            return null;
        }

        this.unsubscribeProfile = db.collection('profiles')
            .doc(user.uid)
            .onSnapshot((doc) => {
                if (doc.exists) {
                    callback({ success: true, profile: doc.data() });
                } else {
                    callback({ success: false, error: 'Profile not found' });
                }
            }, (error) => {
                console.error('Profile listener error:', error);
                callback({ success: false, error: error.message });
            });

        return this.unsubscribeProfile;
    }

    // Get all active users (for map display)
    async getActiveUsers(limit = 50) {
        try {
            const snapshot = await db.collection('profiles')
                .where('location.verified', '==', true)
                .limit(limit)
                .get();

            const users = [];
            snapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, users };
        } catch (error) {
            console.error('Get active users error:', error);
            return { success: false, error: error.message };
        }
    }

    // Photo Upload (Storage)
    async uploadProfilePhoto(file, userId = null) {
        const targetUserId = userId || this.getCurrentUser()?.uid;
        if (!targetUserId) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            // Create storage reference
            const storageRef = storage.ref();
            const photoRef = storageRef.child(`profile-photos/${targetUserId}/${Date.now()}_${file.name}`);

            // Upload file
            const snapshot = await photoRef.put(file);

            // Get download URL
            const downloadURL = await snapshot.ref.getDownloadURL();

            return { success: true, url: downloadURL };
        } catch (error) {
            console.error('Photo upload error:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteProfilePhoto(photoUrl) {
        try {
            const photoRef = storage.refFromURL(photoUrl);
            await photoRef.delete();
            return { success: true };
        } catch (error) {
            console.error('Photo delete error:', error);
            return { success: false, error: error.message };
        }
    }

    // Language Request
    async submitLanguageRequest(languageName, userEmail) {
        try {
            await db.collection('language_requests').add({
                language: languageName,
                email: userEmail,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });

            return { success: true };
        } catch (error) {
            console.error('Language request error:', error);
            return { success: false, error: error.message };
        }
    }

    // Session Management
    async createSession(sessionData) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            const docRef = await db.collection('sessions').add({
                ...sessionData,
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'active'
            });

            return { success: true, sessionId: docRef.id };
        } catch (error) {
            console.error('Create session error:', error);
            return { success: false, error: error.message };
        }
    }

    async updateSession(sessionId, updates) {
        try {
            await db.collection('sessions').doc(sessionId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            return { success: true };
        } catch (error) {
            console.error('Update session error:', error);
            return { success: false, error: error.message };
        }
    }

    // Favorites Management
    async addFavorite(favoriteUserId) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            await db.collection('profiles').doc(user.uid).update({
                favorites: firebase.firestore.FieldValue.arrayUnion(favoriteUserId)
            });

            return { success: true };
        } catch (error) {
            console.error('Add favorite error:', error);
            return { success: false, error: error.message };
        }
    }

    async removeFavorite(favoriteUserId) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        try {
            await db.collection('profiles').doc(user.uid).update({
                favorites: firebase.firestore.FieldValue.arrayRemove(favoriteUserId)
            });

            return { success: true };
        } catch (error) {
            console.error('Remove favorite error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Create singleton instance
const firebaseService = new FirebaseService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseService;
}


/**
 * Real-Time Matching Service using Firebase Firestore
 * Handles matching users for video chat sessions
 */

class MatchingService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.unsubscribe = null;
    }

    /**
     * Initialize Firebase services
     */
    async init() {
        // Firebase should already be initialized by firebase-config.js
        this.db = window.db;
        this.auth = window.auth;
        
        if (!this.db || !this.auth) {
            throw new Error('Firebase not initialized. Make sure firebase-config.js is loaded first.');
        }
        
        console.log('MatchingService initialized');
    }

    /**
     * Add user to matching queue
     * @param {Object} matchingData - User's matching preferences
     * @returns {Promise<string>} - Match session ID when found
     */
    async joinMatchingQueue(matchingData) {
        console.log('=== Joining matching queue ===');
        console.log('Matching data:', matchingData);
        
        const {
            userId,
            email,
            language,
            level,
            interests,
            makedoEmail
        } = matchingData;

        // Create matching entry
        const matchingEntry = {
            userId,
            email,
            language: language.toLowerCase(),
            level,
            interests: interests || [],
            makedoEmail,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'waiting',
            sessionId: null
        };

        try {
            // Add to matching queue
            await this.db.collection('matchingQueue').doc(userId).set(matchingEntry);
            console.log('Added to matching queue:', userId);

            // Try to find a match immediately
            const matchFound = await this.findMatch(userId, matchingEntry);
            
            if (matchFound) {
                return matchFound.sessionId;
            }

            // If no immediate match, listen for matches
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    this.leaveMatchingQueue(userId);
                    reject(new Error('Matching timeout - no partner found'));
                }, 60000); // 60 second timeout

                this.unsubscribe = this.db.collection('matchingQueue')
                    .doc(userId)
                    .onSnapshot((doc) => {
                        if (doc.exists) {
                            const data = doc.data();
                            console.log('Queue status update:', data.status);
                            
                            if (data.status === 'matched' && data.sessionId) {
                                clearTimeout(timeout);
                                if (this.unsubscribe) this.unsubscribe();
                                console.log('Match found! Session ID:', data.sessionId);
                                resolve(data.sessionId);
                            }
                        }
                    }, (error) => {
                        clearTimeout(timeout);
                        console.error('Error listening to queue:', error);
                        reject(error);
                    });
            });
        } catch (error) {
            console.error('Error joining matching queue:', error);
            throw error;
        }
    }

    /**
     * Find a matching user in the queue
     * @param {string} currentUserId - Current user's ID
     * @param {Object} currentUserData - Current user's matching data
     * @returns {Promise<Object|null>} - Match result or null
     */
    async findMatch(currentUserId, currentUserData) {
        console.log('=== Looking for matches ===');
        
        try {
            // Query for waiting users with same language
            const snapshot = await this.db.collection('matchingQueue')
                .where('status', '==', 'waiting')
                .where('language', '==', currentUserData.language)
                .get();

            console.log('Found waiting users:', snapshot.size);

            // Find best match
            let bestMatch = null;
            snapshot.forEach((doc) => {
                const userData = doc.data();
                const partnerId = doc.id;
                
                // Skip self
                if (partnerId === currentUserId) {
                    console.log('Skipping self:', partnerId);
                    return;
                }
                
                // Skip if already matched (stale entry)
                if (userData.status !== 'waiting') {
                    console.log('Skipping non-waiting user:', partnerId, 'Status:', userData.status);
                    return;
                }
                
                console.log('Checking user:', partnerId, userData);
                
                // Check if levels are compatible
                if (this.levelsAreCompatible(currentUserData.level, userData.level)) {
                    bestMatch = {
                        partnerId,
                        partnerData: userData
                    };
                    return; // Break forEach
                }
            });

            if (bestMatch) {
                console.log('Match found:', bestMatch.partnerId);
                
                // Create session
                const sessionId = await this.createMatchSession(
                    currentUserId,
                    currentUserData,
                    bestMatch.partnerId,
                    bestMatch.partnerData
                );
                
                return { sessionId, partnerId: bestMatch.partnerId };
            }

            console.log('No match found yet');
            return null;
        } catch (error) {
            console.error('Error finding match:', error);
            return null;
        }
    }

    /**
     * Check if two levels are compatible for matching
     */
    levelsAreCompatible(level1, level2) {
        // For now, match same levels
        // You can customize this logic
        return level1 === level2;
    }

    /**
     * Create a matched session for two users
     */
    async createMatchSession(userId1, userData1, userId2, userData2) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log('Creating session:', sessionId);
        console.log('User 1:', userId1);
        console.log('User 2:', userId2);

        const sessionData = {
            sessionId,
            user1: {
                userId: userId1,
                email: userData1.email,
                makedoEmail: userData1.makedoEmail
            },
            user2: {
                userId: userId2,
                email: userData2.email,
                makedoEmail: userData2.makedoEmail
            },
            language: userData1.language,
            level: userData1.level,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };

        try {
            // Create session document
            await this.db.collection('videoSessions').doc(sessionId).set(sessionData);
            console.log('Session created:', sessionId);

            // Update both users in queue
            const batch = this.db.batch();
            
            batch.update(this.db.collection('matchingQueue').doc(userId1), {
                status: 'matched',
                sessionId,
                matchedWith: userId2
            });
            
            batch.update(this.db.collection('matchingQueue').doc(userId2), {
                status: 'matched',
                sessionId,
                matchedWith: userId1
            });
            
            await batch.commit();
            console.log('Both users updated with session ID');

            return sessionId;
        } catch (error) {
            console.error('Error creating session:', error);
            throw error;
        }
    }

    /**
     * Leave the matching queue
     */
    async leaveMatchingQueue(userId) {
        console.log('Leaving matching queue:', userId);
        
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }

        try {
            await this.db.collection('matchingQueue').doc(userId).delete();
            console.log('Removed from queue');
        } catch (error) {
            console.error('Error leaving queue:', error);
        }
    }

    /**
     * Get session data
     */
    async getSession(sessionId) {
        try {
            const doc = await this.db.collection('videoSessions').doc(sessionId).get();
            if (doc.exists) {
                return doc.data();
            }
            return null;
        } catch (error) {
            console.error('Error getting session:', error);
            return null;
        }
    }

    /**
     * Clean up old queue entries (optional maintenance)
     */
    async cleanupOldEntries() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        try {
            const snapshot = await this.db.collection('matchingQueue')
                .where('timestamp', '<', fiveMinutesAgo)
                .get();

            const batch = this.db.batch();
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            console.log(`Cleaned up ${snapshot.size} old entries`);
        } catch (error) {
            console.error('Error cleaning up:', error);
        }
    }
}

// Export for use in other files
window.MatchingService = MatchingService;


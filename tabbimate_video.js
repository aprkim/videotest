/**
 * TabbiMate Video Chat Handler
 * Simplified video chat implementation using Makedo's Bridge API
 * Based on vibechat1_ux.js but tailored for TabbiMate's auto-matching flow
 * 
 * Note: Bridge and Fetch are loaded from protocol.js (loaded in HTML)
 */

class TabbiMateVideo {
    constructor() {
        this.state = {
            loggedIn: false,
            currentUser: null,      // { email, pid }
            currentChannel: null,   // Channel object from Bridge
            memberData: null,       // Member object from Bridge
            inCall: false,
            audioEnabled: true,
            videoEnabled: true
        };
        
        this.bridge = null;
        
        // Callbacks that the app can set
        this.callbacks = {
            onRemoteStream: null,       // Called when remote video arrives
            onRemoteStreamEnded: null,  // Called when remote video ends
            onCallJoined: null,         // Called when successfully joined
            onCallEnded: null,          // Called when call ends
            onError: null               // Called on errors
        };
    }
    
    /**
     * 1. Login to Makedo
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{success: boolean, email: string, pid: string}>}
     */
    async login(email, password) {
        try {
            console.log('[TabbiMateVideo] Logging in...');
            
            // Wait for Fetch to be available (loaded by protocol.js)
            if (typeof window.Fetch === 'undefined') {
                console.log('[TabbiMateVideo] Waiting for Fetch to load...');
                await this.waitForFetch();
            }
            
            const result = await window.Fetch.login({ email, password });
            
            if (result.status === 'loggedIn') {
                this.state.loggedIn = true;
                this.state.currentUser = {
                    email: result.email || email,
                    pid: result.pid
                };
                
                console.log('[TabbiMateVideo] Login successful:', this.state.currentUser);
                
                // Initialize Bridge after login
                await this.initBridge();
                
                return {
                    success: true,
                    email: this.state.currentUser.email,
                    pid: this.state.currentUser.pid
                };
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (error) {
            console.error('[TabbiMateVideo] Login error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('login', error);
            }
            throw error;
        }
    }
    
    /**
     * 2. Initialize Bridge and WebSocket (called automatically after login)
     */
    async initBridge() {
        try {
            console.log('[TabbiMateVideo] Initializing Bridge...');
            
            // Wait for Bridge to be available
            if (typeof window.Bridge === 'undefined') {
                console.log('[TabbiMateVideo] Waiting for Bridge to load...');
                await this.waitForBridge();
            }
            
            this.bridge = new window.Bridge();
            this.bridge.initDispatcher();
            console.log('[TabbiMateVideo] Bridge initialized with WebSocket');
        } catch (error) {
            console.error('[TabbiMateVideo] Bridge init error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('bridge_init', error);
            }
            throw error;
        }
    }
    
    /**
     * 3. Get list of available users (for matching/testing)
     * @param {string} query - Search query (empty string returns all users)
     * @param {number} count - Max number of users to return (default: 20)
     * @returns {Promise<Array>} Array of user objects with pid, username, email, etc.
     */
    async getUsers(query = '', count = 20) {
        try {
            if (!this.bridge) {
                throw new Error('Must be logged in before getting users');
            }
            
            console.log('[TabbiMateVideo] Getting users...');
            const users = await this.bridge.getUsersByQuery({ 
                query, 
                count, 
                depth: 1 
            });
            
            // Filter out yourself
            const otherUsers = users.filter(user => !user.is_me);
            
            console.log('[TabbiMateVideo] Found users:', otherUsers.length);
            return otherUsers;
        } catch (error) {
            console.error('[TabbiMateVideo] Get users error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('get_users', error);
            }
            throw error;
        }
    }
    
    /**
     * 4. Start a video call with a matched partner
     * @param {string} partnerPid - The partner's Makedo PID
     * @param {HTMLVideoElement} localVideoElement - <video> for your camera
     * @param {HTMLVideoElement} remoteVideoElement - <video> for partner's camera
     * @returns {Promise<void>}
     */
    async startCall(partnerPid, localVideoElement, remoteVideoElement) {
        try {
            if (!this.state.loggedIn || !this.bridge) {
                throw new Error('Must be logged in before starting a call');
            }
            
            console.log('[TabbiMateVideo] Starting call with partner:', partnerPid);
            
            // Step 1: Create channel with partner
            console.log('[TabbiMateVideo] Creating channel...');
            const channel = await this.bridge.createQuickChatChannel({
                invited: partnerPid,
                message: 'Let\'s practice languages!'
            });
            this.state.currentChannel = channel;
            console.log('[TabbiMateVideo] Channel created:', channel.pid);
            
            // Step 2: Get member info
            console.log('[TabbiMateVideo] Getting member info...');
            const member = await this.bridge.getOrCreateMeMember({
                channel_id: channel.pid
            });
            this.state.memberData = member;
            console.log('[TabbiMateVideo] Member data:', member);
            
            // Step 3: Setup Galene connection via Bridge
            console.log('[TabbiMateVideo] Setting up Galene connection...');
            const memberId = member.pub_id || member.pid;
            const accessCode = member.access_code || channel.access_code || "413239";
            this.bridge.remote_serverSetup(channel.pid, memberId, accessCode);
            console.log('[TabbiMateVideo] Galene setup complete');
            
            // Step 4: Setup stream callbacks
            this.setupStreamCallbacks(remoteVideoElement);
            
            // Step 5: Create local stream (camera/mic)
            console.log('[TabbiMateVideo] Creating local stream...');
            const localStream = await this.bridge.comms.local_createStream(
                'camera',
                this.state.audioEnabled,
                this.state.videoEnabled
            );
            
            if (localStream) {
                localVideoElement.srcObject = localStream;
                localVideoElement.play().catch(e => console.log('Auto-play prevented:', e));
                console.log('[TabbiMateVideo] Local stream created and displayed');
            } else {
                throw new Error('Failed to create local stream');
            }
            
            // Step 6: Join the channel (start broadcasting)
            console.log('[TabbiMateVideo] Joining channel...');
            this.bridge.comms.remote_serverJoin();
            this.state.inCall = true;
            console.log('[TabbiMateVideo] Call started!');
            
        } catch (error) {
            console.error('[TabbiMateVideo] Start call error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('start_call', error);
            }
            throw error;
        }
    }
    
    /**
     * Setup callbacks for remote streams
     */
    setupStreamCallbacks(remoteVideoElement) {
        const self = this;
        
        // When successfully joined
        this.bridge.comms.setOnJoinedChannel(function() {
            console.log('[TabbiMateVideo] Successfully joined channel!');
            
            // Broadcast video/audio if already enabled
            if (self.state.videoEnabled) {
                self.bridge.comms.inChannelSetStreamVideoTrack('camera', true);
            }
            if (self.state.audioEnabled) {
                self.bridge.comms.inChannelSetStreamAudioTrack('camera', true);
            }
            
            if (self.callbacks.onCallJoined) {
                self.callbacks.onCallJoined();
            }
        });
        
        // When remote stream arrives
        this.bridge.comms.setOnNewDownStream(function(streamId, memberId, type, stream) {
            console.log('[TabbiMateVideo] Remote stream received:', streamId, memberId, type);
            
            // Ignore our own stream echo
            if (memberId === self.state.memberData?.pub_id || 
                memberId === self.state.memberData?.pid) {
                console.log('[TabbiMateVideo] Ignoring self stream echo');
                return;
            }
            
            // Display remote video
            if (type === 'camera') {
                remoteVideoElement.srcObject = stream;
                remoteVideoElement.play().catch(e => console.log('Auto-play prevented:', e));
                console.log('[TabbiMateVideo] Remote video displayed');
                
                if (self.callbacks.onRemoteStream) {
                    self.callbacks.onRemoteStream(stream);
                }
            }
        });
        
        // When remote stream ends
        this.bridge.comms.setOnEndDownStream(function(streamId, memberId, type) {
            console.log('[TabbiMateVideo] Remote stream ended:', streamId, type);
            
            if (type === 'camera') {
                remoteVideoElement.srcObject = null;
                
                if (self.callbacks.onRemoteStreamEnded) {
                    self.callbacks.onRemoteStreamEnded();
                }
            }
        });
        
        // When exited channel
        this.bridge.comms.setOnExitedChannel(function() {
            console.log('[TabbiMateVideo] Exited channel');
        });
    }
    
    /**
     * 5. Toggle video on/off
     * @returns {Promise<boolean>} New video state
     */
    async toggleVideo() {
        try {
            if (!this.state.inCall || !this.bridge?.comms) {
                console.warn('[TabbiMateVideo] Not in call, cannot toggle video');
                return this.state.videoEnabled;
            }
            
            this.state.videoEnabled = !this.state.videoEnabled;
            console.log('[TabbiMateVideo] Toggling video:', this.state.videoEnabled);
            
            await this.bridge.comms.inChannelSetStreamVideoTrack('camera', this.state.videoEnabled);
            
            return this.state.videoEnabled;
        } catch (error) {
            console.error('[TabbiMateVideo] Toggle video error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('toggle_video', error);
            }
            throw error;
        }
    }
    
    /**
     * 6. Toggle audio on/off
     * @returns {Promise<boolean>} New audio state
     */
    async toggleAudio() {
        try {
            if (!this.state.inCall || !this.bridge?.comms) {
                console.warn('[TabbiMateVideo] Not in call, cannot toggle audio');
                return this.state.audioEnabled;
            }
            
            this.state.audioEnabled = !this.state.audioEnabled;
            console.log('[TabbiMateVideo] Toggling audio:', this.state.audioEnabled);
            
            await this.bridge.comms.inChannelSetStreamAudioTrack('camera', this.state.audioEnabled);
            
            return this.state.audioEnabled;
        } catch (error) {
            console.error('[TabbiMateVideo] Toggle audio error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('toggle_audio', error);
            }
            throw error;
        }
    }
    
    /**
     * 7. End the current call
     * @param {HTMLVideoElement} localVideoElement - To clean up local video
     * @param {HTMLVideoElement} remoteVideoElement - To clean up remote video
     */
    async endCall(localVideoElement, remoteVideoElement) {
        try {
            console.log('[TabbiMateVideo] Ending call...');
            
            // Stop local video tracks
            if (localVideoElement.srcObject) {
                localVideoElement.srcObject.getTracks().forEach(track => {
                    track.stop();
                    console.log('[TabbiMateVideo] Stopped track:', track.kind);
                });
                localVideoElement.srcObject = null;
            }
            
            // Clear remote video
            if (remoteVideoElement.srcObject) {
                remoteVideoElement.srcObject = null;
            }
            
            // Leave Galene and kill all streams
            if (this.bridge?.comms) {
                this.bridge.comms.remote_serverLeave(true);
            }
            
            // Reset state
            this.state.inCall = false;
            this.state.currentChannel = null;
            this.state.memberData = null;
            this.state.audioEnabled = true;
            this.state.videoEnabled = true;
            
            console.log('[TabbiMateVideo] Call ended');
            
            if (this.callbacks.onCallEnded) {
                this.callbacks.onCallEnded();
            }
        } catch (error) {
            console.error('[TabbiMateVideo] End call error:', error);
            if (this.callbacks.onError) {
                this.callbacks.onError('end_call', error);
            }
            throw error;
        }
    }
    
    /**
     * Set callback functions
     */
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
            this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
        }
    }
    
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    
    /**
     * Check if logged in
     */
    isLoggedIn() {
        return this.state.loggedIn;
    }
    
    /**
     * Check if in call
     */
    isInCall() {
        return this.state.inCall;
    }
    
    /**
     * Wait for Fetch to be loaded by protocol.js
     */
    async waitForFetch() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max
            
            const checkFetch = setInterval(() => {
                attempts++;
                
                if (typeof window.Fetch !== 'undefined') {
                    clearInterval(checkFetch);
                    console.log('[TabbiMateVideo] Fetch is now available');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkFetch);
                    console.error('[TabbiMateVideo] Timeout waiting for Fetch');
                    reject(new Error('Timeout waiting for Fetch to load'));
                }
            }, 100);
        });
    }
    
    /**
     * Wait for Bridge to be loaded by protocol.js
     */
    async waitForBridge() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds max
            
            const checkBridge = setInterval(() => {
                attempts++;
                
                if (typeof window.Bridge !== 'undefined') {
                    clearInterval(checkBridge);
                    console.log('[TabbiMateVideo] Bridge is now available');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkBridge);
                    console.error('[TabbiMateVideo] Timeout waiting for Bridge');
                    reject(new Error('Timeout waiting for Bridge to load'));
                }
            }, 100);
        });
    }
    
    /**
     * Join a session channel using session ID
     * Both users use the same session ID to find each other
     * @param {string} sessionId - Unique session ID from Firebase
     * @param {string} partnerEmail - Partner's Makedo email
     */
    async joinSessionChannel(sessionId, partnerEmail) {
        try {
            console.log('[TabbiMateVideo] Joining session channel:', sessionId);
            console.log('[TabbiMateVideo] Looking for partner:', partnerEmail);
            
            if (!this.state.loggedIn) {
                throw new Error('Not logged in');
            }
            
            // Initialize Bridge
            if (!this.bridge) {
                // Wait for Bridge to be available
                if (typeof window.Bridge === 'undefined') {
                    console.log('[TabbiMateVideo] Waiting for Bridge to load...');
                    await this.waitForBridge();
                }
                
                this.bridge = new window.Bridge();
                await this.bridge.init();
            }
            
            // For now, we'll use a simple polling approach to find the partner
            // Query users to find partner by email
            const checkForPartner = async () => {
                const users = await this.bridge.getUsersByQuery({
                    searchString: partnerEmail,
                    limit: 10
                });
                
                console.log('[TabbiMateVideo] Found users:', users.length);
                
                // Find exact match
                const partner = users.find(u => 
                    u.email && u.email.toLowerCase() === partnerEmail.toLowerCase()
                );
                
                return partner;
            };
            
            // Poll for partner (check every 2 seconds for up to 30 seconds)
            let attempts = 0;
            const maxAttempts = 15;
            
            const pollInterval = setInterval(async () => {
                attempts++;
                console.log(`[TabbiMateVideo] Checking for partner... (attempt ${attempts}/${maxAttempts})`);
                
                const partner = await checkForPartner();
                
                if (partner) {
                    console.log('[TabbiMateVideo] Partner found!', partner);
                    clearInterval(pollInterval);
                    
                    // Create quick chat channel with partner
                    const channelResult = await this.bridge.createQuickChatChannel({
                        invited: partner.pid,
                        message: `TabbiMate session: ${sessionId}`
                    });
                    
                    console.log('[TabbiMateVideo] Channel created:', channelResult);
                    this.state.currentChannel = channelResult;
                    
                    // The remote stream will come via Bridge events
                    // which are handled in the Bridge initialization
                } else if (attempts >= maxAttempts) {
                    console.log('[TabbiMateVideo] Partner not found after max attempts');
                    clearInterval(pollInterval);
                }
            }, 2000);
            
        } catch (error) {
            console.error('[TabbiMateVideo] Join session error:', error);
            throw error;
        }
    }
    
    /**
     * Set callback for remote stream
     * @param {function} callback - Called when remote stream arrives
     */
    onRemoteStream(callback) {
        this.callbacks.onRemoteStream = callback;
    }
}

// Expose globally for use in HTML scripts
window.TabbiMateVideo = TabbiMateVideo;


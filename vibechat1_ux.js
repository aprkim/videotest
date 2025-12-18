import Bridge from 'bridge';
import MakedoConfig from 'config';

class VibeChat {
    constructor() {
        this.state = {
            loggedIn: false,
            currentUser: null,
            selectedUser: null,
            currentChannel: null,
            inChannel: false,
            pendingInvite: null,
            audioActive: false,
            videoActive: false,
            joinButtonMode: 'join'  // 'join' | 'pause' | 'rejoin'
        };
        
        this.bridge = new Bridge();
        console.log('Bridge initialized:', this.bridge);
        console.log('Bridge has comms:', this.bridge.hasComms());
        this.imageUrlBase = MakedoConfig.imageUrlBase;
        
        // Store remote member's media state from WebSocket messages
        this.remoteMemberMediaState = {
            audio: null, // true/false/null
            video: null  // true/false/null
        };
        
        // Bind methods
        this.handleLogin = this.handleLogin.bind(this);
        this.handleLogout = this.handleLogout.bind(this);
        this.handleUserClick = this.handleUserClick.bind(this);
        this.handleJoinPauseRejoin = this.handleJoinPauseRejoin.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.handleAudioToggle = this.handleAudioToggle.bind(this);
        this.handleVideoToggle = this.handleVideoToggle.bind(this);
        this.handleNewInvite = this.handleNewInvite.bind(this);
        
        // Initialize UI
        this.initUI();
    }
    
    initUI() {
        // Login button
        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) {
            loginBtn.addEventListener('click', this.handleLogin);
        }
        
        // Allow Enter key to login
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleLogin();
            });
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout);
        }
        
        // Control buttons
        document.getElementById('audioBtn').addEventListener('click', this.handleAudioToggle);
        document.getElementById('videoBtn').addEventListener('click', this.handleVideoToggle);
        document.getElementById('joinBtn').addEventListener('click', this.handleJoinPauseRejoin);
        document.getElementById('exitBtn').addEventListener('click', this.handleExit);
    }
    
    async handleLogin() {
        const email = document.getElementById('emailInput').value.trim();
        const password = document.getElementById('passwordInput').value;
        
        if (!email || !password) {
            this.showStatus('Please enter email and password', 'error');
            return;
        }
        
        try {
            const result = await this.bridge.login({ email, password });
            
            if (result.status === 'loggedIn') {
                this.onLoginSuccess({
                    email: result.email,
                    userId: result.pid
                });
                
                // Hide login, show app
                document.getElementById('loginContainer').style.display = 'none';
                document.getElementById('appContainer').classList.add('visible');
                
                this.showStatus('Login successful!', 'success');
            } else {
                this.showStatus('Login failed: ' + (result.message || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showStatus('Login error: ' + error.message, 'error');
        }
    }
    
    async onLoginSuccess({ email, userId }) {
        this.state.loggedIn = true;
        this.state.currentUser = { email, userId };
        
        // Update UI
        document.getElementById('userInfo').textContent = email;
        
        // Initialize WebSocket dispatcher
        this.bridge.initDispatcher();
        
        // Set up WebSocket listeners
        this.setupWebSocketListeners();
        
        // Load users
        await this.loadUsers();
    }
    
    setupWebSocketListeners() {
        if (!this.bridge || !this.bridge.dispatcher) return;
        
        // Listen for new invite commands
        this.bridge.dispatcher.on({
            pattern: { type: 'command' },
            callback: (message) => {
                console.log('Received WebSocket command:', message);
                if (message.command === 'newInvite') {
                    this.handleNewInvite(message);
                }
            }
        });
        
        // Listen for member updates (status changes)
        this.bridge.dispatcher.on({
            pattern: { type: 'member' },
            callback: (message) => {
                console.log('Received WebSocket member update:', message);
                this.handleMemberUpdate(message);
            }
        });
        
        // Listen for channel updates
        this.bridge.dispatcher.on({
            pattern: { type: 'channel' },
            callback: (message) => {
                console.log('Received WebSocket channel update:', message);
                this.handleChannelUpdate(message);
            }
        });
        
        console.log('WebSocket listeners set up');
    }
    
    handleMemberUpdate(message) {
        const memberPid = message.id_map?.member;
        const channelPid = message.id_map?.channel;
        
        if (!memberPid || !channelPid) {
            console.warn('Member update missing required IDs:', message);
            return;
        }
        
        console.log('handleMemberUpdate:', {
            event: message.event,
            memberPid,
            channelPid,
            delta: message.delta,
            currentChannel: this.state.currentChannel?.pid
        });
        
        // Only process if this is for our current channel
        if (!this.state.currentChannel || channelPid !== this.state.currentChannel.pid) {
            console.log('Ignoring member update for different channel');
            return;
        }
        
        // Update our cached channel data members array
        if (this.channelData && this.channelData.members) {
            const memberIndex = this.channelData.members.findIndex(m => m.pid === memberPid);
            
            if (message.event === 'member_media_change') {
                // Media state changed (audio/video enabled/disabled)
                
                // Check if this is the remote member we're viewing
                const isRemoteMember = this.state.selectedUser && memberIndex !== -1 &&
                    (this.channelData.members[memberIndex]?.user_id === this.state.selectedUser.userId ||
                     this.channelData.members[memberIndex]?.user_id === this.state.selectedUser.pid);
                
                if (isRemoteMember) {
                    // Update member data
                    Object.assign(this.channelData.members[memberIndex], message.delta);
                    
                    // Store media state for track status display
                    if ('audio_state' in message.delta) {
                        this.remoteMemberMediaState.audio = message.delta.audio_state;
                    }
                    if ('video_state' in message.delta) {
                        this.remoteMemberMediaState.video = message.delta.video_state;
                    }
                    
                    // Update remote track status display
                    const remoteVideo = document.getElementById('remoteVideo');
                    if (remoteVideo.srcObject) {
                        this.updateRemoteTrackStatus(remoteVideo.srcObject);
                    }
                }
            } else if (message.event === 'create') {
                // New member joined
                if (memberIndex === -1) {
                    const newMember = { pid: memberPid, ...message.delta };
                    this.channelData.members.push(newMember);
                    console.log('New member added to cache:', newMember);
                }
            } else if (message.event === 'update' || message.event === 'member_in_lobby' || 
                       message.event === 'member_joined' || message.event === 'member_left') {
                // Update existing member
                if (memberIndex !== -1) {
                    Object.assign(this.channelData.members[memberIndex], message.delta);
                    console.log('Member updated in cache:', this.channelData.members[memberIndex]);
                    
                    // Update UI - check if this is MY member or the remote member
                    const updatedMember = this.channelData.members[memberIndex];
                    const isMyMember = this.memberData && (
                        updatedMember.pid === this.memberData.pid || 
                        updatedMember.pid === this.memberData.pub_id ||
                        updatedMember.user_id === this.state.currentUser.userId
                    );
                    
                    if (isMyMember) {
                        // This is me - update my label
                        const myName = updatedMember.local_name || this.state.currentUser.email;
                        const myStatus = updatedMember.status || 'unknown';
                        document.getElementById('myLabel').textContent = `${myName} (${myStatus})`;
                        console.log(`Updated my label: ${myName} (${myStatus})`);
                    } else {
                        // This is the other member - update their label
                        const remoteName = updatedMember.local_name || this.state.selectedUser?.username || 'Remote User';
                        const remoteStatus = updatedMember.status || 'unknown';
                        document.getElementById('remoteLabel').textContent = `${remoteName} (${remoteStatus})`;
                        console.log(`Updated remote label: ${remoteName} (${remoteStatus})`);
                    }
                }
            } else if (message.event === 'delete') {
                // Member left
                if (memberIndex !== -1) {
                    this.channelData.members.splice(memberIndex, 1);
                    console.log('Member removed from cache:', memberPid);
                }
            }
        }
    }
    
    handleChannelUpdate(message) {
        const channelPid = message.id_map?.channel;
        
        if (!channelPid) {
            console.warn('Channel update missing channel ID:', message);
            return;
        }
        
        // Only process if this is for our current channel
        if (!this.state.currentChannel || channelPid !== this.state.currentChannel.pid) {
            console.log('Ignoring channel update for different channel');
            return;
        }
        
        console.log('handleChannelUpdate:', {
            event: message.event,
            channelPid,
            delta: message.delta
        });
        
        // Update our cached channel data
        if (this.channelData && message.delta) {
            Object.assign(this.channelData, message.delta);
            console.log('Channel data updated:', this.channelData);
        }
    }
    
    handleNewInvite(message) {
        if (!message.data || message.data.type !== 'quickchat') return;
        
        const username = message.data.username || 'Someone';
        const requestorId = message.data.requestor_id;
        const channelId = message.channel_id;
        
        console.log('New quickchat invite from:', username, 'requestorId:', requestorId, 'Channel:', channelId);
        
        // Store pending invite with requestor ID
        this.state.pendingInvite = { channelId, username, requestorId };
        
        // Highlight the user in the list who sent the invite
        this.highlightInvitingUser(requestorId);
        
        // If already in a channel, just highlight - they can decide to switch
        if (!this.state.inChannel) {
            // Not in a channel, enable JOIN button
            document.getElementById('joinBtn').disabled = false;
            
            // Update remote label
            document.getElementById('remoteLabel').textContent = `${username} (invited)`;
        }
    }
    
    highlightInvitingUser(requestorId) {
        // Remove previous invite highlights
        document.querySelectorAll('.user-item.has-invite').forEach(item => {
            item.classList.remove('has-invite');
        });
        
        // Add highlight to the inviting user
        const userItem = document.querySelector(`.user-item[data-user-id="${requestorId}"]`);
        if (userItem) {
            userItem.classList.add('has-invite');
            console.log('Highlighted inviting user:', requestorId);
        } else {
            console.warn('Could not find user item for requestor:', requestorId);
        }
    }
    
    clearInviteHighlight() {
        document.querySelectorAll('.user-item.has-invite').forEach(item => {
            item.classList.remove('has-invite');
        });
    }
    
    async loadUsers() {
        try {
            const users = await this.bridge.getUsersByQuery({ query: '', count: 20, depth: 1 });
            console.log('Loaded users:', users);
            
            this.renderUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showStatus('Failed to load users', 'error');
        }
    }
    
    renderUsers(users) {
        const userList = document.getElementById('userList');
        userList.innerHTML = '';
        
        if (!users || users.length === 0) {
            userList.innerHTML = '<div style="padding:20px; text-align:center; color:#666;">No users available</div>';
            return;
        }
        
        users.forEach(user => {
            // Don't show self in the list
            if (user.is_me) return;
            
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            userItem.setAttribute('data-user-id', user.pid);
            
            const imgSrc = user.headshot_pic ? this.imageUrlBase + user.headshot_pic :
                          user.avatar_pic ? this.imageUrlBase + user.avatar_pic :
                          this.imageUrlBase + 'data/avatars/group0/avatar0.png';
            
            userItem.innerHTML = `
                <img class="user-avatar" src="${imgSrc}" alt="${user.username}">
                <div class="user-details">
                    <div class="user-name">${user.username || 'Unknown User'}</div>
                    <div class="user-status">${user.status || 'Available'}</div>
                </div>
            `;
            
            userItem.addEventListener('click', () => this.handleUserClick(user));
            
            userList.appendChild(userItem);
        });
    }
    
    async handleUserClick(user) {
        console.log('User clicked:', user);
        
        // Clear any invite highlights
        this.clearInviteHighlight();
        
        // Update selection UI
        document.querySelectorAll('.user-item').forEach(item => {
            item.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
        // Store selected user
        this.state.selectedUser = user;
        
        // Update remote video label with status
        document.getElementById('remoteLabel').textContent = `${user.username} (connecting...)`;
        
        // Open quick chat channel
        try {
            this.showStatus(`Opening channel with ${user.username}...`, 'info');
            
            const result = await this.bridge.createQuickChatChannel({
                invited: user.pid,
                message: 'Let\'s chat!'
            });
            
            console.log('Channel opened:', result);
            
            // Store channel info (includes members array)
            this.state.currentChannel = result;
            this.channelData = result;
            
            // Get or create member for this channel
            const memberData = await this.bridge.getOrCreateMeMember({
                channel_id: result.pid
            });
            
            console.log('Member data:', memberData);
            this.memberData = memberData;
            
            // Initialize comms/streams - sets member status to 'lobby_pre'
            const memberId = memberData.pub_id || memberData.pid;
            const accessCode = memberData.access_code || result.access_code || "413239";
            this.bridge.remote_serverSetup(result.pid, memberId, accessCode);
            console.log("ChannelComms initialized - member status: 'lobby_pre'");
            
            // Set up SFU event callbacks
            this.setupSFUCallbacks();
            
            // Update my video label with member's local_name and actual status
            const myName = memberData.local_name || this.state.currentUser.email;
            const myStatus = memberData.status || 'unknown';
            document.getElementById('myLabel').textContent = `${myName} (${myStatus})`;
            
            // Update remote video label with their member info from channel data
            if (result.members && result.members.length > 0) {
                // Find the other member (not me) - use is_me flag from server
                const remoteMember = result.members.find(m => !m.is_me);
                if (remoteMember) {
                    const remoteName = remoteMember.local_name || user.username;
                    const remoteStatus = remoteMember.status || 'unknown';
                    document.getElementById('remoteLabel').textContent = `${remoteName} (${remoteStatus})`;
                    console.log(`Remote member: ${remoteName} (${remoteStatus})`);
                }
            }
            
            // Enable JOIN button and video/audio controls for preview
            document.getElementById('joinBtn').disabled = false;
            document.getElementById('audioBtn').disabled = false;
            document.getElementById('videoBtn').disabled = false;
            
            this.showStatus(`Channel opened with ${user.username}! Status: ${myStatus}. Adjust video/audio, then click JOIN.`, 'success');
        } catch (error) {
            console.error('Error opening channel:', error);
            this.showStatus('Failed to open channel: ' + error.message, 'error');
        }
    }
    
    async handleJoinPauseRejoin() {
        if (this.state.joinButtonMode === 'join') {
            await this.performJoin();
        } else if (this.state.joinButtonMode === 'pause') {
            await this.performPause();
        } else if (this.state.joinButtonMode === 'rejoin') {
            await this.performRejoin();
        }
    }
    
    async performJoin() {
        console.log('JOIN clicked');
        
        let channelToJoin = this.state.currentChannel;
        
        // If there's a pending invite, use that instead
        if (this.state.pendingInvite) {
            channelToJoin = { pid: this.state.pendingInvite.channelId };
            this.state.currentChannel = channelToJoin;
            
            // For pending invites, we need to set up the channel first
            try {
                const channelData = await this.bridge.getOneChannel({
                    channel_id: channelToJoin.pid,
                    depth: 1
                });
                
                // Get or create member
                const memberData = await this.bridge.getOrCreateMeMember({
                    channel_id: channelData.pid
                });
                
                this.memberData = memberData;
                this.channelData = channelData;
                
                // Initialize comms ONLY if not already done (to preserve existing streams)
                if (!this.bridge.hasComms()) {
                    console.log('Initializing comms for pending invite');
                    const memberId = memberData.pub_id || memberData.pid;
                    const accessCode = memberData.access_code || channelData.access_code || "413239";
                    this.bridge.remote_serverSetup(channelData.pid, memberId, accessCode);
                    this.setupSFUCallbacks();
                } else {
                    console.log('Comms already initialized - preserving existing streams');
                }
                
                // Enable video/audio controls for preview before joining
                document.getElementById('audioBtn').disabled = false;
                document.getElementById('videoBtn').disabled = false;
            } catch (error) {
                console.error('Error setting up channel:', error);
                this.showStatus('Failed to set up channel: ' + error.message, 'error');
                return;
            }
        }
        
        if (!channelToJoin || !channelToJoin.pid) {
            this.showStatus('No channel to join', 'error');
            return;
        }
        
        try {
            this.showStatus('Connecting to Galene server...', 'info');
            
            // Actually connect to Galene and start broadcasting
            this.bridge.remote_serverJoin();
            console.log('Connected to Galene server - member status should update to: live');
            
            this.state.inChannel = true;
            this.state.pendingInvite = null;
            
            // Update my video label - use stored member data
            const myName = this.memberData.local_name || this.state.currentUser.email;
            const myStatus = this.memberData.status || 'live';
            document.getElementById('myLabel').textContent = `${myName} (${myStatus})`;
            
            // Update button to PAUSE mode
            this.state.joinButtonMode = 'pause';
            document.getElementById('joinBtn').textContent = '⏸️ PAUSE';
            document.getElementById('joinBtn').disabled = false;
            document.getElementById('exitBtn').disabled = false;
            
            this.showStatus('Connected to channel! Status: live', 'success');
        } catch (error) {
            console.error('Error joining channel:', error);
            this.showStatus('Failed to join channel: ' + error.message, 'error');
        }
    }
    
    async performPause() {
        console.log('PAUSE clicked - leaving Galene but keeping channel open');
        
        try {
            // Leave Galene server (but don't destroy comms or streams!)
            if (this.bridge && this.bridge.hasComms()) {
                this.bridge.remote_serverLeave(false); // false = keep streams alive for preview
            }
            
            this.state.inChannel = false;
            
            // Keep local video running (preview mode)
            // Don't disable tracks - let them keep running locally
            // myVideo stays visible as preview
            
            // Clear remote video
            const remoteVideo = document.getElementById('remoteVideo');
            const remotePlaceholder = document.getElementById('remotePlaceholder');
            remoteVideo.srcObject = null;
            remoteVideo.style.display = 'none';
            remotePlaceholder.style.display = 'flex';
            document.getElementById('remoteVideoBox').classList.remove('active');
            
            // Update button to REJOIN mode
            this.state.joinButtonMode = 'rejoin';
            document.getElementById('joinBtn').textContent = '▶️ REJOIN';
            
            // Update track status (clear remote, keep local)
            this.updateRemoteTrackStatus(null);
            
            this.showStatus('Paused - your video stays on as preview. Click REJOIN to resume.', 'info');
        } catch (error) {
            console.error('Error pausing channel:', error);
            this.showStatus('Error pausing: ' + error.message, 'error');
        }
    }
    
    async performRejoin() {
        console.log('REJOIN clicked - reconnecting to Galene');
        
        try {
            this.showStatus('Reconnecting to Galene server...', 'info');
            
            // Rejoin Galene using existing comms
            this.bridge.remote_serverJoin();
            
            this.state.inChannel = true;
            
            // Local video already running - no need to re-enable
            // The onJoinedChannel callback will re-broadcast if video/audio are active
            
            // Update button to PAUSE mode
            this.state.joinButtonMode = 'pause';
            document.getElementById('joinBtn').textContent = '⏸️ PAUSE';
            
            this.showStatus('Rejoined channel!', 'success');
        } catch (error) {
            console.error('Error rejoining channel:', error);
            this.showStatus('Failed to rejoin: ' + error.message, 'error');
        }
    }
    

    
    setupSFUCallbacks() {
        const self = this;
        
        console.log('=== VIBECHAT: setupSFUCallbacks called ===');
        console.log('bridge comms object exists?', this.bridge.hasComms());
        
        // Called when we successfully join the Galene channel
        this.bridge.setOnJoinedChannel(function() {
            console.log("CALLBACK: Successfully joined Galene channel");
            console.log("  self.state.videoActive:", self.state.videoActive);
            console.log("  self.state.audioActive:", self.state.audioActive);
            
            // Check if stream exists before trying to broadcast
            if (self.bridge.hasComms()) {
                const localStream = self.bridge.local_getStream("camera");
                const remoteStream = self.bridge.remote_getMyStream("camera");
                console.log("  local camera stream exists:", !!localStream);
                console.log("  remote (upstream) camera stream exists:", !!remoteStream);
                if (localStream) {
                    console.log("  local stream video tracks:", localStream.getVideoTracks().length);
                    console.log("  local stream audio tracks:", localStream.getAudioTracks().length);
                }
            }
            
            // If video was already turned on before joining, send it to Galene
            if (self.state.videoActive) {
                console.log("Video already on - broadcasting to Galene");
                self.bridge.inChannelSetStreamVideoTrack("camera", true);
            }
            
            // If audio was already turned on before joining, send it to Galene
            if (self.state.audioActive) {
                console.log("Audio already on - broadcasting to Galene");
                self.bridge.inChannelSetStreamAudioTrack("camera", true);
            }
        });
        
        // Called when our local stream is sent upstream to Galene
        this.bridge.setOnNewUpStream(function(streamId, memberId, type, stream) {
            console.log("CALLBACK: New upstream - streamId:", streamId, "memberId:", memberId, "type:", type);
            // Our local stream is being sent - no UI action needed
        });
        
        // Called when we receive a remote stream from another user
        // Callback signature: (localId, username, label, stream, isInitial)
        // username = the member's pub_id that they joined Galene with
        console.log('=== VIBECHAT: Registering onNewDownStream callback ===');
        this.bridge.setOnNewDownStream(async function(streamId, memberId, type, stream) {
            console.log("==================================");
            console.log("VIBECHAT CALLBACK: New downstream");
            console.log("  streamId:", streamId);
            console.log("  memberId:", memberId);
            console.log("  type:", type);
            console.log("  stream:", stream);
            console.log("  self.memberData?.pub_id:", self.memberData?.pub_id);
            console.log("  self.memberData?.pid:", self.memberData?.pid);
            console.log("==================================");
            
            // Ignore our own stream echo
            if (memberId === self.memberData?.pub_id || memberId === self.memberData?.pid) {
                console.log("VIBECHAT: Ignoring self stream echo");
                return;
            }
            
            // Display remote user's stream
            if (type === 'camera') {
                const remoteVideo = document.getElementById('remoteVideo');
                const remotePlaceholder = document.getElementById('remotePlaceholder');
                
                remoteVideo.srcObject = stream;
                remoteVideo.style.display = 'block';
                remotePlaceholder.style.display = 'none';
                document.getElementById('remoteVideoBox').classList.add('active');
                
                // Use channel members array to get remote member's local_name and status
                console.log('=== DEBUG: Remote stream received ===');
                console.log('Looking for remote member with memberId:', memberId);
                console.log('self.channelData exists?', !!self.channelData);
                console.log('self.channelData:', self.channelData);
                
                if (self.channelData && self.channelData.members) {
                    console.log('Available members:', self.channelData.members);
                    console.log('Number of members:', self.channelData.members.length);
                    
                    // Log each member's IDs to see what we're matching against
                    self.channelData.members.forEach((m, idx) => {
                        console.log(`Member ${idx}: pid="${m.pid}", pub_id="${m.pub_id}", local_name="${m.local_name}", status="${m.status}"`);
                    });
                    
                    // memberId matches member.pid or member.pub_id
                    const remoteMember = self.channelData.members.find(m => 
                        m.pid === memberId || m.pub_id === memberId
                    );
                    
                    if (remoteMember) {
                        console.log('✓ Found remote member:', remoteMember);
                        const remoteName = remoteMember.local_name || self.state.selectedUser?.username || 'Remote User';
                        const remoteStatus = remoteMember.status || 'live';
                        console.log(`Setting remote label to: ${remoteName} (${remoteStatus})`);
                        document.getElementById('remoteLabel').textContent = `${remoteName} (${remoteStatus})`;
                    } else {
                        console.log('✗ Remote member not found in members array');
                        console.log('Tried to match memberId:', memberId);
                    }
                } else {
                    console.log('✗ No channelData or members array available');
                }
                
                if (stream) {
                    // Listen for track additions/removals to update status
                    stream.onaddtrack = (event) => {
                        self.setupTrackListeners(event.track, stream);
                        self.updateRemoteTrackStatus(stream);
                    };
                    stream.onremovetrack = (event) => {
                        self.updateRemoteTrackStatus(stream);
                    };
                    
                    // Setup listeners for existing tracks
                    stream.getTracks().forEach(track => {
                        self.setupTrackListeners(track, stream);
                    });
                    
                    self.updateRemoteTrackStatus(stream);
                    console.log("Remote camera stream attached");
                    self.showStatus('Remote user video connected', 'success');
                } else {
                    console.error('Remote stream is null!');
                }
            }
        });
    
        
        // Called when a remote stream ends
        this.bridge.setOnEndDownStream(function(streamId, memberId, type) {
            console.log("CALLBACK: End downstream - streamId:", streamId, "memberId:", memberId, "type:", type);
            
            if (type === 'camera') {
                const remoteVideo = document.getElementById('remoteVideo');
                const remotePlaceholder = document.getElementById('remotePlaceholder');
                
                remoteVideo.srcObject = null;
                remoteVideo.style.display = 'none';
                remotePlaceholder.style.display = 'flex';
                document.getElementById('remoteVideoBox').classList.remove('active');
                
                self.updateRemoteTrackStatus(null);
                console.log("Remote camera stream ended");
                self.showStatus('Remote user video disconnected', 'info');
            }
        });
        
        // Called when we exit the channel
        this.bridge.setOnExitedChannel(function() {
            console.log("CALLBACK: Exited Galene channel");
        });
        
        console.log("SFU callbacks configured");
    }
    
    async handleAudioToggle() {
        this.state.audioActive = !this.state.audioActive;
        console.log('Audio toggled:', this.state.audioActive);
        
        const audioBtn = document.getElementById('audioBtn');
        
        if (this.state.audioActive) {
            // Turn on audio
            audioBtn.textContent = '🎤 Audio: ON';
            audioBtn.classList.remove('off');
            
            // Create or update stream with audio
            if (this.bridge && this.bridge.hasComms()) {
                // Always create/update the local stream
                await this.bridge.local_createStream('camera', true, this.state.videoActive);
                
                // If in channel, broadcast to Galene
                if (this.state.inChannel) {
                    await this.bridge.inChannelSetStreamAudioTrack('camera', true);
                }
            }
            
            this.showStatus('Audio enabled', 'success');
        } else {
            // Turn off audio
            audioBtn.textContent = '🎤 Audio: OFF';
            audioBtn.classList.add('off');
            
            if (this.bridge && this.bridge.hasComms()) {
                await this.bridge.inChannelSetStreamAudioTrack('camera', false);
            }
            
            this.showStatus('Audio disabled', 'info');
        }
        
        // Update track status display
        this.updateMyTrackStatus();
    }
    
    async handleVideoToggle() {
        this.state.videoActive = !this.state.videoActive;
        console.log('Video toggled:', this.state.videoActive);
        
        const videoBtn = document.getElementById('videoBtn');
        const myVideo = document.getElementById('myVideo');
        const myPlaceholder = document.getElementById('myPlaceholder');
        
        if (this.state.videoActive) {
            // Turn on video
            videoBtn.textContent = '📹 Video: ON';
            videoBtn.classList.remove('off');
            
            // Create stream with video
            if (this.bridge && this.bridge.hasComms()) {
                const stream = await this.bridge.local_createStream('camera', this.state.audioActive, true);
                
                if (stream) {
                    myVideo.srcObject = stream;
                    myVideo.play().catch(e => console.log('Auto-play prevented:', e));
                    myVideo.style.display = 'block';
                    myPlaceholder.style.display = 'none';
                    document.getElementById('myVideoBox').classList.add('active');
                    
                    // Broadcast to Galene if we're in a channel
                    if (this.state.inChannel) {
                        await this.bridge.inChannelSetStreamVideoTrack('camera', true);
                    }
                    
                    this.updateMyTrackStatus();
                    this.showStatus('Video enabled', 'success');
                } else {
                    console.error('Failed to create stream');
                }
            }
        } else {
            // Turn off video
            videoBtn.textContent = '📹 Video: OFF';
            videoBtn.classList.add('off');
            
            if (this.bridge && this.bridge.hasComms()) {
                await this.bridge.inChannelSetStreamVideoTrack('camera', false);
            }
            
            myVideo.style.display = 'none';
            myPlaceholder.style.display = 'flex';
            document.getElementById('myVideoBox').classList.remove('active');
            
            this.showStatus('Video disabled', 'info');
        }
        
        // Update track status display
        this.updateMyTrackStatus();
    }
    
    async handleExit() {
        console.log('EXIT clicked - full teardown');
        
        try {
            // Stop all local media streams
            const myVideo = document.getElementById('myVideo');
            if (myVideo.srcObject) {
                myVideo.srcObject.getTracks().forEach(track => track.stop());
                myVideo.srcObject = null;
            }
            
            // Leave Galene server and kill all streams (if connected or paused)
            if (this.bridge && this.bridge.hasComms()) {
                this.bridge.remote_serverLeave(true); // true = kill streams completely
            }
            
            // Reset video display
            myVideo.style.display = 'none';
            const myPlaceholder = document.getElementById('myPlaceholder');
            myPlaceholder.style.display = 'flex';
            document.getElementById('myVideoBox').classList.remove('active');
            
            // Reset remote video
            const remoteVideo = document.getElementById('remoteVideo');
            const remotePlaceholder = document.getElementById('remotePlaceholder');
            remoteVideo.srcObject = null;
            remoteVideo.style.display = 'none';
            remotePlaceholder.style.display = 'flex';
            document.getElementById('remoteVideoBox').classList.remove('active');
            
            // Reset state completely
            this.state.inChannel = false;
            this.state.audioActive = false;
            this.state.videoActive = false;
            this.state.currentChannel = null;
            this.state.joinButtonMode = 'join';
            this.channelData = null;
            this.memberData = null;
            
            // Update UI - reset to initial state
            document.getElementById('joinBtn').textContent = '📞 JOIN';
            document.getElementById('joinBtn').disabled = true;
            document.getElementById('exitBtn').disabled = true;
            document.getElementById('audioBtn').disabled = true;
            document.getElementById('videoBtn').disabled = true;
            document.getElementById('audioBtn').textContent = '🎤 Audio: OFF';
            document.getElementById('videoBtn').textContent = '📹 Video: OFF';
            document.getElementById('audioBtn').classList.add('off');
            document.getElementById('videoBtn').classList.add('off');
            
            // Reset selected user
            document.querySelectorAll('.user-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Reset labels
            document.getElementById('myLabel').textContent = this.state.currentUser.email || 'Me';
            document.getElementById('remoteLabel').textContent = 'Select a user';
            
            // Clear track status displays
            this.updateMyTrackStatus();
            this.updateRemoteTrackStatus(null);
            
            this.showStatus('Exited and closed channel', 'info');
        } catch (error) {
            console.error('Error exiting channel:', error);
            this.showStatus('Error exiting: ' + error.message, 'error');
        }
    }
    
    async handleLogout() {
        try {
            // Exit channel if in one
            if (this.state.inChannel) {
                await this.handleExit();
            }
            
            // Logout
            await this.bridge.logout({});
            
            // Disconnect WebSocket
            if (this.bridge && this.bridge.dispatcher && this.bridge.dispatcher.socket) {
                this.bridge.dispatcher.socket.close();
            }
            
            // Reset state
            this.state.loggedIn = false;
            this.state.currentUser = null;
            this.bridge = null;
            
            // Show login, hide app
            document.getElementById('loginContainer').style.display = 'flex';
            document.getElementById('appContainer').classList.remove('visible');
            
            // Clear password
            document.getElementById('passwordInput').value = '';
            
            this.showStatus('Logged out successfully', 'success');
        } catch (error) {
            console.error('Logout error:', error);
            this.showStatus('Logout error: ' + error.message, 'error');
        }
    }
    
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.style.borderLeftColor = 
            type === 'success' ? '#28a745' :
            type === 'error' ? '#dc3545' :
            type === 'warning' ? '#ffc107' : '#667eea';
        
        statusEl.classList.add('visible');
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusEl.classList.remove('visible');
        }, 3000);
    }
    
    // Track status display functions
    updateMyTrackStatus() {
        const statusEl = document.getElementById('myTrackStatus');
        if (!statusEl) return;
        
        let audioStatus = 'OFF';
        let videoStatus = 'OFF';
        let audioClass = 'off';
        let videoClass = 'off';
        
        // Check source stream if available
        if (this.bridge && this.bridge.hasComms()) {
            const stream = this.bridge.local_getStream('camera');
            if (stream) {
                const audioTracks = stream.getAudioTracks();
                const videoTracks = stream.getVideoTracks();
                
                if (audioTracks.length > 0 && audioTracks[0].readyState === 'live') {
                    audioStatus = audioTracks[0].enabled ? 'ON' : 'MUTED';
                    audioClass = audioTracks[0].enabled ? '' : 'off';
                }
                
                if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
                    videoStatus = videoTracks[0].enabled ? 'ON' : 'HIDDEN';
                    videoClass = videoTracks[0].enabled ? '' : 'off';
                }
            }
        }
        
        statusEl.innerHTML = `<span class="track-audio ${audioClass}">🎤 ${audioStatus}</span> | <span class="track-video ${videoClass}">📹 ${videoStatus}</span>`;
    }
    
    setupTrackListeners(track, stream) {
        // Listen for track ending to update status
        track.onended = () => {
            this.updateRemoteTrackStatus(stream);
        };
    }
    
    updateRemoteTrackStatus(stream) {
        const statusEl = document.getElementById('remoteTrackStatus');
        if (!statusEl) return;
        
        let audioStatus = 'OFF';
        let videoStatus = 'OFF';
        let audioClass = 'off';
        let videoClass = 'off';
        
        if (stream) {
            const audioTracks = stream.getAudioTracks();
            const videoTracks = stream.getVideoTracks();
            
            // Use WebSocket media state if available, otherwise fall back to track state
            if (audioTracks.length > 0 && audioTracks[0].readyState === 'live') {
                const isEnabled = this.remoteMemberMediaState.audio !== null 
                    ? this.remoteMemberMediaState.audio 
                    : audioTracks[0].enabled;
                audioStatus = isEnabled ? 'ON' : 'MUTED';
                audioClass = isEnabled ? '' : 'off';
            }
            
            if (videoTracks.length > 0 && videoTracks[0].readyState === 'live') {
                const isEnabled = this.remoteMemberMediaState.video !== null 
                    ? this.remoteMemberMediaState.video 
                    : videoTracks[0].enabled;
                videoStatus = isEnabled ? 'ON' : 'HIDDEN';
                videoClass = isEnabled ? '' : 'off';
            }
        }
        
        statusEl.innerHTML = `<span class="track-audio ${audioClass}">🎤 ${audioStatus}</span> | <span class="track-video ${videoClass}">📹 ${videoStatus}</span>`;
    }
}

export default VibeChat;

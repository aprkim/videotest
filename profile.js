// Import Fetch from fetch.js for Makedo login
import Fetch from 'https://proto2.makedo.com:8883/ux/scripts/fetch.js';

// Profile data
let profileData = {
    userId: null,
    language: null,
    level: null,
    interests: []
};

// Makedo/VibeChat state
const makedoState = {
    isLoggedIn: false,
    userEmail: null,
    userId: null
};

// Initialize profile page
function init() {
    // Get user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('id');
    
    if (urlUserId) {
        profileData.userId = urlUserId;
        localStorage.setItem('videotest_user_id', urlUserId);
        
        // Update URL to clean format
        const basePath = '/profile' 
            : '/profile';
        const cleanUrl = `${basePath}/${urlUserId}`;
        window.history.replaceState({}, '', cleanUrl);
    } else {
        // Check if URL has ID in path format
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        
        if (lastPart && /^\d{8}$/.test(lastPart)) {
            profileData.userId = lastPart;
            localStorage.setItem('videotest_user_id', lastPart);
        } else {
            // No valid ID, redirect to home
            window.location.href = '/';
            return;
        }
    }
    
    // Load profile data
    loadProfileData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup map dots
    setupMapDots();
}

// Load profile data from localStorage
function loadProfileData() {
    // Check for new user onboarding data
    const newUserData = localStorage.getItem('videotest_new_user_data');
    if (newUserData) {
        try {
            const data = JSON.parse(newUserData);
            profileData = { ...profileData, ...data };
            localStorage.removeItem('videotest_new_user_data');
        } catch (error) {
            console.error('Error loading new user data:', error);
        }
    } else {
        // Load existing profile
        const storageKey = `videotest_profile_${profileData.userId}`;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                profileData = { ...profileData, ...data };
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        }
    }
    
    // Update UI with profile data
    updateProfileDisplay();
}

// Update profile display
function updateProfileDisplay() {
    console.log('Updating profile display with:', profileData);
    
    // Update language display
    const languageDisplay = document.getElementById('language-display');
    if (profileData.language && profileData.level) {
        // Get the second span (not the icon span)
        const textSpan = languageDisplay.querySelectorAll('span')[1];
        if (textSpan) {
            textSpan.textContent = `${profileData.language} • ${profileData.level}`;
        }
    }
    
    // Update interests display
    const interestsDisplay = document.getElementById('interests-display');
    if (profileData.interests && profileData.interests.length > 0) {
        // Get the second span (not the icon span)
        const textSpan = interestsDisplay.querySelectorAll('span')[1];
        if (textSpan) {
            textSpan.textContent = profileData.interests.join(', ');
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    const startVideoBtn = document.getElementById('start-video-btn');
    const connectVideoBtn = document.getElementById('connect-video-btn');
    const disconnectVideoBtn = document.getElementById('disconnect-video-btn');
    
    if (startVideoBtn) {
        startVideoBtn.addEventListener('click', handleStartVideo);
    }
    
    if (connectVideoBtn) {
        connectVideoBtn.addEventListener('click', handleConnectVideo);
    }
    
    if (disconnectVideoBtn) {
        disconnectVideoBtn.addEventListener('click', handleDisconnectVideo);
    }
    
    // Check and update video connection status
    updateVideoConnectionStatus();
}

// Handle start video button - go to session page
function handleStartVideo() {
    // Save profile data
    const storageKey = `tabbimate_profile_${profileData.userId}`;
    localStorage.setItem(storageKey, JSON.stringify(profileData));
    
    // Store user data for the session
    localStorage.setItem('videotest_current_user', JSON.stringify({
        userId: profileData.userId,
        language: profileData.language,
        level: profileData.level,
        interests: profileData.interests
    }));
    
    // For now, create a mock matched user (in production, this would come from matching algorithm)
    // Pick a random user from a small set
    const mockUsers = [
        { name: "Marty", languages: { english: "Native", spanish: "Intermediate" }, interests: ["Music", "Running", "Tech"] },
        { name: "Sofia", languages: { english: "Intermediate", spanish: "Native" }, interests: ["Travel", "Art", "Cooking"] },
        { name: "Kenji", languages: { english: "Advanced", japanese: "Native" }, interests: ["Gaming", "Anime", "Tech"] }
    ];
    const randomMatchedUser = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    localStorage.setItem('videotest_matched_user', JSON.stringify(randomMatchedUser));
    
    // Generate a session ID
    const sessionId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    // Redirect to session page with session ID
    const basePath = '/session' 
        : '/session';
    window.location.href = `${basePath}/${sessionId}`;
}

// User database - same as app.html
const users = [
    {
        name: "April",
        location: { top: "32%", left: "18%" },
        languages: { english: "Professional", spanish: "Basic", korean: "Native" },
        practiceLevel: "Professional",
        interests: ["Parenting", "AI", "Cooking"]
    },
    {
        name: "Marty",
        location: { top: "40%", left: "22%" },
        languages: { english: "Native", spanish: "Intermediate", korean: "Basic" },
        practiceLevel: "Native",
        interests: ["Music", "Running", "Tech"]
    },
    {
        name: "Sofia",
        location: { top: "65%", left: "30%" },
        languages: { english: "Intermediate", spanish: "Native" },
        practiceLevel: "Intermediate",
        interests: ["Travel", "Photography"]
    },
    {
        name: "Kenji",
        location: { top: "38%", left: "82%" },
        languages: { english: "Basic", japanese: "Native" },
        practiceLevel: "Basic",
        interests: ["Gaming", "Anime"]
    },
    {
        name: "Hyejin",
        location: { top: "42%", left: "76%" },
        languages: { english: "Professional", korean: "Native" },
        practiceLevel: "Professional",
        interests: ["Baking", "Pilates"]
    },
    {
        name: "Carlos",
        location: { top: "50%", left: "26%" },
        languages: { english: "Basic", spanish: "Native" },
        practiceLevel: "Basic",
        interests: ["Soccer", "Cooking"]
    },
    {
        name: "Ravi",
        location: { top: "47%", left: "70%" },
        languages: { english: "Professional", hindi: "Native" },
        practiceLevel: "Professional",
        interests: ["Cricket", "Startups"]
    },
    {
        name: "Maria",
        location: { top: "60%", left: "85%" },
        languages: { english: "Intermediate", tagalog: "Native" },
        practiceLevel: "Intermediate",
        interests: ["K-pop", "Cooking"]
    }
];

// Setup map dots with hover tooltips
function setupMapDots() {
    const dotsContainer = document.getElementById('dots-container');
    if (!dotsContainer) return;

    users.forEach(user => {
        // Create dot
        const dot = document.createElement('div');
        dot.className = 'user-dot';
        dot.style.top = user.location.top;
        dot.style.left = user.location.left;
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'user-tooltip';
        
        // Format languages
        const languages = Object.entries(user.languages)
            .map(([lang, level]) => `${lang.charAt(0).toUpperCase() + lang.slice(1)}: ${level}`)
            .join('<br>');
        
        tooltip.innerHTML = `
            <strong>${user.name}</strong><br>
            ${languages}<br>
            <span style="color: #A1A1A6;">${user.interests.join(', ')}</span>
        `;
        
        // Add hover events
        dot.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block';
            dot.appendChild(tooltip);
        });
        
        dot.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
        
        dotsContainer.appendChild(dot);
    });
}

// Update video connection status display
function updateVideoConnectionStatus() {
    loadMakedoLoginState();
    
    const statusBadge = document.getElementById('status-badge');
    const statusText = document.getElementById('status-text');
    const statusDescription = document.getElementById('status-description');
    const videoAccountInfo = document.getElementById('video-account-info');
    const connectBtn = document.getElementById('connect-video-btn');
    const disconnectBtn = document.getElementById('disconnect-video-btn');
    const makedoEmailDisplay = document.getElementById('makedo-email-display');
    
    if (makedoState.isLoggedIn) {
        // Connected state
        statusBadge.classList.remove('status-disconnected');
        statusBadge.classList.add('status-connected');
        statusText.textContent = 'Connected';
        statusDescription.textContent = 'Your video account is connected and ready for video chats.';
        
        videoAccountInfo.classList.remove('hidden');
        makedoEmailDisplay.textContent = makedoState.userEmail;
        
        connectBtn.classList.add('hidden');
        disconnectBtn.classList.remove('hidden');
    } else {
        // Disconnected state
        statusBadge.classList.remove('status-connected');
        statusBadge.classList.add('status-disconnected');
        statusText.textContent = 'Not Connected';
        statusDescription.textContent = 'Connect your video account to enable real-time video chat with language partners.';
        
        videoAccountInfo.classList.add('hidden');
        
        connectBtn.classList.remove('hidden');
        disconnectBtn.classList.add('hidden');
    }
}

// Handle connect video button
async function handleConnectVideo() {
    const result = await showMakedoLoginModal();
    
    if (result.success) {
        updateVideoConnectionStatus();
    }
}

// Handle disconnect video button
function handleDisconnectVideo() {
    // Clear Makedo login state
    makedoState.isLoggedIn = false;
    makedoState.userEmail = null;
    makedoState.userId = null;
    
    localStorage.removeItem('makedo_logged_in');
    localStorage.removeItem('makedo_email');
    localStorage.removeItem('makedo_user_id');
    
    console.log('Makedo account disconnected');
    
    updateVideoConnectionStatus();
}

// Show Makedo login modal
function showMakedoLoginModal() {
    return new Promise((resolve, reject) => {
        const modal = document.getElementById('makedo-login-modal');
        const emailInput = document.getElementById('makedo-email');
        const passwordInput = document.getElementById('makedo-password');
        const errorDiv = document.getElementById('makedo-login-error');
        const submitBtn = document.getElementById('makedo-login-submit');
        const cancelBtn = document.getElementById('makedo-cancel');
        const loginText = document.getElementById('makedo-login-text');
        const loginSpinner = document.getElementById('makedo-login-spinner');
        
        // Show modal
        modal.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        
        // Handle submit
        const handleSubmit = async (e) => {
            if (e) e.preventDefault();
            
            const email = emailInput.value.trim().toLowerCase();
            const password = passwordInput.value;
            
            if (!email || !password) {
                errorDiv.textContent = 'Please enter both email and password';
                errorDiv.classList.remove('hidden');
                return;
            }
            
            // Show loading state
            loginText.textContent = 'Connecting...';
            loginSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
            errorDiv.classList.add('hidden');
            
            try {
                // Use Fetch.login() from fetch.js (imported at top of file)
                console.log('Starting Makedo login with Fetch.login()...');
                console.log('Email:', email);
                
                const result = await Fetch.login({ email, password });
                
                console.log('Login result:', result);
                console.log('Result status:', result.status);
                
                if (result.status === 'loggedIn') {
                    // Success!
                    makedoState.isLoggedIn = true;
                    makedoState.userEmail = result.email || email;
                    makedoState.userId = result.pid;
                    
                    console.log('Makedo login successful:', makedoState);
                    
                    // Note: We don't initialize VibeChat here on the profile page
                    // VibeChat will be initialized later on app.html when video chat is needed
                    
                    // Save login state to localStorage so app.html can use it
                    saveMakedoLoginState();
                    
                    // Update UI to show connected status
                    updateVideoConnectionStatus();
                    
                    // Hide modal
                    modal.classList.add('hidden');
                    
                    // Clean up
                    cleanup();
                    
                    // Resolve promise
                    resolve({ success: true, data: makedoState });
                } else {
                    console.error('Login failed. Result:', result);
                    throw new Error(result.message || result.error || 'Login failed. Please check your credentials.');
                }
                
            } catch (error) {
                console.error('Makedo login error:', error);
                errorDiv.textContent = error.message || 'Connection failed. Please try again.';
                errorDiv.classList.remove('hidden');
                
                // Reset button
                loginText.textContent = 'Connect';
                loginSpinner.classList.add('hidden');
                submitBtn.disabled = false;
            }
        };
        
        // Handle cancel
        const handleCancel = () => {
            modal.classList.add('hidden');
            cleanup();
            resolve({ success: false, cancelled: true });
        };
        
        // Cleanup function
        const cleanup = () => {
            submitBtn.removeEventListener('click', handleSubmit);
            cancelBtn.removeEventListener('click', handleCancel);
            passwordInput.removeEventListener('keypress', handleKeyPress);
            emailInput.value = '';
            passwordInput.value = '';
            loginText.textContent = 'Connect';
            loginSpinner.classList.add('hidden');
            submitBtn.disabled = false;
        };
        
        // Handle Enter key
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') handleSubmit(e);
        };
        
        // Attach listeners
        submitBtn.addEventListener('click', handleSubmit);
        cancelBtn.addEventListener('click', handleCancel);
        passwordInput.addEventListener('keypress', handleKeyPress);
    });
}

// Save Makedo login state to localStorage
function saveMakedoLoginState() {
    if (makedoState.isLoggedIn) {
        localStorage.setItem('makedo_logged_in', 'true');
        localStorage.setItem('makedo_email', makedoState.userEmail);
        localStorage.setItem('makedo_user_id', makedoState.userId);
        console.log('Makedo login state saved');
    }
}

// Load Makedo login state from localStorage
function loadMakedoLoginState() {
    const isLoggedIn = localStorage.getItem('makedo_logged_in') === 'true';
    if (isLoggedIn) {
        makedoState.isLoggedIn = true;
        makedoState.userEmail = localStorage.getItem('makedo_email');
        makedoState.userId = localStorage.getItem('makedo_user_id');
        
        console.log('Loaded Makedo login state:', makedoState);
        
        // Re-initialize VibeChat with saved credentials (done async after page load)
        setTimeout(() => {
            if (window.vibeChat && window.vibeChat.onLoginSuccess) {
                window.vibeChat.onLoginSuccess({
                    email: makedoState.userEmail,
                    userId: makedoState.userId
                }).catch(err => {
                    console.warn('Failed to restore Makedo session:', err);
                    // Clear invalid session
                    localStorage.removeItem('makedo_logged_in');
                    makedoState.isLoggedIn = false;
                });
            }
        }, 1000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

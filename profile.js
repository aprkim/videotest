// Profile data
let profileData = {
    userId: null,
    language: null,
    level: null,
    interests: []
};

// Initialize profile page
function init() {
    // Get user ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('id');
    
    if (urlUserId) {
        profileData.userId = urlUserId;
        localStorage.setItem('tabbimate_user_id', urlUserId);
        
        // Update URL to clean format
        const basePath = window.location.pathname.includes('tabbimate') 
            ? '/tabbimate/profile' 
            : '/profile';
        const cleanUrl = `${basePath}/${urlUserId}`;
        window.history.replaceState({}, '', cleanUrl);
    } else {
        // Check if URL has ID in path format
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        
        if (lastPart && /^\d{8}$/.test(lastPart)) {
            profileData.userId = lastPart;
            localStorage.setItem('tabbimate_user_id', lastPart);
        } else {
            // No valid ID, redirect to home
            window.location.href = window.location.pathname.includes('tabbimate') 
                ? '/tabbimate/' 
                : '/';
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
    const newUserData = localStorage.getItem('tabbimate_new_user_data');
    if (newUserData) {
        try {
            const data = JSON.parse(newUserData);
            profileData = { ...profileData, ...data };
            localStorage.removeItem('tabbimate_new_user_data');
        } catch (error) {
            console.error('Error loading new user data:', error);
        }
    } else {
        // Load existing profile
        const storageKey = `tabbimate_profile_${profileData.userId}`;
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
    // Update language display
    const languageDisplay = document.getElementById('language-display');
    if (profileData.language && profileData.level) {
        languageDisplay.querySelector('span').textContent = 
            `${profileData.language} • ${profileData.level}`;
    }
    
    // Update interests display
    const interestsDisplay = document.getElementById('interests-display');
    if (profileData.interests && profileData.interests.length > 0) {
        interestsDisplay.querySelector('span').textContent = 
            profileData.interests.join(', ');
    }
}

// Setup event listeners
function setupEventListeners() {
    const startVideoBtn = document.getElementById('start-video-btn');
    const joinBtn = document.getElementById('join-btn');
    
    if (startVideoBtn) {
        startVideoBtn.addEventListener('click', handleStartVideo);
    }
    
    if (joinBtn) {
        joinBtn.addEventListener('click', handleJoin);
    }
}

// Handle start video button
function handleStartVideo() {
    // Redirect to app with user profile data
    const basePath = window.location.pathname.includes('tabbimate') 
        ? '/tabbimate/app.html' 
        : '/app.html';
    window.location.href = basePath;
}

// Handle join button
function handleJoin() {
    // Redirect to auth/signup page
    const basePath = window.location.pathname.includes('tabbimate') 
        ? '/tabbimate/auth.html' 
        : '/auth.html';
    window.location.href = basePath;
}

// Setup map dots animation
function setupMapDots() {
    const dotsContainer = document.getElementById('dots-container');
    if (!dotsContainer) return;

    const dotPositions = [
        { top: "25%", left: "15%" },
        { top: "35%", left: "25%" },
        { top: "45%", left: "35%" },
        { top: "30%", left: "45%" },
        { top: "40%", left: "55%" },
        { top: "28%", left: "65%" },
        { top: "50%", left: "75%" },
        { top: "38%", left: "82%" },
        { top: "47%", left: "70%" },
        { top: "60%", left: "85%" }
    ];

    dotPositions.forEach(pos => {
        const dot = document.createElement('div');
        dot.className = 'user-dot';
        dot.style.top = pos.top;
        dot.style.left = pos.left;
        dotsContainer.appendChild(dot);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

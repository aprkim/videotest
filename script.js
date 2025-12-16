// Import Fetch from fetch.js for Makedo login (via window.Fetch set in app.html)
// Note: app.html loads Fetch and makes it globally available

// State management
const state = {
    selectedLanguage: null,
    currentView: 'language-selection',
    sessionDuration: null,
    matchedUser: null,
    selectedLevel: null
};

// Currently matched user for video chat
let currentMatchedUser = null;

// Guest mode toggle - set to true to test as a new user (non-logged-in)
const GUEST_MODE = true;

// Store selected interests for new users
let selectedInterests = [];

// Makedo/VibeChat state
const makedoState = {
    isLoggedIn: false,
    userEmail: null,
    userId: null
};

// Generate unique 8-digit user ID
function generateUserId() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// User database - structured format for easy expansion
const users = [
    {
        name: "April",
        location: { top: "32%", left: "18%" }, // Berkeley
        languages: {
            english: "Professional",
            spanish: "Basic",
            korean: "Native"
        },
        practiceLevel: "Professional",
        interests: ["Parenting", "AI", "Cooking"]
    },
    {
        name: "Marty",
        location: { top: "40%", left: "22%" }, // US Midwest
        languages: {
            english: "Native",
            spanish: "Intermediate",
            korean: "Basic"
        },
        practiceLevel: "Native",
        interests: ["Music", "Running", "Tech"]
    },
    {
        name: "Sofia",
        location: { top: "65%", left: "30%" }, // Colombia
        languages: {
            english: "Intermediate",
            spanish: "Native"
        },
        practiceLevel: "Intermediate",
        interests: ["Travel", "Photography"]
    },
    {
        name: "Kenji",
        location: { top: "38%", left: "82%" }, // Japan
        languages: {
            english: "Basic",
            japanese: "Native"
        },
        practiceLevel: "Basic",
        interests: ["Gaming", "Anime"]
    },
    {
        name: "Hyejin",
        location: { top: "42%", left: "76%" }, // Korea
        languages: {
            english: "Professional",
            korean: "Native"
        },
        practiceLevel: "Professional",
        interests: ["Baking", "Pilates"]
    },
    {
        name: "Carlos",
        location: { top: "50%", left: "26%" }, // Mexico
        languages: {
            english: "Basic",
            spanish: "Native"
        },
        practiceLevel: "Basic",
        interests: ["Soccer", "Cooking"]
    },
    {
        name: "Ravi",
        location: { top: "47%", left: "70%" }, // India
        languages: {
            english: "Professional",
            hindi: "Native"
        },
        practiceLevel: "Professional",
        interests: ["Cricket", "Startups"]
    },
    {
        name: "Maria",
        location: { top: "60%", left: "85%" }, // Philippines
        languages: {
            english: "Intermediate",
            filipino: "Native"
        },
        practiceLevel: "Intermediate",
        interests: ["Singing", "Volunteering"]
    },
    {
        name: "Liam",
        location: { top: "80%", left: "90%" }, // Australia
        languages: {
            english: "Native"
        },
        practiceLevel: "Native",
        interests: ["Surfing", "Beach", "Travel"]
    },
    {
        name: "Emma",
        location: { top: "52%", left: "48%" }, // Europe
        languages: {
            english: "Native",
            french: "Professional"
        },
        practiceLevel: "Professional",
        interests: ["Art", "Wine", "History"]
    },
    {
        name: "Yuki",
        location: { top: "36%", left: "84%" }, // Japan
        languages: {
            japanese: "Native",
            english: "Intermediate",
            korean: "Basic"
        },
        practiceLevel: "Intermediate",
        interests: ["Manga", "Fashion", "K-pop"]
    },
    {
        name: "Diego",
        location: { top: "58%", left: "28%" }, // Argentina
        languages: {
            spanish: "Native",
            english: "Professional",
            portuguese: "Intermediate"
        },
        practiceLevel: "Professional",
        interests: ["Football", "Tango", "BBQ"]
    },
    {
        name: "Amelie",
        location: { top: "48%", left: "50%" }, // France
        languages: {
            french: "Native",
            english: "Intermediate",
            spanish: "Basic"
        },
        practiceLevel: "Intermediate",
        interests: ["Cinema", "Fashion", "Cheese"]
    },
    {
        name: "Chen",
        location: { top: "30%", left: "74%" }, // China
        languages: {
            chinese: "Native",
            english: "Professional"
        },
        practiceLevel: "Professional",
        interests: ["Business", "Tea", "Calligraphy"]
    },
    {
        name: "Isabella",
        location: { top: "70%", left: "22%" }, // Brazil
        languages: {
            portuguese: "Native",
            spanish: "Professional",
            english: "Intermediate"
        },
        practiceLevel: "Professional",
        interests: ["Samba", "Beach", "Coffee"]
    },
    {
        name: "Ahmed",
        location: { top: "26%", left: "56%" }, // Egypt
        languages: {
            arabic: "Native",
            english: "Professional",
            french: "Basic"
        },
        practiceLevel: "Professional",
        interests: ["History", "Architecture", "Travel"]
    },
    {
        name: "Nina",
        location: { top: "60%", left: "54%" }, // South Africa
        languages: {
            english: "Native",
            afrikaans: "Native"
        },
        practiceLevel: "Native",
        interests: ["Wildlife", "Photography", "Hiking"]
    },
    {
        name: "Paolo",
        location: { top: "44%", left: "52%" }, // Italy
        languages: {
            italian: "Native",
            english: "Intermediate",
            spanish: "Intermediate"
        },
        practiceLevel: "Intermediate",
        interests: ["Cooking", "Opera", "Design"]
    },
    {
        name: "Fatima",
        location: { top: "34%", left: "66%" }, // Pakistan
        languages: {
            urdu: "Native",
            english: "Professional",
            arabic: "Basic"
        },
        practiceLevel: "Professional",
        interests: ["Poetry", "Education", "Medicine"]
    },
    {
        name: "Lars",
        location: { top: "60%", left: "52%" }, // Sweden
        languages: {
            swedish: "Native",
            english: "Native",
            spanish: "Basic"
        },
        practiceLevel: "Native",
        interests: ["Gaming", "Design", "Sustainability"]
    }
];

// Helper function to format languages for display
function formatLanguages(languagesObj) {
    return Object.entries(languagesObj)
        .map(([lang, level]) => `${lang.charAt(0).toUpperCase() + lang.slice(1)} (${level})`)
        .join(', ');
}

// Initialize the page
function init() {
    // Check if URL contains a session parameter
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session');
    
    if (sessionId) {
        console.log('Starting session:', sessionId);
        
        // Start the video chat session (which will show matching screen first)
        startVideoSession(sessionId);
    } else {
        // Check if this is a signed-in user with languages
        const userData = localStorage.getItem('tabbimate_current_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.isSignedInUser && user.languages && user.languages.length > 0) {
                    console.log('Signed-in user detected with languages:', user.languages);
                    handleSignedInUserLanguages(user);
                    return;
                }
            } catch (error) {
                console.error('Error parsing user data:', error);
            }
        }
        
        // Normal home page initialization (for guest users)
        renderDots();
        setupLanguageButtons();
        setupLevelButtons();
        setupBackButton();
        setupCardDrag();
        setupLanguageRequest();
    }
}

// Handle signed-in users with languages
function handleSignedInUserLanguages(user) {
    if (user.languages.length === 1) {
        // Only one language - skip language selection, go straight to matching
        console.log('User has only one language, skipping selection');
        const lang = user.languages[0];
        state.selectedLanguage = lang.language;
        state.selectedLevel = lang.level;
        
        // Show matching screen directly
        showMatchingScreen(lang.language, lang.level);
        
        // Create a matched user and start video chat after matching
        setTimeout(() => {
            const availableUsers = users.filter(u => u.name !== user.name);
            const matchedUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
            const levelDurations = {
                'Basic': 10,
                'Intermediate': 10,
                'Advanced': 10,
                'Professional': 10,
                'Native': 10
            };
            const duration = levelDurations[lang.level] || 10;
            startActualVideoChat(matchedUser, duration);
        }, 10000); // 10 seconds matching time (testing)
    } else {
        // Multiple languages - show language selection but only with user's languages
        console.log('User has multiple languages, showing selection');
        setupSignedInUserLanguageSelection(user);
    }
}

// Setup language selection for signed-in users
function setupSignedInUserLanguageSelection(user) {
    renderDots();
    setupBackButton();
    setupCardDrag();
    
    // Modify language buttons to show only user's languages
    const languageSelection = document.getElementById('language-selection');
    if (!languageSelection) return;
    
    const buttonGroup = languageSelection.querySelector('.button-group');
    if (!buttonGroup) return;
    
    // Clear and rebuild with only user's languages
    buttonGroup.innerHTML = user.languages.map(lang => `
        <button class="language-btn" data-language="${lang.language}" data-level="${lang.level}">${lang.language}</button>
    `).join('');
    
    // Setup click handlers for language buttons
    const languageBtns = buttonGroup.querySelectorAll('.language-btn');
    languageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const language = this.getAttribute('data-language');
            const level = this.getAttribute('data-level');
            
            console.log('Language selected:', language, 'with level:', level);
            state.selectedLanguage = language;
            state.selectedLevel = level;
            
            // Skip level selection since we already have it from profile
            // Go straight to matching
            document.querySelector('.center-container').style.display = 'none';
            showMatchingScreen(language, level);
            
            // Create a matched user and start video chat after matching
            setTimeout(() => {
                const availableUsers = users.filter(u => u.name !== user.name);
                const matchedUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
                const levelDurations = {
                    'Basic': 10,
                    'Intermediate': 10,
                    'Advanced': 10,
                    'Professional': 10,
                    'Native': 10
                };
                const duration = levelDurations[level] || 10;
                startActualVideoChat(matchedUser, duration);
            }, 10000); // 10 seconds matching time (testing)
        });
    });
}

// Start video chat session
function startVideoSession(sessionId) {
    console.log('=== Starting video session ===');
    console.log('Session ID:', sessionId);
    
    // Load user data from localStorage
    const userData = localStorage.getItem('tabbimate_current_user');
    let duration = 3; // default 3 minutes
    let currentUserName = 'Guest'; // default for guest users
    
    if (userData) {
        const user = JSON.parse(userData);
        console.log('User data loaded:', user);
        
        // Get duration based on level (in seconds for testing)
        const levelDurations = {
            'Basic': 10,  // 10 seconds for testing
            'Intermediate': 10,  // 10 seconds for testing
            'Advanced': 10,  // 10 seconds for testing
            'Professional': 10,  // 10 seconds for testing
            'Native': 10  // 10 seconds for testing
        };
        
        if (user.level && levelDurations[user.level]) {
            duration = levelDurations[user.level];
            console.log(`Duration set to ${duration} seconds based on level: ${user.level}`);
        }
    } else {
        console.log('No user data found, using default 10 seconds');
    }
    
    // Check if user is logged in via Firebase
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        const firebaseUser = firebase.auth().currentUser;
        currentUserName = firebaseUser.displayName || firebaseUser.email.split('@')[0];
        console.log('Logged in user:', currentUserName);
    }
    
    // Update local user name in video UI
    const localNameEl = document.getElementById('local-name');
    if (localNameEl) {
        localNameEl.textContent = `${currentUserName} (You)`;
    }
    
    // Set the matched user (for now, we'll randomly pick one or use from session storage)
    // In the future, this would come from the actual matching algorithm
    const storedMatchedUser = localStorage.getItem('tabbimate_matched_user');
    if (storedMatchedUser) {
        currentMatchedUser = JSON.parse(storedMatchedUser);
        console.log('Matched user loaded from storage:', currentMatchedUser.name);
    } else {
        // Pick a random user as matched partner (excluding April)
        const availableUsers = users.filter(u => u.name !== 'April');
        currentMatchedUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        console.log('Random matched user selected:', currentMatchedUser.name);
    }
    
    // Update the partner name in the UI (both places)
    const partnerNameEl = document.getElementById('matched-user-name');
    if (partnerNameEl) {
        partnerNameEl.textContent = currentMatchedUser.name;
    }
    const remoteNameEl = document.getElementById('remote-name');
    if (remoteNameEl) {
        remoteNameEl.textContent = currentMatchedUser.name.toLowerCase();
    }
    
    // Update Help menu with user's name
    const blockUsernameEl = document.getElementById('block-username');
    if (blockUsernameEl) {
        blockUsernameEl.textContent = currentMatchedUser.name;
    }
    const reportUsernameEl = document.getElementById('report-username');
    if (reportUsernameEl) {
        reportUsernameEl.textContent = currentMatchedUser.name;
    }
    
    // Update session info (favorite status and count)
    updateSessionInfo(currentMatchedUser.name);
    
    // Initialize session data for summary
    const userData2 = userData ? JSON.parse(userData) : {};
    sessionData = {
        sessionId: sessionId,
        startTime: new Date(),
        language: userData2.language || 'English',
        level: userData2.level || 'Basic',
        partner: currentMatchedUser.name,
        durationMinutes: Math.round(duration / 60) // Convert seconds to minutes for display
    };
    console.log('Session data initialized:', sessionData);
    
    // Show matching screen first
    console.log('Showing matching screen before starting session...');
    showMatchingScreen(userData2.language || 'English', userData2.level || 'Basic');
    
    // Wait 1 minute then start the video chat
    setTimeout(() => {
        console.log('Match found! Starting video session...');
        
        // Hide matching screen
        const matchingScreen = document.getElementById('matching-screen');
        if (matchingScreen) {
            matchingScreen.classList.add('hidden');
        }
        
        // Show video chat
        document.querySelector('.map-container').style.display = 'none';
        document.querySelector('.center-container').style.display = 'none';
        document.getElementById('video-chat').classList.remove('hidden');
        
        // Initialize video controls and UI
        console.log('Initializing video controls...');
        setupVideoControls();
        
        console.log('Starting timer...');
        startCallTimer(duration); // Start timer with duration in seconds
        
        console.log('=== Video session initialization complete ===');
    }, 10000); // 10 seconds matching time (testing)
}

// Setup video controls
function setupVideoControls() {
    console.log('Setting up video controls...');
    
    // Wait a brief moment for DOM to be ready
    setTimeout(() => {
        // Initialize all video chat components
        setupToggleButtons();
        setupVideoCallControls();
        setupFavoriteButton();
        setupHelpMenu();
        setupAIChatBox();
        setupMessageChannel();
        setupSessionSummary();
        
        console.log('Video controls initialized');
    }, 100);
}

// Store dot and tooltip references for filtering
const userDots = [];

// Render user dots on the map
function renderDots() {
    const container = document.getElementById('dots-container');
    console.log('Rendering dots. Container:', container);
    console.log('Number of users:', users.length);
    
    users.forEach((user, index) => {
        console.log(`Creating dot ${index + 1} for ${user.name} at`, user.location);
        
        // Create dot
        const dot = document.createElement('div');
        dot.className = 'user-dot';
        dot.style.top = user.location.top;
        dot.style.left = user.location.left;
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-name">${user.name}</div>
            <div class="tooltip-languages">${formatLanguages(user.languages)}</div>
            <div class="tooltip-interests">Interests: ${user.interests.join(', ')}</div>
        `;
        
        // Add hover events
        dot.addEventListener('mouseenter', (e) => {
            console.log('Mouse entered dot for:', user.name);
            showTooltip(tooltip, dot);
        });
        
        dot.addEventListener('mouseleave', () => {
            console.log('Mouse left dot for:', user.name);
            tooltip.classList.remove('visible');
        });
        
        container.appendChild(dot);
        document.body.appendChild(tooltip); // Append to body instead of container
        
        // Store reference for filtering
        userDots.push({ user, dot, tooltip });
        
        console.log(`Dot ${index + 1} appended to container`);
    });
    
    console.log('All dots rendered. Total children in container:', container.children.length);
}

// Filter dots by selected language
function filterDotsByLanguage(selectedLanguage) {
    const langKey = selectedLanguage.toLowerCase();
    
    console.log(`Filtering dots for language: ${selectedLanguage}`);
    
    userDots.forEach(({ user, dot, tooltip }) => {
        // Check if user speaks the selected language
        const speaksLanguage = user.languages.hasOwnProperty(langKey);
        
        if (speaksLanguage) {
            dot.style.display = 'block';
            console.log(`${user.name} speaks ${selectedLanguage} - showing dot`);
        } else {
            dot.style.display = 'none';
            tooltip.classList.remove('visible'); // Hide tooltip if dot is hidden
            console.log(`${user.name} does NOT speak ${selectedLanguage} - hiding dot`);
        }
    });
}

// Show tooltip near dot
function showTooltip(tooltip, dot) {
    const dotRect = dot.getBoundingClientRect();
    const tooltipWidth = 250; // approximate
    const tooltipHeight = 100; // approximate
    
    console.log('showTooltip called. Dot position:', dotRect);
    
    // Default position: to the right and slightly above
    let top = dotRect.top - tooltipHeight / 2;
    let left = dotRect.right + 12;
    
    // Adjust if too close to right edge
    if (left + tooltipWidth > window.innerWidth) {
        left = dotRect.left - tooltipWidth - 12;
    }
    
    // Adjust if too close to top
    if (top < 10) {
        top = 10;
    }
    
    // Adjust if too close to bottom
    if (top + tooltipHeight > window.innerHeight) {
        top = window.innerHeight - tooltipHeight - 10;
    }
    
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.position = 'fixed';
    tooltip.style.zIndex = '10001';
    tooltip.style.display = 'block';
    tooltip.classList.add('visible');
    
    console.log('Tooltip positioned at:', { top, left });
    console.log('Tooltip classes:', tooltip.className);
    console.log('Tooltip visible?', window.getComputedStyle(tooltip).opacity);
}

// Setup language button handlers
function setupLanguageButtons() {
    const languageButtons = document.querySelectorAll('.language-btn');
    
    languageButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const language = btn.getAttribute('data-language');
            selectLanguage(language);
        });
    });
}

// Handle language selection
function selectLanguage(language) {
    state.selectedLanguage = language;
    state.currentView = 'session-levels';
    
    // Update the selected language text
    document.getElementById('selected-language').textContent = language;
    
    // Update which level buttons are available
    updateLevelButtonsAvailability();
    
    // Filter dots based on selected language
    filterDotsByLanguage(language);
    
    // Transition between views
    const languageView = document.getElementById('language-selection');
    const levelsView = document.getElementById('session-levels');
    
    // Fade out language selection
    languageView.classList.add('fade-out');
    
    setTimeout(() => {
        languageView.classList.add('hidden');
        languageView.classList.remove('fade-out');
        
        // Fade in session levels
        levelsView.classList.remove('hidden');
        setTimeout(() => {
            levelsView.classList.add('fade-in');
        }, 10);
    }, 300);
}

// Setup level button handlers
function setupLevelButtons() {
    const levelButtons = document.querySelectorAll('.level-btn');
    
    levelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Check if button is disabled (check both attribute and class)
            if (btn.disabled || btn.classList.contains('disabled')) {
                console.log('Button is disabled, ignoring click');
                return;
            }
            
            const level = btn.getAttribute('data-level');
            const duration = parseInt(btn.getAttribute('data-duration'));
            console.log('Level button clicked:', level, 'Duration:', duration);
            
            // Check if user is signed in via Firebase
            const isSignedIn = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser);
            
            if (!isSignedIn) {
                // Guest user - show interest selection
                console.log('Guest user: showing interest selection');
                showInterestSelection(level);
            } else {
                // Signed-in user - skip interest selection, go straight to matching
                console.log('Signed-in user: skipping interest selection, going to matching');
                state.selectedLevel = level;
                
                // Get user's interests from localStorage profile
                const userId = firebase.auth().currentUser.uid;
                const profileKey = `tabbimate_profile_${userId}`;
                const savedProfile = localStorage.getItem(profileKey);
                let userInterests = [];
                
                if (savedProfile) {
                    try {
                        const profile = JSON.parse(savedProfile);
                        if (profile.interests && Array.isArray(profile.interests)) {
                            userInterests = profile.interests;
                        }
                    } catch (error) {
                        console.error('Error parsing profile for interests:', error);
                    }
                }
                
                // Store user data for the session
                localStorage.setItem('tabbimate_current_user', JSON.stringify({
                    userId: userId,
                    language: state.selectedLanguage,
                    level: level,
                    interests: userInterests
                }));
                
                // Hide the language/level selection card
                document.querySelector('.center-container').style.display = 'none';
                
                // Show matching screen
                showMatchingScreen(state.selectedLanguage, level);
                
                // Find a match and start video chat after matching period
                setTimeout(() => {
                    const availableUsers = users.filter(u => u.name !== 'Guest');
                    const matchedUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
                    startActualVideoChat(matchedUser, duration);
                }, 10000); // 10 seconds matching time (testing)
            }
        });
    });
}

// Update level buttons based on current user's ability in selected language
function updateLevelButtonsAvailability() {
    const currentUser = GUEST_MODE ? null : users.find(u => u.name === 'April');
    
    // If no user is logged in (guest mode), keep all buttons active
    if (!currentUser) {
        console.log('Guest mode: All level buttons active');
        const levelButtons = document.querySelectorAll('.level-btn');
        levelButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
        return;
    }
    
    if (!state.selectedLanguage) return;
    
    const langKey = state.selectedLanguage.toLowerCase();
    const myLevel = currentUser.languages[langKey];
    
    // If user doesn't have this language in their profile, keep all buttons active
    // (they might be learning it for the first time)
    if (!myLevel) {
        console.log(`User hasn't set level for ${state.selectedLanguage} yet - all buttons active`);
        const levelButtons = document.querySelectorAll('.level-btn');
        levelButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
        return;
    }
    
    console.log(`Updating level buttons for ${state.selectedLanguage}, my level: ${myLevel}`);
    
    const levelButtons = document.querySelectorAll('.level-btn');
    
    levelButtons.forEach(btn => {
        const buttonLevel = btn.getAttribute('data-level');
        
        // "Native" button is always available (to talk with native speakers)
        if (buttonLevel === 'Native') {
            btn.disabled = false;
            btn.classList.remove('disabled');
            return;
        }
        
        // For other levels, only enable if it matches user's level
        if (buttonLevel === myLevel) {
            btn.disabled = false;
            btn.classList.remove('disabled');
        } else {
            btn.disabled = true;
            btn.classList.add('disabled');
        }
    });
}

// Handle level selection
async function selectLevel(level, durationMinutes) {
    const selection = {
        language: state.selectedLanguage,
        level: level,
        durationMinutes: durationMinutes
    };
    
    console.log('Session selection:', selection);
    
    // Find a match based on selected language and level
    const matchedUser = findMatch(state.selectedLanguage, level);
    
    if (matchedUser) {
        console.log('Matched with:', matchedUser.name);
        startVideoChat(matchedUser, durationMinutes);
    } else {
        console.log('No match found');
        await customAlert('No available users for this level. Please try another!', 'No Match Found');
    }
}

// Find a matching user
function findMatch(selectedLanguage, level) {
    const langKey = selectedLanguage.toLowerCase();
    const currentUser = GUEST_MODE ? null : users.find(u => u.name === 'April');
    
    if (!currentUser) return null;
    
    // Get current user's level in the selected language
    const myLevel = currentUser.languages[langKey];
    
    console.log(`Looking for match: Language=${selectedLanguage}, My Level=${myLevel}, Seeking=${level}`);
    
    // Filter users who speak the selected language
    const availableUsers = users.filter(user => {
        // Skip April (the current user)
        if (user.name === 'April') return false;
        
        // Check if they speak the language
        if (!user.languages.hasOwnProperty(langKey)) return false;
        
        const theirLevel = user.languages[langKey];
        
        // Case 1: Talk with Native - match with native speakers only
        if (level === 'Native') {
            return theirLevel === 'Native';
        }
        
        // Case 2: Same level matching (Basic, Intermediate, Professional)
        // Match users with the exact same level
        return theirLevel === myLevel;
    });
    
    console.log('Available users for matching:', availableUsers.map(u => ({
        name: u.name,
        level: u.languages[langKey]
    })));
    
    if (availableUsers.length === 0) {
        console.log('No match found with matching level');
        return null;
    }
    
    // Return a random match from available users
    return availableUsers[Math.floor(Math.random() * availableUsers.length)];
}

// Update session count and favorite button
function updateSessionInfo(username) {
    const favoriteData = FavoritesManager.getFavoriteData(username);
    const sessionCountEl = document.getElementById('session-count');
    const favoriteBtn = document.getElementById('favorite-btn');
    
    if (!sessionCountEl || !favoriteBtn) return;
    
    const tooltip = favoriteBtn.querySelector('.favorite-tooltip');
    
    if (favoriteData) {
        sessionCountEl.textContent = `${favoriteData.sessionCount} sessions`;
        favoriteBtn.classList.add('favorited');
        if (tooltip) tooltip.textContent = 'Remove from Favorites';
    } else {
        sessionCountEl.textContent = '1 session';
        favoriteBtn.classList.remove('favorited');
        if (tooltip) tooltip.textContent = 'Add to Favorites';
    }
}

// Setup favorite button
function setupFavoriteButton() {
    console.log('Setting up favorite button...');
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn) {
        console.error('Favorite button not found!');
        return;
    }
    
    const tooltip = favoriteBtn.querySelector('.favorite-tooltip');
    
    if (!favoriteBtn.dataset.listenerAttached) {
        favoriteBtn.addEventListener('click', async () => {
            console.log('Favorite button clicked');
            if (!currentMatchedUser) return;
            
            const username = currentMatchedUser.name;
            const isFavorited = FavoritesManager.toggleFavorite(username);
            
            if (isFavorited) {
                favoriteBtn.classList.add('favorited');
                if (tooltip) tooltip.textContent = 'Remove from Favorites';
                await customAlert(`${username} has been added to your favorites! You'll be more likely to match with them in the future.`, 'Added to Favorites');
            } else {
                favoriteBtn.classList.remove('favorited');
                if (tooltip) tooltip.textContent = 'Add to Favorites';
                await customAlert(`${username} has been removed from your favorites.`, 'Removed from Favorites');
            }
            
            // Update session count
            updateSessionInfo(username);
        });
        favoriteBtn.dataset.listenerAttached = 'true';
    }
    
    console.log('Favorite button setup complete');
}

// Setup username click to show profile
function setupUsernameClick() {
    console.log('Setting up username click...');
    const partnerNameEl = document.getElementById('matched-user-name');
    if (!partnerNameEl) {
        console.error('Partner name element not found!');
        return;
    }
    
    if (!partnerNameEl.dataset.listenerAttached) {
        partnerNameEl.addEventListener('click', () => {
            console.log('Partner name clicked, currentMatchedUser:', currentMatchedUser);
            if (!currentMatchedUser) {
                console.error('No matched user available!');
                return;
            }
            showUserProfile(currentMatchedUser);
        });
        partnerNameEl.dataset.listenerAttached = 'true';
        
        // Make it look clickable
        partnerNameEl.style.cursor = 'pointer';
    }
    
    console.log('Username click setup complete');
}

// Show user profile in modal
function showUserProfile(user) {
    console.log('Showing user profile for:', user.name);
    const languages = formatLanguages(user.languages);
    const interests = user.interests.join(', ');
    
    const profileHTML = `
        <div style="text-align: left;">
            <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px 0; color: #333; font-size: 20px;">${user.name}</h3>
                <p style="margin: 0; color: #666; font-size: 14px;">📍 ${getLocationName(user)}</p>
            </div>
            
            <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 8px 0; color: #333; font-weight: 600; font-size: 14px;">Languages:</p>
                <p style="margin: 0; color: #666; font-size: 14px;">${languages}</p>
            </div>
            
            <div style="margin-bottom: 16px;">
                <p style="margin: 0 0 8px 0; color: #333; font-weight: 600; font-size: 14px;">Interests:</p>
                <p style="margin: 0; color: #666; font-size: 14px;">${interests}</p>
            </div>
        </div>
    `;
    
    // Use showModal directly to pass HTML content
    showModal(`${user.name}'s Profile`, { html: profileHTML }, [
        { text: 'OK', value: true, className: 'modal-btn-primary' }
    ]);
}

// Helper function to get readable location name
function getLocationName(user) {
    const locationMap = {
        'April': 'Berkeley, CA',
        'Marty': 'Chicago, IL',
        'Sofia': 'Bogotá, Colombia',
        'Kenji': 'Tokyo, Japan',
        'Hyejin': 'Seoul, Korea',
        'Carlos': 'Mexico City, Mexico',
        'Ravi': 'Mumbai, India',
        'Maria': 'Manila, Philippines',
        'Liam': 'Sydney, Australia',
        'Emma': 'London, UK',
        'Yuki': 'Tokyo, Japan',
        'Diego': 'Buenos Aires, Argentina',
        'Amelie': 'Paris, France',
        'Chen': 'Beijing, China',
        'Isabella': 'Rio de Janeiro, Brazil',
        'Ahmed': 'Cairo, Egypt',
        'Nina': 'Cape Town, South Africa',
        'Paolo': 'Rome, Italy',
        'Fatima': 'Karachi, Pakistan',
        'Lars': 'Stockholm, Sweden'
    };
    
    return locationMap[user.name] || 'Unknown';
}

// Setup Help Menu
function setupHelpMenu() {
    console.log('Setting up help menu...');
    const helpBtn = document.getElementById('help-btn');
    const helpMenu = document.getElementById('help-menu');
    const guidelinesBtn = document.getElementById('session-guidelines');
    const blockBtn = document.getElementById('block-user');
    const reportBtn = document.getElementById('report-user');
    
    if (!helpBtn || !helpMenu) {
        console.error('Help button or menu not found!');
        return;
    }
    
    // Remove existing listeners by checking flag
    if (!helpBtn.dataset.listenerAttached) {
        // Toggle help menu
        helpBtn.addEventListener('click', (e) => {
            console.log('Help button clicked');
            e.stopPropagation();
            helpMenu.classList.toggle('hidden');
        });
        helpBtn.dataset.listenerAttached = 'true';
    }
    
    // Close menu when clicking outside (only attach once)
    if (!document.body.dataset.helpMenuListenerAttached) {
        document.addEventListener('click', (e) => {
            if (!helpMenu.contains(e.target) && e.target !== helpBtn) {
                helpMenu.classList.add('hidden');
            }
        });
        document.body.dataset.helpMenuListenerAttached = 'true';
    }
    
    // Session Guidelines
    if (guidelinesBtn && !guidelinesBtn.dataset.listenerAttached) {
        guidelinesBtn.addEventListener('click', () => {
            helpMenu.classList.add('hidden');
            showSessionGuidelines();
        });
        guidelinesBtn.dataset.listenerAttached = 'true';
    }
    
    // Block User
    if (blockBtn && !blockBtn.dataset.listenerAttached) {
        blockBtn.addEventListener('click', () => {
            helpMenu.classList.add('hidden');
            if (currentMatchedUser) {
                blockUser(currentMatchedUser.name);
            }
        });
        blockBtn.dataset.listenerAttached = 'true';
    }
    
    // Report User
    if (reportBtn && !reportBtn.dataset.listenerAttached) {
        reportBtn.addEventListener('click', () => {
            helpMenu.classList.add('hidden');
            if (currentMatchedUser) {
                reportUser(currentMatchedUser.name);
            }
        });
        reportBtn.dataset.listenerAttached = 'true';
    }
    
    console.log('Help menu setup complete');
}

// Show Session Guidelines
async function showSessionGuidelines() {
    const message = `Be respectful and kind to your language partner.

Practice the selected language during your session.

Use the AI assistant for real-time help and translations.`;
    
    await customAlert(message, 'Session Guidelines');
}

// Block User
async function blockUser(username) {
    const message = `Are you sure you want to block ${username}?

This will end the session immediately and you won't be matched with this user again.

This action cannot be undone.`;
    
    const confirmed = await showModal(`Block ${username}`, message, [
        { text: 'Cancel', value: false, className: 'modal-btn-secondary' },
        { text: 'Block', value: true, className: 'modal-btn-danger' }
    ]);
    
    if (confirmed) {
        console.log('Blocking user:', username);
        await customAlert(`${username} has been blocked.`, 'User Blocked');
        endVideoChat();
    }
}

// Report User
async function reportUser(username) {
    const reason = await customPrompt(
        `Please describe why you are reporting ${username}.`,
        `Report ${username}`,
        ''
    );
    
    if (reason && reason.trim()) {
        console.log('Reporting user:', username, 'Reason:', reason);
        
        await customAlert(`Thank you for your report. Our team will review it shortly.`, 'Report Submitted');
        
        // Optionally end the call
        const endCall = await customConfirm('Would you like to end this session now?', 'End Session');
        if (endCall) {
            endVideoChat();
        }
    }
}

// Show matching screen
function showMatchingScreen(language, level) {
    console.log('=== Showing matching screen ===');
    
    // Hide map and card
    document.querySelector('.map-container').style.display = 'none';
    document.querySelector('.center-container').style.display = 'none';
    
    // Show matching screen
    const matchingScreen = document.getElementById('matching-screen');
    matchingScreen.classList.remove('hidden');
    
    // Update matching info
    document.getElementById('matching-language').textContent = language;
    document.getElementById('matching-level').textContent = level;
    
    // Start countdown timer from 9 seconds (testing)
    let timeRemaining = 9;
    const timerElement = document.getElementById('matching-timer');
    
    console.log('Timer element found:', timerElement);
    
    if (!timerElement) {
        console.error('Timer element not found!');
        return;
    }
    
    // Update timer display immediately
    timerElement.textContent = `00:${String(timeRemaining).padStart(2, '0')}`;
    console.log('Initial timer set to:', timerElement.textContent);
    
    // Setup countdown interval
    const countdownInterval = setInterval(() => {
        timeRemaining--;
        console.log('Timer countdown:', timeRemaining);
        
        if (timeRemaining >= 0) {
            timerElement.textContent = `00:${String(timeRemaining).padStart(2, '0')}`;
        }
        
        if (timeRemaining <= 0) {
            clearInterval(countdownInterval);
            console.log('Timer countdown complete');
        }
    }, 1000);
    
    // Setup cancel button
    const cancelBtn = document.getElementById('cancel-matching');
    cancelBtn.onclick = () => {
        console.log('Matching cancelled by user');
        console.log('Current pathname:', window.location.pathname);
        clearInterval(countdownInterval); // Clear the countdown
        
        // Check if user is signed in
        const isSignedIn = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser);
        console.log('Is signed in?', isSignedIn);
        
        if (isSignedIn) {
            // Signed-in user - redirect to their dashboard
            const userId = firebase.auth().currentUser.uid;
            console.log('User ID:', userId);
            const dashboardUrl = window.location.pathname.includes('tabbimate')
                ? `${window.location.origin}/tabbimate/dashboard/${userId}`
                : `${window.location.origin}/dashboard/${userId}`;
            console.log('Signed-in user, redirecting to dashboard:', dashboardUrl);
            window.location.href = dashboardUrl;
        } else {
            // Guest user - redirect to index page
            const indexUrl = window.location.pathname.includes('tabbimate') 
                ? `${window.location.origin}/tabbimate/index.html`
                : `${window.location.origin}/index.html`;
            console.log('Guest user, redirecting to index:', indexUrl);
            window.location.href = indexUrl;
        }
    };
    
    console.log('Matching screen shown, waiting 1 minute...');
}

// Start video chat with matched user
async function startVideoChat(matchedUser, durationSeconds) {
    console.log('Starting video chat with:', matchedUser.name, 'Duration:', durationSeconds, 'seconds');
    
    // Check if Makedo is already logged in
    if (!makedoState.isLoggedIn) {
        console.log('Makedo not logged in, showing login modal...');
        
        const loginResult = await showMakedoLoginModal();
        
        if (!loginResult.success) {
            // User skipped or login failed
            if (loginResult.skipped) {
                console.log('User skipped video login - proceeding without video');
                await customAlert(
                    'Video chat is disabled. You can still use text chat and AI features during your session.',
                    'Video Unavailable'
                );
            }
            // Continue with regular flow (video will be placeholders)
        } else {
            console.log('Makedo login successful, proceeding with real video...');
        }
    }
    
    // First show matching screen
    showMatchingScreen(state.selectedLanguage, getLevelName(durationSeconds));
    
    // Wait 10 seconds then start the actual video chat
    setTimeout(() => {
        console.log('Match found! Starting video chat...');
        startActualVideoChat(matchedUser, durationSeconds);
    }, 10000); // 10 seconds matching time (testing)
}

// Initialize video connection with matched user
async function initializeVideoConnection(matchedUser) {
    console.log('=== Initializing video connection with:', matchedUser.name, '===');
    
    if (!window.vibeChat || !window.vibeChat.bridge) {
        console.error('VibeChat not initialized properly!');
        return;
    }
    
    try {
        // For demo purposes, we'll use the matched user's name to find them
        // In production, you'd map matchedUser to actual Makedo user PIDs
        console.log('Searching for user:', matchedUser.name);
        
        // Get available users from Makedo
        const users = await window.vibeChat.bridge.getUsersByQuery({ 
            query: matchedUser.name, 
            count: 5, 
            depth: 1 
        });
        
        console.log('Found users:', users);
        
        // Find matching user (case insensitive)
        const vibechatUser = users.find(u => 
            u.username && u.username.toLowerCase() === matchedUser.name.toLowerCase()
        );
        
        if (!vibechatUser) {
            console.warn('Could not find matching Makedo user for:', matchedUser.name);
            console.log('Proceeding without video connection');
            return;
        }
        
        console.log('Found matching user:', vibechatUser);
        
        // Create channel with the user
        await window.vibeChat.handleUserClick(vibechatUser);
        
        // Wait a moment for channel setup
        setTimeout(async () => {
            try {
                console.log('Enabling video and audio...');
                
                // Enable video and audio
                await window.vibeChat.handleVideoToggle();
                await window.vibeChat.handleAudioToggle();
                
                // Wait another moment for streams to initialize
                setTimeout(async () => {
                    // Join the channel (start broadcasting)
                    console.log('Joining video channel...');
                    await window.vibeChat.performJoin();
                    
                    console.log('✓ Video connection established!');
                }, 1000);
                
            } catch (error) {
                console.error('Error enabling video/audio:', error);
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error initializing video connection:', error);
    }
}

// Actually start the video chat (called after matching)
function startActualVideoChat(matchedUser, durationSeconds) {
    console.log('=== Starting actual video chat ===');
    
    // Store matched user and duration
    currentMatchedUser = matchedUser;
    state.sessionDuration = durationSeconds;
    
    // Track session data for summary
    sessionData = {
        sessionId: generateSessionId(),
        startTime: new Date(),
        language: state.selectedLanguage,
        level: getLevelName(durationSeconds),
        partner: matchedUser.name,
        durationMinutes: Math.round(durationSeconds / 60) // Convert seconds to minutes for display
    };
    
    console.log('Session started with ID:', sessionData.sessionId);
    
    // Update URL to include session ID with /session/ path
    const baseUrl = window.location.pathname.replace(/\/$/, ''); // Remove trailing slash
    const newUrl = `${window.location.origin}${baseUrl}/session/${sessionData.sessionId}`;
    window.history.pushState({ sessionId: sessionData.sessionId }, '', newUrl);
    
    // Determine current user name (Guest or logged-in user)
    let currentUserName = 'Guest';
    if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        const firebaseUser = firebase.auth().currentUser;
        currentUserName = firebaseUser.displayName || firebaseUser.email.split('@')[0];
    }
    
    // Update local user name in video UI
    const localNameEl = document.getElementById('local-name');
    if (localNameEl) {
        localNameEl.textContent = `${currentUserName} (You)`;
    }
    
    // Update UI with matched user info
    document.getElementById('matched-user-name').textContent = matchedUser.name;
    document.getElementById('remote-name').textContent = matchedUser.name.toLowerCase();
    
    // Update Help menu with user's name
    document.getElementById('block-username').textContent = matchedUser.name;
    document.getElementById('report-username').textContent = matchedUser.name;
    
    // Update session count and favorite status
    updateSessionInfo(matchedUser.name);
    
    // Hide matching screen and show video chat
    const matchingScreen = document.getElementById('matching-screen');
    if (matchingScreen) {
        matchingScreen.classList.add('hidden');
    }
    document.querySelector('.map-container').style.display = 'none';
    document.querySelector('.center-container').style.display = 'none';
    document.getElementById('video-chat').classList.remove('hidden');
    
    // Setup all video controls (buttons, chat, etc.)
    setupVideoControls();
    
    // Initialize video connection if Makedo is logged in
    if (makedoState.isLoggedIn) {
        initializeVideoConnection(matchedUser);
    } else {
        console.log('Makedo not logged in - video will remain as placeholders');
    }
    
    // Start the call timer
    startCallTimer(durationSeconds);
    
    console.log('=== Video chat started successfully ===');
}

// Helper to get level name from duration (in seconds)
function getLevelName(durationSeconds) {
    switch(durationSeconds) {
        case 10: return 'Basic';  // Testing: 10 seconds
        case 180: return 'Basic';  // Production: 3 minutes
        case 900: return 'Intermediate';  // 15 minutes
        case 1800: return 'Advanced / Professional';  // 30 minutes
        default: return 'Practice Session';
    }
}

// Setup back button
function setupBackButton() {
    const backBtn = document.getElementById('back-to-languages');
    
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goBackToLanguages();
    });
}

// Go back to language selection
function goBackToLanguages() {
    state.currentView = 'language-selection';
    state.selectedLanguage = null;
    
    // Show all dots again
    showAllDots();
    
    const languageView = document.getElementById('language-selection');
    const levelsView = document.getElementById('session-levels');
    
    // Fade out levels view
    levelsView.classList.remove('fade-in');
    levelsView.classList.add('fade-out');
    
    setTimeout(() => {
        levelsView.classList.add('hidden');
        levelsView.classList.remove('fade-out');
        
        // Fade in language selection
        languageView.classList.remove('hidden');
        setTimeout(() => {
            languageView.classList.add('fade-in');
        }, 10);
    }, 300);
}

// Show all dots (when no language is selected)
function showAllDots() {
    console.log('Showing all dots');
    userDots.forEach(({ dot }) => {
        dot.style.display = 'block';
    });
}

// Setup video call controls
function setupVideoCallControls() {
    console.log('Setting up video call controls...');
    console.log('Looking for leave-call button...');
    const leaveBtn = document.getElementById('leave-call');
    
    if (!leaveBtn) {
        console.error('Leave button not found!');
        console.log('Available buttons:', document.querySelectorAll('button').length);
        return;
    }
    
    console.log('Leave button found:', leaveBtn);
    console.log('Leave button already has listener?', leaveBtn.dataset.listenerAttached);
    
    // Check if already setup
    if (leaveBtn.dataset.listenerAttached === 'true') {
        console.log('Leave button listener already attached, skipping');
        return;
    }
    
    leaveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('=== Leave button clicked ===');
        console.log('customConfirm function exists?', typeof customConfirm);
        const confirmed = await customConfirm('Are you sure you want to leave this session?', 'Leave Session');
        console.log('User confirmed:', confirmed);
        if (confirmed) {
            console.log('User confirmed leave, clearing timer and showing summary');
            // Clear timer
            if (timerInterval) {
                clearInterval(timerInterval);
            }
            // Show session summary
            showSessionSummary();
        } else {
            console.log('User cancelled leave');
        }
    });
    
    leaveBtn.dataset.listenerAttached = 'true';
    console.log('Leave button listener attached successfully');
}

// Setup toggle buttons (video, audio, AI, chat, share)
// Reposition chat boxes side by side when both are open
function repositionChatBoxes() {
    const aiChatBox = document.getElementById('ai-chat-box');
    const messageChannel = document.getElementById('message-channel');
    
    const aiIsOpen = !aiChatBox.classList.contains('hidden');
    const chatIsOpen = !messageChannel.classList.contains('hidden');
    
    if (aiIsOpen && chatIsOpen) {
        // Both open: position side by side
        aiChatBox.style.right = '420px'; // Chat box width (360px) + gap (40px) + some padding
        messageChannel.style.right = '40px';
    } else if (aiIsOpen) {
        // Only AI open: center it
        aiChatBox.style.right = '40px';
    } else if (chatIsOpen) {
        // Only Chat open: center it
        messageChannel.style.right = '40px';
    }
}

function setupToggleButtons() {
    console.log('Setting up toggle buttons...');
    
    // Video toggle
    const cameraBtn = document.getElementById('toggle-camera');
    if (cameraBtn && !cameraBtn.dataset.listenerAttached) {
        cameraBtn.addEventListener('click', async function() {
            const isActive = this.dataset.active === 'true';
            this.dataset.active = !isActive;
            
            // If VibeChat is available, toggle actual video
            if (window.vibeChat && makedoState.isLoggedIn) {
                try {
                    await window.vibeChat.handleVideoToggle();
                    console.log('VibeChat Video:', window.vibeChat.state.videoActive ? 'ON' : 'OFF');
                } catch (error) {
                    console.error('Error toggling video:', error);
                }
            } else {
                console.log('Video:', !isActive ? 'ON' : 'OFF', '(placeholder mode)');
            }
        });
        cameraBtn.dataset.listenerAttached = 'true';
    }
    
    // Audio toggle
    const micBtn = document.getElementById('toggle-mic');
    if (micBtn && !micBtn.dataset.listenerAttached) {
        micBtn.addEventListener('click', async function() {
            const isActive = this.dataset.active === 'true';
            this.dataset.active = !isActive;
            
            // Toggle mute indicator for local user
            const localMuteIndicator = document.getElementById('local-mute-indicator');
            if (localMuteIndicator) {
                if (isActive) {
                    // Was active, now muted
                    localMuteIndicator.classList.remove('hidden');
                } else {
                    // Was muted, now active
                    localMuteIndicator.classList.add('hidden');
                }
            }
            
            // If VibeChat is available, toggle actual audio
            if (window.vibeChat && makedoState.isLoggedIn) {
                try {
                    await window.vibeChat.handleAudioToggle();
                    console.log('VibeChat Audio:', window.vibeChat.state.audioActive ? 'ON' : 'OFF');
                } catch (error) {
                    console.error('Error toggling audio:', error);
                }
            } else {
                console.log('Audio:', !isActive ? 'ON' : 'OFF', '(placeholder mode)');
            }
        });
        micBtn.dataset.listenerAttached = 'true';
    }
    
    // AI chat toggle
    const aiBtn = document.getElementById('toggle-ai');
    if (aiBtn && !aiBtn.dataset.listenerAttached) {
        aiBtn.addEventListener('click', function() {
            const isActive = this.dataset.active === 'true';
            this.dataset.active = !isActive;
            
            const aiChatBox = document.getElementById('ai-chat-box');
            
            if (!isActive) {
                aiChatBox.classList.remove('hidden');
                repositionChatBoxes(); // Reposition if both are open
            } else {
                aiChatBox.classList.add('hidden');
                repositionChatBoxes(); // Reposition remaining box
            }
            
            console.log('AI Chat:', !isActive ? 'ON' : 'OFF');
        });
        aiBtn.dataset.listenerAttached = 'true';
    }
    
    // Message channel toggle
    const chatBtn = document.getElementById('toggle-chat');
    if (chatBtn && !chatBtn.dataset.listenerAttached) {
        chatBtn.addEventListener('click', function() {
            const isActive = this.dataset.active === 'true';
            this.dataset.active = !isActive;
            
            const messageChannel = document.getElementById('message-channel');
            
            if (!isActive) {
                messageChannel.classList.remove('hidden');
                repositionChatBoxes(); // Reposition if both are open
            } else {
                messageChannel.classList.add('hidden');
                repositionChatBoxes(); // Reposition remaining box
            }
            
            console.log('Message Channel:', !isActive ? 'ON' : 'OFF');
        });
        chatBtn.dataset.listenerAttached = 'true';
    }
    
    // Share screen
    const shareBtn = document.getElementById('toggle-share');
    if (shareBtn && !shareBtn.dataset.listenerAttached) {
        shareBtn.addEventListener('click', async function() {
            console.log('Share screen clicked');
            await customAlert('Screen sharing functionality will be added here!', 'Screen Share');
        });
        shareBtn.dataset.listenerAttached = 'true';
    }
    
    console.log('Toggle buttons setup complete');
}

// AI Language Coach - Conversation history
let aiConversationHistory = [];

// Build system prompt with session context
function buildAISystemPrompt() {
    const { selectedLanguage, matchedUser } = state;
    const currentUser = users.find(u => u.name === "April") || {};
    
    let userLevel = "unknown";
    if (selectedLanguage && currentUser.languages) {
        userLevel = currentUser.languages[selectedLanguage.toLowerCase()] || "unknown";
    }
    
    const partnerName = matchedUser ? matchedUser.name : "your partner";
    const languageName = selectedLanguage || "the target language";
    
    return `You are an AI language coach for TabbiMate, a live language practice platform.

CONTEXT:
- Student: April (learning ${languageName})
- Current level: ${userLevel}
- Practice partner: ${partnerName}
- Session type: Live video conversation

YOUR ROLE:
1. Correct mistakes gently and explain why
2. Provide translations between English and ${languageName}
3. Suggest conversation topics and follow-up questions
4. Keep responses concise (1-3 sentences max)
5. Be encouraging and supportive

GUIDELINES:
- When correcting: Show correct version → Explain briefly → Encourage
- When translating: Provide translation → Add pronunciation tip if helpful
- When suggesting: Offer 2-3 relevant conversation starters
- Always be warm, professional, and motivating`;
}

// Call AI API
async function callAIChat(userMessage, action = 'general') {
    const systemPrompt = buildAISystemPrompt();
    
    // Build messages array
    const messages = [
        { role: 'system', content: systemPrompt },
        ...aiConversationHistory,
        { role: 'user', content: userMessage }
    ];
    
    try {
        const response = await fetch('/api/ai-chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                systemPrompt: systemPrompt,
                messages: messages,
                action: action // Pass action for backend optimization
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update conversation history
        aiConversationHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: data.content }
        );
        
        // Keep history manageable (last 10 exchanges)
        if (aiConversationHistory.length > 20) {
            aiConversationHistory = aiConversationHistory.slice(-20);
        }
        
        return data.content;
    } catch (error) {
        console.error('AI Chat error:', error);
        
        // Fallback responses for development/demo
        if (error.message.includes('Failed to fetch') || error.message.includes('API error')) {
            return generateFallbackResponse(userMessage, action);
        }
        
        throw error;
    }
}

// Generate fallback responses (for development without backend)
function generateFallbackResponse(message, action) {
    const { selectedLanguage } = state;
    const lang = selectedLanguage || 'the target language';
    
    switch (action) {
        case 'correct':
            return `✓ **Corrected:** "${message}"\n\nGreat effort! Keep practicing and you'll get more comfortable with ${lang} grammar.`;
        
        case 'translate':
            return `🌐 **Translation:** [Translation would appear here]\n\n*Note: Connect to backend for real-time translations.*`;
        
        case 'suggest':
            return `💡 **Conversation starters:**\n1. What do you like to do in your free time?\n2. Have you tried any good restaurants recently?\n3. What are you working on these days?`;
        
        default:
            return `I'm here to help! You can ask me to:\n• **Correct** your sentences\n• **Translate** words or phrases\n• **Suggest** conversation topics\n\n*Note: Connect to backend for full AI features.*`;
    }
}

// Setup AI Chat Box with drag functionality
function setupAIChatBox() {
    const chatBox = document.getElementById('ai-chat-box');
    const chatHeader = document.getElementById('ai-chat-header');
    const closeBtn = document.getElementById('close-ai-chat');
    const sendBtn = document.getElementById('send-ai-message');
    const input = document.getElementById('ai-input');
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    
    // Make draggable
    makeDraggable(chatBox, chatHeader);
    
    // Close button
    closeBtn.addEventListener('click', () => {
        chatBox.classList.add('hidden');
        document.getElementById('toggle-ai').dataset.active = 'false';
    });
    
    // Quick action buttons
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.dataset.action;
            let prompt = '';
            
            switch (action) {
                case 'correct':
                    prompt = await customPrompt(
                        'Paste or type the sentence you want me to correct:',
                        'Correct Sentence'
                    );
                    if (prompt) {
                        handleAIRequest(`Please correct this sentence: "${prompt}"`, 'correct');
                    }
                    break;
                
                case 'translate':
                    prompt = await customPrompt(
                        'What would you like me to translate?',
                        'Translate'
                    );
                    if (prompt) {
                        handleAIRequest(`Please translate: "${prompt}"`, 'translate');
                    }
                    break;
                
                case 'suggest':
                    handleAIRequest('Please suggest some conversation topics we could discuss.', 'suggest');
                    break;
            }
        });
    });
    
    // Send message
    const sendAIMessage = () => {
        const message = input.value.trim();
        if (message) {
            input.value = '';
            handleAIRequest(message, 'general');
        }
    };
    
    sendBtn.addEventListener('click', sendAIMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAIMessage();
    });
}

// Handle AI request (show message, call API, show response)
async function handleAIRequest(userMessage, action = 'general') {
    // Add user message
    addAIMessage(userMessage, 'user');
    
    // Show loading
    const loadingId = addAIMessage('Thinking...', 'ai', true);
    
    try {
        // Call AI
        const response = await callAIChat(userMessage, action);
        
        // Remove loading, add response
        removeAIMessage(loadingId);
        addAIMessage(response, 'ai');
        
    } catch (error) {
        removeAIMessage(loadingId);
        addAIMessage('Sorry, I encountered an error. Please try again.', 'ai', false, true);
        console.error('AI request failed:', error);
    }
}

// Setup AI Pop-out Window
function setupAIPopout() {
    const popoutBtn = document.getElementById('popout-ai-chat');
    
    if (popoutBtn) {
        popoutBtn.addEventListener('click', () => {
            const { selectedLanguage, matchedUser } = state;
            const lang = selectedLanguage || 'Language';
            const partner = matchedUser ? matchedUser.name : 'Partner';
            
            const popout = window.open('', 'AI Assistant', 'width=450,height=650');
            
            popout.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>AI Language Coach - ${lang}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                            background: #FFFFFF;
                            height: 100vh;
                            display: flex;
                            flex-direction: column;
                        }
                        .header {
                            padding: 16px;
                            background: #BF3143;
                            color: white;
                            font-weight: 600;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .header svg {
                            width: 20px;
                            height: 20px;
                        }
                        .messages {
                            flex: 1;
                            padding: 16px;
                            overflow-y: auto;
                            display: flex;
                            flex-direction: column;
                            gap: 12px;
                        }
                        .message {
                            padding: 10px 14px;
                            border-radius: 12px;
                            max-width: 85%;
                            line-height: 1.5;
                        }
                        .ai-message {
                            background: #F7F7F8;
                            border: 1px solid #E5E5E7;
                            align-self: flex-start;
                        }
                        .ai-message strong {
                            color: #BF3143;
                            font-weight: 600;
                        }
                        .user-message {
                            background: #BF3143;
                            color: white;
                            align-self: flex-end;
                        }
                        .quick-actions {
                            padding: 12px;
                            border-top: 1px solid #E5E5E7;
                            display: flex;
                            gap: 8px;
                            background: #F7F7F8;
                        }
                        .quick-btn {
                            flex: 1;
                            padding: 8px;
                            background: white;
                            border: 1px solid #E5E5E7;
                            border-radius: 8px;
                            cursor: pointer;
                            font-size: 12px;
                            font-weight: 500;
                            transition: all 0.2s;
                        }
                        .quick-btn:hover {
                            background: #BF3143;
                            color: white;
                            border-color: #BF3143;
                        }
                        .input-container {
                            padding: 12px;
                            border-top: 1px solid #E5E5E7;
                            display: flex;
                            gap: 8px;
                        }
                        input {
                            flex: 1;
                            padding: 10px;
                            border: 1px solid #E5E5E7;
                            border-radius: 8px;
                            font-size: 14px;
                            font-family: inherit;
                        }
                        input:focus {
                            outline: none;
                            border-color: #BF3143;
                        }
                        button.send {
                            padding: 10px 16px;
                            background: #BF3143;
                            color: white;
                            border: none;
                            border-radius: 8px;
                            cursor: pointer;
                            font-weight: 500;
                        }
                        button.send:hover {
                            background: #a52938;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            <circle cx="9" cy="10" r="1" fill="currentColor"/>
                            <circle cx="15" cy="10" r="1" fill="currentColor"/>
                            <path d="M9 14h6" stroke-linecap="round"/>
                        </svg>
                        AI Language Coach - ${lang} with ${partner}
                    </div>
                    <div class="messages" id="messages">
                        <div class="message ai-message">
                            Hi! I'm your AI language coach. I can help you with corrections, translations, and conversation suggestions.
                        </div>
                    </div>
                    <div class="quick-actions">
                        <button class="quick-btn" onclick="askCorrect()">✓ Correct</button>
                        <button class="quick-btn" onclick="askTranslate()">🌐 Translate</button>
                        <button class="quick-btn" onclick="askSuggest()">💡 Suggest</button>
                    </div>
                    <div class="input-container">
                        <input type="text" id="input" placeholder="Ask me anything...">
                        <button class="send" onclick="sendMessage()">Send</button>
                    </div>
                    <script>
                        // Sync with main window
                        function sendMessage() {
                            const input = document.getElementById('input');
                            const message = input.value.trim();
                            if (message) {
                                addMessage(message, 'user');
                                input.value = '';
                                // Send to parent window
                                window.opener.postMessage({ type: 'ai-chat', message: message, action: 'general' }, '*');
                            }
                        }
                        
                        function askCorrect() {
                            const text = prompt('Paste or type the sentence you want me to correct:');
                            if (text) {
                                const message = 'Please correct this sentence: "' + text + '"';
                                addMessage(message, 'user');
                                window.opener.postMessage({ type: 'ai-chat', message: message, action: 'correct' }, '*');
                            }
                        }
                        
                        function askTranslate() {
                            const text = prompt('What would you like me to translate?');
                            if (text) {
                                const message = 'Please translate: "' + text + '"';
                                addMessage(message, 'user');
                                window.opener.postMessage({ type: 'ai-chat', message: message, action: 'translate' }, '*');
                            }
                        }
                        
                        function askSuggest() {
                            const message = 'Please suggest some conversation topics we could discuss.';
                            addMessage(message, 'user');
                            window.opener.postMessage({ type: 'ai-chat', message: message, action: 'suggest' }, '*');
                        }
                        
                        function addMessage(text, type) {
                            const messagesDiv = document.getElementById('messages');
                            const messageEl = document.createElement('div');
                            messageEl.className = 'message ' + type + '-message';
                            messageEl.innerHTML = '<p>' + text.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>').replace(/\\n/g, '<br>') + '</p>';
                            messagesDiv.appendChild(messageEl);
                            messagesDiv.scrollTop = messagesDiv.scrollHeight;
                        }
                        
                        // Listen for responses from parent
                        window.addEventListener('message', (event) => {
                            if (event.data.type === 'ai-response') {
                                addMessage(event.data.content, 'ai');
                            }
                        });
                        
                        // Enter key support
                        document.getElementById('input').addEventListener('keypress', (e) => {
                            if (e.key === 'Enter') sendMessage();
                        });
                    </script>
                </body>
                </html>
            `);
            
            popout.document.close();
        });
    }
    
    // Listen for messages from pop-out
    window.addEventListener('message', async (event) => {
        if (event.data.type === 'ai-chat') {
            const { message, action } = event.data;
            
            // Add to main window
            addAIMessage(message, 'user');
            const loadingId = addAIMessage('Thinking...', 'ai', true);
            
            try {
                const response = await callAIChat(message, action);
                removeAIMessage(loadingId);
                addAIMessage(response, 'ai');
                
                // Send response back to pop-out
                event.source.postMessage({ type: 'ai-response', content: response }, '*');
            } catch (error) {
                removeAIMessage(loadingId);
                const errorMsg = 'Sorry, I encountered an error. Please try again.';
                addAIMessage(errorMsg, 'ai', false, true);
                event.source.postMessage({ type: 'ai-response', content: errorMsg }, '*');
            }
        }
    });
}

// Setup Message Channel
function setupMessageChannel() {
    const channel = document.getElementById('message-channel');
    const channelHeader = document.getElementById('channel-header');
    const closeBtn = document.getElementById('close-channel');
    const sendBtn = document.getElementById('send-channel-message');
    const input = document.getElementById('channel-input');
    
    // Make draggable
    makeDraggable(channel, channelHeader);
    
    // Close button
    closeBtn.addEventListener('click', () => {
        channel.classList.add('hidden');
        document.getElementById('toggle-chat').dataset.active = 'false';
    });
    
    // Send message
    const sendMessage = () => {
        const message = input.value.trim();
        if (message) {
            addChannelMessage(message, 'user');
            input.value = '';
        }
    };
    
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
}

// Add message to AI chat
function addAIMessage(text, type, isLoading = false, isError = false) {
    const messagesDiv = document.getElementById('ai-messages');
    const messageEl = document.createElement('div');
    const messageId = `ai-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    messageEl.id = messageId;
    messageEl.className = `chat-message ${type}-message`;
    
    if (isLoading) {
        messageEl.classList.add('loading-message');
        messageEl.innerHTML = `
            <p>
                <span class="loading-dots">
                    <span>.</span><span>.</span><span>.</span>
                </span>
                ${text}
            </p>
        `;
    } else if (isError) {
        messageEl.classList.add('error-message');
        messageEl.innerHTML = `<p>⚠️ ${text}</p>`;
    } else {
        // Parse markdown-style formatting
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\n/g, '<br>'); // Line breaks
        
        messageEl.innerHTML = `<p>${formattedText}</p>`;
    }
    
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    return messageId;
}

// Remove AI message by ID
function removeAIMessage(messageId) {
    const messageEl = document.getElementById(messageId);
    if (messageEl) {
        messageEl.remove();
    }
}

// Add message to channel
function addChannelMessage(text, type) {
    const messagesDiv = document.getElementById('channel-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${type}-message`;
    messageEl.innerHTML = `<p>${text}</p>`;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Make element draggable
function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    handle.onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        element.style.right = 'auto';
        element.style.bottom = 'auto';
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Start call timer
let timerInterval;
let sessionData = null; // Track session info for summary

// Generate unique 10-digit session ID
function generateSessionId() {
    // Generate a random 10-digit number
    const min = 1000000000; // 10 digits minimum
    const max = 9999999999; // 10 digits maximum
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function startCallTimer(durationSeconds) {
    console.log(`Starting call timer for ${durationSeconds} seconds`);
    
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Duration is already in seconds
    let seconds = durationSeconds;
    console.log(`Timer will run for ${seconds} seconds`);
    
    const timerElement = document.getElementById('call-timer');
    if (!timerElement) {
        console.error('Timer element not found!');
        return;
    }
    
    const updateTimer = () => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `Ends in ${minutes}:${secs.toString().padStart(2, '0')}`;
        
        seconds--;
        
        if (seconds < 0) {
            clearInterval(timerInterval);
            console.log('=== Main timer ended, starting cool-down ===');
            // Session ended naturally - start cool-down
            showConfetti();
            customAlert('Time\'s up! You have 10 more seconds to wrap up your conversation.', 'Main Session Complete').then(() => {
                console.log('User clicked OK on time\'s up alert, starting cool-down');
                startCooldownTimer();
            });
        }
    };
    
    updateTimer(); // Update immediately
    timerInterval = setInterval(updateTimer, 1000);
    console.log('Timer started successfully');
}

// Start cool-down timer (10 seconds for testing)
function startCooldownTimer() {
    console.log('=== Starting cool-down timer ===');
    let seconds = 10; // 10 seconds for testing (change to 3 * 60 for production = 3 minutes)
    
    const updateTimer = () => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        console.log(`Cool-down timer: ${minutes}:${secs.toString().padStart(2, '0')} (${seconds}s remaining)`);
        document.getElementById('call-timer').textContent = `Cool-down ${minutes}:${secs.toString().padStart(2, '0')}`;
        
        seconds--;
        
        if (seconds < 0) {
            console.log('=== Cool-down ended, showing session summary ===');
            clearInterval(timerInterval);
            // Cool-down ended - show session summary
            showSessionSummary();
        }
    };
    
    updateTimer(); // Update immediately
    timerInterval = setInterval(updateTimer, 1000);
    console.log('Cool-down timer started');
}

// End video chat and return to language selection
function endVideoChat() {
    console.log('Ending video chat');
    
    // Clean up VibeChat video connection
    if (window.vibeChat && makedoState.isLoggedIn) {
        try {
            console.log('Cleaning up VibeChat connection...');
            window.vibeChat.handleExit();
        } catch (error) {
            console.error('Error cleaning up VibeChat:', error);
        }
    }
    
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Hide video chat and chat boxes
    document.getElementById('video-chat').classList.add('hidden');
    document.getElementById('ai-chat-box').classList.add('hidden');
    document.getElementById('message-channel').classList.add('hidden');
    
    // Show map and card again
    document.querySelector('.map-container').style.display = 'block';
    document.querySelector('.center-container').style.display = 'flex';
    
    // Reset to language selection view
    state.currentView = 'language-selection';
    state.selectedLanguage = null;
    
    const languageView = document.getElementById('language-selection');
    const levelsView = document.getElementById('session-levels');
    
    levelsView.classList.add('hidden');
    levelsView.classList.remove('fade-in');
    languageView.classList.remove('hidden');
    languageView.classList.add('fade-in');
    
    // Show all dots again
    showAllDots();
}

// Setup card drag functionality
function setupCardDrag() {
    const card = document.getElementById('main-card');
    const container = document.querySelector('.center-container');
    
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    
    card.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    // Touch events for mobile
    card.addEventListener('touchstart', dragStart);
    document.addEventListener('touchmove', drag);
    document.addEventListener('touchend', dragEnd);
    
    function dragStart(e) {
        // Only drag if clicking on the card itself or drag handle, not on buttons/inputs
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) {
            return;
        }
        
        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }
        
        isDragging = true;
        card.classList.add('dragging');
        
        // Remove centering on first drag
        if (xOffset === 0 && yOffset === 0) {
            container.style.justifyContent = 'flex-start';
            container.style.alignItems = 'flex-start';
            card.style.position = 'absolute';
            card.style.top = '50%';
            card.style.left = '50%';
            card.style.transform = 'translate(-50%, -50%)';
        }
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        if (e.type === 'touchmove') {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }
        
        xOffset = currentX;
        yOffset = currentY;
        
        setTranslate(currentX, currentY, card);
    }
    
    function dragEnd(e) {
        if (!isDragging) return;
        
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        card.classList.remove('dragging');
    }
    
    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }
}

// Language Request Management
// Favorites system - stores user favorites in localStorage
const FavoritesManager = {
    getFavorites() {
        const favorites = localStorage.getItem('tabbimate_favorites');
        return favorites ? JSON.parse(favorites) : {};
    },
    
    isFavorited(username) {
        const favorites = this.getFavorites();
        return !!favorites[username];
    },
    
    addFavorite(username) {
        const favorites = this.getFavorites();
        favorites[username] = {
            addedDate: new Date().toISOString(),
            sessionCount: favorites[username] ? favorites[username].sessionCount + 1 : 1
        };
        localStorage.setItem('tabbimate_favorites', JSON.stringify(favorites));
        return favorites[username];
    },
    
    removeFavorite(username) {
        const favorites = this.getFavorites();
        delete favorites[username];
        localStorage.setItem('tabbimate_favorites', JSON.stringify(favorites));
    },
    
    getFavoriteData(username) {
        const favorites = this.getFavorites();
        return favorites[username] || null;
    },
    
    toggleFavorite(username) {
        if (this.isFavorited(username)) {
            this.removeFavorite(username);
            return false;
        } else {
            this.addFavorite(username);
            return true;
        }
    }
};

// Custom Modal Functions
function showModal(title, message, buttons = []) {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const footerEl = document.getElementById('modal-footer');
        
        titleEl.textContent = title;
        bodyEl.innerHTML = typeof message === 'string' ? `<p>${message}</p>` : '';
        if (typeof message === 'object' && message.html) {
            bodyEl.innerHTML = message.html;
        }
        
        // Clear and setup buttons
        footerEl.innerHTML = '';
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = `modal-btn ${btn.className || 'modal-btn-secondary'}`;
            button.textContent = btn.text;
            button.onclick = () => {
                overlay.classList.add('hidden');
                resolve(btn.value);
            };
            footerEl.appendChild(button);
        });
        
        overlay.classList.remove('hidden');
    });
}

function customAlert(message, title = 'TabbiMate') {
    return showModal(title, message, [
        { text: 'OK', value: true, className: 'modal-btn-primary' }
    ]);
}

function customConfirm(message, title = 'Confirm') {
    return showModal(title, message, [
        { text: 'Cancel', value: false, className: 'modal-btn-secondary' },
        { text: 'OK', value: true, className: 'modal-btn-primary' }
    ]);
}

function customPrompt(message, title = 'Input', defaultValue = '') {
    return new Promise((resolve) => {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const bodyEl = document.getElementById('modal-body');
        const footerEl = document.getElementById('modal-footer');
        
        titleEl.textContent = title;
        bodyEl.innerHTML = `
            <p>${message}</p>
            <textarea class="modal-input modal-textarea" id="modal-prompt-input" placeholder="Enter your response...">${defaultValue}</textarea>
        `;
        
        footerEl.innerHTML = '';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'modal-btn modal-btn-secondary';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.onclick = () => {
            overlay.classList.add('hidden');
            resolve(null);
        };
        
        const okBtn = document.createElement('button');
        okBtn.className = 'modal-btn modal-btn-primary';
        okBtn.textContent = 'Submit';
        okBtn.onclick = () => {
            const input = document.getElementById('modal-prompt-input');
            overlay.classList.add('hidden');
            resolve(input.value);
        };
        
        footerEl.appendChild(cancelBtn);
        footerEl.appendChild(okBtn);
        
        overlay.classList.remove('hidden');
        
        // Focus input after a brief delay
        setTimeout(() => {
            const input = document.getElementById('modal-prompt-input');
            if (input) input.focus();
        }, 100);
    });
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
        
        // Pre-fill email if Firebase user is logged in
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            emailInput.value = firebase.auth().currentUser.email;
        }
        
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
                // Use Fetch.login() from fetch.js (loaded via window.Fetch in app.html)
                console.log('Starting Makedo login with Fetch.login()...');
                console.log('Email:', email);
                
                // Wait for Fetch to be available from window
                if (typeof window.Fetch === 'undefined') {
                    console.log('Waiting for window.Fetch to load...');
                    for (let i = 0; i < 50; i++) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                        if (typeof window.Fetch !== 'undefined') {
                            console.log('Fetch loaded after', (i+1)*100, 'ms');
                            break;
                        }
                    }
                    if (typeof window.Fetch === 'undefined') {
                        throw new Error('Fetch module failed to load');
                    }
                }
                
                const result = await window.Fetch.login({ email, password });
                
                console.log('Login result:', result);
                console.log('Result status:', result.status);
                
                if (result.status === 'loggedIn') {
                    // Success!
                    makedoState.isLoggedIn = true;
                    makedoState.userEmail = result.email || email;
                    makedoState.userId = result.pid;
                    
                    console.log('Makedo login successful:', makedoState);
                    
                    // Initialize VibeChat with login data if available
                    if (window.vibeChat && window.vibeChat.onLoginSuccess) {
                        try {
                            await window.vibeChat.onLoginSuccess({
                                email: makedoState.userEmail,
                                userId: makedoState.userId
                            });
                        } catch (err) {
                            console.warn('VibeChat initialization warning:', err);
                        }
                    } else if (window.VibeChat) {
                        window.vibeChat = new window.VibeChat();
                        try {
                            await window.vibeChat.onLoginSuccess({
                                email: makedoState.userEmail,
                                userId: makedoState.userId
                            });
                        } catch (err) {
                            console.warn('VibeChat initialization warning:', err);
                        }
                    }
                    
                    // Save login state
                    saveMakedoLoginState();
                    
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
            resolve({ success: false, skipped: true });
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

const LanguageRequestManager = {
    saveRequest(language, email, notes) {
        const requests = this.getRequests();
        const newRequest = {
            id: Date.now(),
            language: language,
            email: email,
            notes: notes,
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        requests.push(newRequest);
        localStorage.setItem('tabbimate_language_requests', JSON.stringify(requests));
        return newRequest;
    },
    
    getRequests() {
        const requests = localStorage.getItem('tabbimate_language_requests');
        return requests ? JSON.parse(requests) : [];
    },
    
    getAllRequests() {
        return this.getRequests();
    }
};

// Setup Language Request Form
function setupLanguageRequest() {
    const requestLink = document.querySelector('.request-link');
    const modal = document.getElementById('language-request-modal');
    const cancelBtn = document.getElementById('cancel-request');
    const submitBtn = document.getElementById('submit-request');
    const form = document.getElementById('language-request-form');
    
    if (!requestLink || !modal) return; // Exit if elements don't exist
    
    // Open modal
    requestLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.remove('hidden');
    });
    
    // Close modal
    cancelBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        form.reset();
    });
    
    // Submit request
    submitBtn.addEventListener('click', async () => {
        const language = document.getElementById('requested-language').value.trim();
        const email = document.getElementById('requester-email').value.trim();
        const notes = document.getElementById('additional-notes').value.trim();
        
        if (!language) {
            await customAlert('Please enter a language name.', 'Required Field');
            return;
        }
        
        // Save the request
        const request = LanguageRequestManager.saveRequest(language, email, notes);
        console.log('Language request saved:', request);
        
        // Close modal and reset form
        modal.classList.add('hidden');
        form.reset();
        
        // Show confirmation
        await customAlert(
            `Thank you for your request!\n\nWe've received your request for ${language}. We'll notify you when it becomes available.`,
            'Request Submitted'
        );
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            form.reset();
        }
    });
}

// Confetti celebration effect
function showConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const colors = ['#BF3143', '#FF6B6B', '#667eea', '#FFD700', '#41B883'];

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 3;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = '-10px';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '999999';
            particle.style.opacity = '1';
            
            document.body.appendChild(particle);
            
            const xDrift = randomInRange(-100, 100);
            const fallDuration = randomInRange(2000, 4000);
            
            particle.animate([
                { 
                    transform: 'translateY(0) translateX(0) rotate(0deg)',
                    opacity: 1
                },
                { 
                    transform: `translateY(${window.innerHeight + 50}px) translateX(${xDrift}px) rotate(${randomInRange(0, 720)}deg)`,
                    opacity: 0
                }
            ], {
                duration: fallDuration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }, 50);
}

// Generate sample phrases for session summary (will be replaced by real AI analysis)
function generateSummaryPhrases(language, level) {
    const phrasesDatabase = {
        "English": {
            "Basic": [
                { phrase: "How was your weekend?", meaning: "A friendly way to start conversations and show interest in someone's life" },
                { phrase: "I really enjoyed talking with you", meaning: "Express appreciation - builds rapport and ends conversations positively" },
                { phrase: "Could you say that again, please?", meaning: "Politely ask for repetition when you don't understand" }
            ],
            "Intermediate": [
                { phrase: "What do you think about...?", meaning: "Great conversation starter - invites opinions and deeper discussion" },
                { phrase: "That's a good point", meaning: "Show you're listening and validate the other person's ideas" },
                { phrase: "In my experience, I've found that...", meaning: "Share personal insights while keeping the conversation flowing" }
            ],
            "Professional / Talk with Native": [
                { phrase: "Could you elaborate on that?", meaning: "Professional way to ask for more details in business contexts" },
                { phrase: "Let me think about that for a moment", meaning: "Buy time to formulate your response thoughtfully" },
                { phrase: "I appreciate your perspective on this", meaning: "Acknowledge different viewpoints professionally" }
            ]
        },
        "Spanish": {
            "Basic": [
                { phrase: "¿Cómo estuvo tu fin de semana?", meaning: "How was your weekend? - A warm conversation starter" },
                { phrase: "Me gustó mucho hablar contigo", meaning: "I really enjoyed talking with you - Show appreciation" },
                { phrase: "¿Puedes repetir eso, por favor?", meaning: "Could you repeat that, please? - Ask politely for clarification" }
            ],
            "Intermediate": [
                { phrase: "¿Qué opinas sobre...?", meaning: "What do you think about...? - Start meaningful discussions" },
                { phrase: "Tienes razón", meaning: "You're right - Agree and validate their point" },
                { phrase: "En mi experiencia, he notado que...", meaning: "In my experience, I've noticed that... - Share insights" }
            ],
            "Professional / Talk with Native": [
                { phrase: "¿Podrías explicar eso con más detalle?", meaning: "Could you explain that in more detail? - Professional inquiry" },
                { phrase: "Déjame pensar en eso un momento", meaning: "Let me think about that for a moment - Take time to respond" },
                { phrase: "Aprecio tu perspectiva", meaning: "I appreciate your perspective - Professional acknowledgment" }
            ]
        },
        "Korean": {
            "Basic": [
                { phrase: "주말 어떻게 보냈어요?", meaning: "How was your weekend? - Friendly conversation starter" },
                { phrase: "이야기해서 정말 좋았어요", meaning: "It was really nice talking with you - Express enjoyment" },
                { phrase: "다시 한번 말씀해 주시겠어요?", meaning: "Could you say that again? - Polite clarification request" }
            ],
            "Intermediate": [
                { phrase: "그것에 대해 어떻게 생각하세요?", meaning: "What do you think about that? - Invite discussion" },
                { phrase: "좋은 지적이네요", meaning: "That's a good point - Validate their opinion" },
                { phrase: "제 경험으로는...", meaning: "In my experience... - Share personal insights" }
            ],
            "Professional / Talk with Native": [
                { phrase: "좀 더 자세히 설명해 주시겠어요?", meaning: "Could you explain in more detail? - Professional request" },
                { phrase: "잠깐 생각해 볼게요", meaning: "Let me think about that - Thoughtful pause" },
                { phrase: "당신의 관점을 존중합니다", meaning: "I respect your perspective - Professional acknowledgment" }
            ]
        }
    };

    // Get phrases for language and level, with fallback
    const languagePhrases = phrasesDatabase[language] || phrasesDatabase["English"];
    return languagePhrases[level] || languagePhrases["Basic"] || [
        { phrase: "Thank you for this conversation", meaning: "Express gratitude" },
        { phrase: "I learned something new today", meaning: "Show appreciation for learning" },
        { phrase: "Let's practice again soon", meaning: "Invite future conversations" }
    ];
}

// Show session summary
function showSessionSummary() {
    console.log('Showing session summary');
    
    // Hide video chat
    const videoChat = document.getElementById('video-chat');
    if (videoChat) {
        videoChat.classList.add('hidden');
    }
    
    // Use placeholder data if no session data available
    if (!sessionData) {
        console.warn('No session data available, using placeholder data');
        sessionData = {
            sessionId: '0000000000',
            startTime: new Date(Date.now() - 180000), // 3 minutes ago
            language: 'English',
            level: 'Basic',
            partner: 'Practice Partner',
            durationMinutes: 3
        };
    }
    
    // Calculate actual duration
    const endTime = new Date();
    const actualDuration = Math.max(1, Math.round((endTime - sessionData.startTime) / 60000)); // minutes, minimum 1
    
    // Update user statistics
    updateUserStatsInLocalStorage(actualDuration);
    
    // Populate summary data
    document.getElementById('summary-language').textContent = sessionData.language || 'English';
    document.getElementById('summary-level').textContent = sessionData.level || 'Basic';
    document.getElementById('summary-partner').textContent = sessionData.partner || 'Practice Partner';
    document.getElementById('summary-duration').textContent = `${actualDuration} minute${actualDuration !== 1 ? 's' : ''}`;
    document.getElementById('summary-date').textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Generate and display sentences to memorize (with corrections)
    const sentences = generateCorrectedSentences(sessionData.language, sessionData.level);
    const phrasesList = document.getElementById('summary-phrases-list');
    if (phrasesList) {
        phrasesList.innerHTML = ''; // Clear existing
        sentences.forEach(sentenceObj => {
            const phraseItem = document.createElement('div');
            phraseItem.className = 'phrase-item';
            phraseItem.innerHTML = `
                <div class="phrase-text incorrect">${sentenceObj.incorrect}</div>
                <div class="phrase-text correct">✓ ${sentenceObj.correct}</div>
                <div class="phrase-meaning">${sentenceObj.note}</div>
            `;
            phrasesList.appendChild(phraseItem);
        });
    }
    
    // Store sentences for download
    sessionData.correctedSentences = sentences;
    
    // Show summary
    const summaryEl = document.getElementById('session-summary');
    if (summaryEl) {
        summaryEl.classList.remove('hidden');
    }
}

// Generate corrected sentences for session summary
function generateCorrectedSentences(language, level) {
    // Placeholder data - in the future, this will be generated by AI
    const sentencesDatabase = {
        "English": {
            "Basic": [
                {
                    incorrect: "I go to the store yesterday.",
                    correct: "I went to the store yesterday.",
                    note: "Use past tense 'went' for actions that happened in the past."
                },
                {
                    incorrect: "She don't like coffee.",
                    correct: "She doesn't like coffee.",
                    note: "Third person singular uses 'doesn't' not 'don't'."
                },
                {
                    incorrect: "I am liking this movie very much.",
                    correct: "I like this movie very much.",
                    note: "State verbs like 'like' don't usually use continuous form."
                }
            ],
            "Intermediate": [
                {
                    incorrect: "If I would have time, I would travel more.",
                    correct: "If I had time, I would travel more.",
                    note: "Use simple past (not 'would have') in the 'if' clause of conditional sentences."
                },
                {
                    incorrect: "I'm working here since 2020.",
                    correct: "I've been working here since 2020.",
                    note: "Use present perfect continuous for actions that started in the past and continue now."
                },
                {
                    incorrect: "The movie was very bored.",
                    correct: "The movie was very boring.",
                    note: "Use '-ing' adjectives for things that cause feelings, '-ed' for the person feeling them."
                }
            ],
            "Professional / Talk with Native": [
                {
                    incorrect: "We need to discuss about the proposal.",
                    correct: "We need to discuss the proposal.",
                    note: "'Discuss' is transitive - no preposition needed."
                },
                {
                    incorrect: "Can you borrow me your notes?",
                    correct: "Can you lend me your notes?",
                    note: "'Lend' = give temporarily, 'Borrow' = receive temporarily."
                },
                {
                    incorrect: "I look forward to meet you.",
                    correct: "I look forward to meeting you.",
                    note: "'Look forward to' is followed by a gerund (-ing), not infinitive."
                }
            ]
        },
        "Spanish": {
            "Basic": [
                {
                    incorrect: "Yo soy muy cansado.",
                    correct: "Yo estoy muy cansado.",
                    note: "Use 'estar' for temporary states like being tired."
                },
                {
                    incorrect: "Me gusta mucho los tacos.",
                    correct: "Me gustan mucho los tacos.",
                    note: "'Gustar' agrees with the thing liked (plural 'tacos' → 'gustan')."
                },
                {
                    incorrect: "Yo tengo 25 años viejo.",
                    correct: "Yo tengo 25 años.",
                    note: "In Spanish, use 'tener + años' without 'viejo/old'."
                }
            ],
            "Intermediate": [
                {
                    incorrect: "Si tendría tiempo, viajaría más.",
                    correct: "Si tuviera tiempo, viajaría más.",
                    note: "Use imperfect subjunctive (not conditional) in 'si' clauses."
                },
                {
                    incorrect: "Estoy trabajando aquí desde 2020.",
                    correct: "Trabajo aquí desde 2020.",
                    note: "Spanish uses simple present (not present progressive) with 'desde'."
                },
                {
                    incorrect: "La película fue muy aburrida para mí.",
                    correct: "La película fue muy aburrida.",
                    note: "Use 'aburrido/a' (adjective) - 'para mí' is redundant here."
                }
            ],
            "Professional / Talk with Native": [
                {
                    incorrect: "Necesitamos discutir sobre la propuesta.",
                    correct: "Necesitamos discutir la propuesta.",
                    note: "'Discutir' doesn't need 'sobre' - it's a direct object."
                },
                {
                    incorrect: "¿Me prestas prestado tus notas?",
                    correct: "¿Me prestas tus notas?",
                    note: "'Prestar' already means to lend - 'prestado' is redundant."
                },
                {
                    incorrect: "Espero con ansias de conocerte.",
                    correct: "Espero con ansias conocerte.",
                    note: "No preposition 'de' needed after 'espero con ansias'."
                }
            ]
        },
        "Korean": {
            "Basic": [
                {
                    incorrect: "저는 어제 가게에 갔어.",
                    correct: "저는 어제 가게에 갔어요.",
                    note: "Remember to use polite ending '요' in casual conversations."
                },
                {
                    incorrect: "그녀는 커피를 좋아하지 않아.",
                    correct: "그녀는 커피를 좋아하지 않아요.",
                    note: "Maintain consistent politeness level - use '요' form."
                },
                {
                    incorrect: "나는 이 영화 좋아해요 많이.",
                    correct: "나는 이 영화를 많이 좋아해요.",
                    note: "Adverb '많이' comes before the verb, and use object marker '를'."
                }
            ],
            "Intermediate": [
                {
                    incorrect: "만약 시간이 있으면, 여행을 더 할 거예요.",
                    correct: "시간이 있으면 여행을 더 할 거예요.",
                    note: "'만약' is optional and often sounds unnatural - conditional '-으면' is enough."
                },
                {
                    incorrect: "저는 2020년부터 여기서 일하고 있어요.",
                    correct: "저는 2020년부터 여기서 일해 왔어요.",
                    note: "Use '-아/어 왔다' for actions continuing from past to present."
                },
                {
                    incorrect: "그 영화는 정말 지루했어요.",
                    correct: "그 영화는 정말 지루했어요.",
                    note: "Correct! '지루하다' works for both things and feelings in Korean."
                }
            ],
            "Professional / Talk with Native": [
                {
                    incorrect: "제안에 대해서 토론해야 합니다.",
                    correct: "제안을 논의해야 합니다.",
                    note: "In business, '논의하다' is more professional than '토론하다'."
                },
                {
                    incorrect: "노트를 빌려주실 수 있으세요?",
                    correct: "노트를 빌려주실 수 있으세요?",
                    note: "Correct! Using honorific '주시다' + '-(으)세요' is appropriately polite."
                },
                {
                    incorrect: "만나기를 기대하고 있습니다.",
                    correct: "만나 뵙기를 기대하고 있습니다.",
                    note: "Use humble form '뵙다' (meet) when speaking to someone senior/respected."
                }
            ]
        }
    };
    
    // Get appropriate sentences based on language and level
    const languageData = sentencesDatabase[language] || sentencesDatabase["English"];
    let levelKey = level;
    
    // Map level variations
    if (level === "Advanced" || level === "Native") {
        levelKey = "Professional / Talk with Native";
    }
    
    const sentences = languageData[levelKey] || languageData["Basic"];
    
    // Return exactly 3 sentences
    return sentences.slice(0, 3);
}

// Download study note with session transcript and corrections
function downloadStudyNote() {
    if (!sessionData) {
        console.error('No session data available');
        return;
    }
    
    const endTime = new Date();
    const actualDuration = Math.round((endTime - sessionData.startTime) / 60000);
    
    // Create study note content
    let content = `TabbiMate Study Note\n`;
    content += `${'='.repeat(50)}\n\n`;
    content += `Session Information:\n`;
    content += `- Language: ${sessionData.language}\n`;
    content += `- Level: ${sessionData.level}\n`;
    content += `- Partner: ${sessionData.partner}\n`;
    content += `- Duration: ${actualDuration} minute${actualDuration !== 1 ? 's' : ''}\n`;
    content += `- Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
    
    content += `${'='.repeat(50)}\n\n`;
    content += `Sentences to Memorize (with Corrections):\n\n`;
    
    if (sessionData.correctedSentences) {
        sessionData.correctedSentences.forEach((sentence, index) => {
            content += `${index + 1}. What you said:\n`;
            content += `   ✗ "${sentence.incorrect}"\n\n`;
            content += `   Corrected:\n`;
            content += `   ✓ "${sentence.correct}"\n\n`;
            content += `   Learning point:\n`;
            content += `   ${sentence.note}\n\n`;
            content += `${'-'.repeat(50)}\n\n`;
        });
    }
    
    content += `${'='.repeat(50)}\n\n`;
    content += `Conversation Transcript:\n`;
    content += `[Placeholder - In the future, this will contain the full conversation\n`;
    content += `transcript with AI-generated learning points and suggestions]\n\n`;
    content += `Sample conversation:\n`;
    content += `You: Hello! Nice to meet you.\n`;
    content += `${sessionData.partner}: Hi! Nice to meet you too.\n`;
    content += `You: How are you today?\n`;
    content += `${sessionData.partner}: I'm doing great, thanks for asking!\n`;
    content += `...\n\n`;
    
    content += `${'='.repeat(50)}\n\n`;
    content += `AI-Generated Feedback:\n`;
    content += `[Placeholder - AI will analyze your performance and provide:\n`;
    content += `- Pronunciation tips\n`;
    content += `- Grammar patterns to practice\n`;
    content += `- Vocabulary suggestions\n`;
    content += `- Conversation flow feedback]\n\n`;
    
    content += `Keep practicing! Visit tabbi.ai to schedule your next session.\n`;
    
    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TabbiMate_Study_Note_${sessionData.sessionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Study note downloaded');
}

// Setup session summary Done button and Download button
function setupSessionSummary() {
    const doneBtn = document.getElementById('summary-done');
    if (doneBtn) {
        doneBtn.addEventListener('click', () => {
            // Get user ID from localStorage
            const userId = localStorage.getItem('tabbimate_user_id');
            
            if (userId) {
                // Redirect to profile page
                const basePath = window.location.pathname.includes('tabbimate') 
                    ? '/tabbimate/profile' 
                    : '/profile';
                window.location.href = `${window.location.origin}${basePath}/${userId}`;
            } else {
                // If no user ID, return to main page
                const basePath = window.location.pathname.replace(/\/session\/\d{10}$/, '');
                window.location.href = `${window.location.origin}${basePath}`;
            }
        });
    }
    
    const downloadBtn = document.getElementById('download-study-note');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            downloadStudyNote();
        });
    }
}

// Show interest selection for non-logged-in users
function showInterestSelection(level) {
    const interestView = document.getElementById('interest-selection');
    const levelsView = document.getElementById('session-levels');
    
    // Store the selected level
    state.selectedLevel = level;
    
    // Reset selected interests
    selectedInterests = [];
    updateInterestButton();
    
    // Transition views
    levelsView.classList.add('fade-out');
    setTimeout(() => {
        levelsView.classList.add('hidden');
        levelsView.classList.remove('fade-out');
        interestView.classList.remove('hidden');
        setTimeout(() => {
            interestView.classList.add('fade-in');
        }, 10);
    }, 300);
}

// Show tutorial video after interest selection
function showTutorial() {
    const tutorialView = document.getElementById('tutorial-video');
    const interestView = document.getElementById('interest-selection');
    
    // Transition views
    interestView.classList.add('fade-out');
    setTimeout(() => {
        interestView.classList.add('hidden');
        interestView.classList.remove('fade-out');
        tutorialView.classList.remove('hidden');
        setTimeout(() => {
            tutorialView.classList.add('fade-in');
        }, 10);
    }, 300);
}

// Show join prompt after tutorial
function showJoinPrompt() {
    const tutorialView = document.getElementById('tutorial-video');
    const joinPromptView = document.getElementById('join-prompt');
    
    // Transition views
    tutorialView.classList.add('fade-out');
    setTimeout(() => {
        tutorialView.classList.add('hidden');
        tutorialView.classList.remove('fade-out');
        joinPromptView.classList.remove('hidden');
        setTimeout(() => {
            joinPromptView.classList.add('fade-in');
        }, 10);
    }, 300);
}

// Handle interest chip selection
function setupInterestChips() {
    const interestChips = document.querySelectorAll('.interest-chip');
    
    interestChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const interest = chip.getAttribute('data-interest');
            
            if (chip.classList.contains('selected')) {
                // Deselect
                chip.classList.remove('selected');
                selectedInterests = selectedInterests.filter(i => i !== interest);
            } else {
                // Select (max 3)
                if (selectedInterests.length < 3) {
                    chip.classList.add('selected');
                    selectedInterests.push(interest);
                }
            }
            
            updateInterestButton();
        });
    });
}

// Update the continue button state
function updateInterestButton() {
    const continueBtn = document.getElementById('interests-continue-btn');
    const errorMsg = document.getElementById('interest-error');
    
    if (continueBtn) {
        continueBtn.textContent = `Continue (${selectedInterests.length}/3)`;
        
        // Hide error message when user selects interests
        if (errorMsg && selectedInterests.length > 0) {
            errorMsg.classList.add('hidden');
        }
    }
}

// Setup interest selection continue button
function setupInterestButton() {
    const continueBtn = document.getElementById('interests-continue-btn');
    const errorMsg = document.getElementById('interest-error');
    
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            // Show error if no interests selected
            if (selectedInterests.length === 0) {
                if (errorMsg) {
                    errorMsg.classList.remove('hidden');
                }
                return;
            }
            
            // Allow continuing with 1-3 interests
            if (selectedInterests.length >= 1 && selectedInterests.length <= 3) {
                // Generate unique user ID for guest user
                const userId = generateUserId();
                
                // Store the user ID
                localStorage.setItem('tabbimate_user_id', userId);
                
                // Store guest user data for the session
                const userData = {
                    userId: userId,
                    language: state.selectedLanguage,
                    level: state.selectedLevel,
                    interests: selectedInterests
                };
                console.log('Storing guest user data:', userData);
                localStorage.setItem('tabbimate_current_user', JSON.stringify(userData));
                
                // For guest users: show tutorial, then proceed to matching
                // Hide interest selection
                document.getElementById('interest-selection').classList.add('hidden');
                
                // Show tutorial video
                const tutorialView = document.getElementById('tutorial-video');
                tutorialView.classList.remove('hidden');
                setTimeout(() => {
                    tutorialView.classList.add('fade-in');
                }, 10);
            }
        });
    }
}

// Setup tutorial complete button
function setupTutorialButton() {
    const tutorialCompleteBtn = document.getElementById('tutorial-complete-btn');
    if (tutorialCompleteBtn) {
        tutorialCompleteBtn.addEventListener('click', () => {
            // Check if user has selected interests (guest flow)
            const userData = localStorage.getItem('tabbimate_current_user');
            
            if (userData) {
                // Guest user has selected interests - proceed to matching
                try {
                    const user = JSON.parse(userData);
                    
                    // Hide tutorial
                    document.getElementById('tutorial-video').classList.add('hidden');
                    
                    // Hide the center container
                    document.querySelector('.center-container').style.display = 'none';
                    
                    // Show matching screen
                    showMatchingScreen(state.selectedLanguage, state.selectedLevel);
                    
                    // Find a match and start video chat after matching period
                    const duration = 600; // 10 minutes default
                    setTimeout(() => {
                        const availableUsers = users.filter(u => u.name !== 'Guest');
                        const matchedUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
                        startActualVideoChat(matchedUser, duration);
                    }, 10000); // 10 seconds matching time (testing)
                    
                } catch (error) {
                    console.error('Error processing guest user data:', error);
                    showJoinPrompt();
                }
            } else {
                // No user data - show join prompt (old flow)
                showJoinPrompt();
            }
        });
    }
}

// Update user statistics in localStorage after a session
function updateUserStatsInLocalStorage(sessionMinutes) {
    // Get the current user data to find userId
    const userData = localStorage.getItem('tabbimate_current_user');
    if (!userData) {
        console.log('No user data found, cannot update stats');
        return;
    }
    
    let userId;
    try {
        const user = JSON.parse(userData);
        userId = user.userId;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return;
    }
    
    if (!userId) {
        console.log('No userId found, cannot update stats');
        return;
    }
    
    const statsKey = `tabbimate_stats_${userId}`;
    const savedStats = localStorage.getItem(statsKey);
    
    let stats = {
        totalSessions: 0,
        totalMinutes: 0,
        dayStreak: 0,
        lastSessionDate: null,
        sessionDates: []
    };
    
    if (savedStats) {
        try {
            stats = JSON.parse(savedStats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    // Update session count and minutes
    stats.totalSessions += 1;
    stats.totalMinutes += sessionMinutes;
    
    // Update day streak
    const today = new Date().toDateString();
    if (!stats.sessionDates.includes(today)) {
        stats.sessionDates.push(today);
    }
    
    // Calculate day streak
    if (stats.lastSessionDate) {
        const lastDate = new Date(stats.lastSessionDate);
        const currentDate = new Date();
        const diffTime = currentDate - lastDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            // Consecutive day
            stats.dayStreak += 1;
        } else if (diffDays === 0) {
            // Same day, don't increment
        } else {
            // Streak broken, reset to 1
            stats.dayStreak = 1;
        }
    } else {
        // First session ever
        stats.dayStreak = 1;
    }
    
    stats.lastSessionDate = today;
    
    // Save updated stats
    localStorage.setItem(statsKey, JSON.stringify(stats));
    
    console.log('Stats updated for user', userId, ':', stats);
}

// Setup sign out button
function setupSignOut() {
    const signoutBtn = document.getElementById('signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', async () => {
            // Check if Firebase is initialized
            if (typeof firebase === 'undefined' || !firebase.auth) {
                await customAlert('Please wait a moment and try again.', 'Not Ready');
                return;
            }

            const confirmed = await customConfirm(
                'Are you sure you want to sign out?',
                'Sign Out'
            );
            
            if (confirmed) {
                try {
                    await firebase.auth().signOut();
                    window.location.href = 'auth.html';
                } catch (error) {
                    console.error('Sign out error:', error);
                    await customAlert('Failed to sign out. Please try again.', 'Error');
                }
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        setupSessionSummary();
        setupInterestChips();
        setupInterestButton();
        setupTutorialButton();
        loadMakedoLoginState();
        setupSignOut();
    });
} else {
    init();
    setupSessionSummary();
    setupInterestChips();
    setupInterestButton();
    setupTutorialButton();
    setupSignOut();
}
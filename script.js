// State management
const state = {
    selectedLanguage: null,
    currentView: 'language-selection',
    sessionDuration: null,
    matchedUser: null
};

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
    renderDots();
    setupLanguageButtons();
    setupLevelButtons();
    setupBackButton();
    setupCardDrag();
    setupLanguageRequest();
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
            selectLevel(level, duration);
        });
    });
}

// Update level buttons based on current user's ability in selected language
function updateLevelButtonsAvailability() {
    const currentUser = users.find(u => u.name === 'April');
    
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
    const currentUser = users.find(u => u.name === 'April');
    
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
    const favoriteBtn = document.getElementById('favorite-btn');
    if (!favoriteBtn) return;
    
    const tooltip = favoriteBtn.querySelector('.favorite-tooltip');
    
    favoriteBtn.addEventListener('click', async () => {
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
}

// Setup username click to show profile
function setupUsernameClick() {
    const partnerNameEl = document.getElementById('matched-user-name');
    if (!partnerNameEl) return;
    
    partnerNameEl.addEventListener('click', () => {
        if (!currentMatchedUser) return;
        showUserProfile(currentMatchedUser);
    });
}

// Show user profile in modal
function showUserProfile(user) {
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
    
    customAlert({ html: profileHTML }, `${user.name}'s Profile`);
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
    const helpBtn = document.getElementById('help-btn');
    const helpMenu = document.getElementById('help-menu');
    const guidelinesBtn = document.getElementById('session-guidelines');
    const blockBtn = document.getElementById('block-user');
    const reportBtn = document.getElementById('report-user');
    
    if (!helpBtn || !helpMenu) return;
    
    // Toggle help menu
    helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        helpMenu.classList.toggle('hidden');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!helpMenu.contains(e.target) && e.target !== helpBtn) {
            helpMenu.classList.add('hidden');
        }
    });
    
    // Session Guidelines
    if (guidelinesBtn) {
        guidelinesBtn.addEventListener('click', () => {
            helpMenu.classList.add('hidden');
            showSessionGuidelines();
        });
    }
    
    // Block User
    if (blockBtn) {
        blockBtn.addEventListener('click', () => {
            helpMenu.classList.add('hidden');
            if (currentMatchedUser) {
                blockUser(currentMatchedUser.name);
            }
        });
    }
    
    // Report User
    if (reportBtn) {
        reportBtn.addEventListener('click', () => {
            helpMenu.classList.add('hidden');
            if (currentMatchedUser) {
                reportUser(currentMatchedUser.name);
            }
        });
    }
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

// Start video chat with matched user
function startVideoChat(matchedUser, durationMinutes) {
    console.log('Starting video chat with:', matchedUser.name, 'Duration:', durationMinutes, 'minutes');
    
    // Store matched user and duration
    currentMatchedUser = matchedUser;
    state.sessionDuration = durationMinutes;
    
    // Update UI with matched user info
    document.getElementById('matched-user-name').textContent = matchedUser.name;
    document.getElementById('remote-name').textContent = matchedUser.name.toLowerCase();
    
    // Update Help menu with user's name
    document.getElementById('block-username').textContent = matchedUser.name;
    document.getElementById('report-username').textContent = matchedUser.name;
    
    // Update session count and favorite status
    updateSessionInfo(matchedUser.name);
    
    // Hide map and card, show video chat
    document.querySelector('.map-container').style.display = 'none';
    document.querySelector('.center-container').style.display = 'none';
    document.getElementById('video-chat').classList.remove('hidden');
    
    // Setup end call button and timer
    setupVideoCallControls();
    startCallTimer(durationMinutes);
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
    const leaveBtn = document.getElementById('leave-call');
    
    // Remove old listener if exists
    const newLeaveBtn = leaveBtn.cloneNode(true);
    leaveBtn.parentNode.replaceChild(newLeaveBtn, leaveBtn);
    
    newLeaveBtn.addEventListener('click', () => {
        endVideoChat();
    });
    
    // Setup control buttons
    setupToggleButtons();
    setupAIChatBox();
    setupMessageChannel();
    setupHelpMenu();
    setupFavoriteButton();
    setupUsernameClick();
}

// Setup toggle buttons (video, audio, AI, chat, share)
function setupToggleButtons() {
    // Video toggle
    document.getElementById('toggle-camera').addEventListener('click', function() {
        const isActive = this.dataset.active === 'true';
        this.dataset.active = !isActive;
        console.log('Video:', !isActive ? 'ON' : 'OFF');
    });
    
    // Audio toggle
    document.getElementById('toggle-mic').addEventListener('click', function() {
        const isActive = this.dataset.active === 'true';
        this.dataset.active = !isActive;
        console.log('Audio:', !isActive ? 'ON' : 'OFF');
    });
    
    // AI chat toggle
    document.getElementById('toggle-ai').addEventListener('click', function() {
        const isActive = this.dataset.active === 'true';
        this.dataset.active = !isActive;
        
        const aiChatBox = document.getElementById('ai-chat-box');
        const messageChannel = document.getElementById('message-channel');
        
        if (!isActive) {
            aiChatBox.classList.remove('hidden');
            messageChannel.classList.add('hidden');
            document.getElementById('toggle-chat').dataset.active = 'false';
        } else {
            aiChatBox.classList.add('hidden');
        }
        
        console.log('AI Chat:', !isActive ? 'ON' : 'OFF');
    });
    
    // Message channel toggle
    document.getElementById('toggle-chat').addEventListener('click', function() {
        const isActive = this.dataset.active === 'true';
        this.dataset.active = !isActive;
        
        const messageChannel = document.getElementById('message-channel');
        const aiChatBox = document.getElementById('ai-chat-box');
        
        if (!isActive) {
            messageChannel.classList.remove('hidden');
            aiChatBox.classList.add('hidden');
            document.getElementById('toggle-ai').dataset.active = 'false';
        } else {
            messageChannel.classList.add('hidden');
        }
        
        console.log('Message Channel:', !isActive ? 'ON' : 'OFF');
    });
    
    // Share screen
    document.getElementById('toggle-share').addEventListener('click', async function() {
        console.log('Share screen clicked');
        await customAlert('Screen sharing functionality will be added here!', 'Screen Share');
    });
}

// Setup AI Chat Box with drag functionality
function setupAIChatBox() {
    const chatBox = document.getElementById('ai-chat-box');
    const chatHeader = document.getElementById('ai-chat-header');
    const closeBtn = document.getElementById('close-ai-chat');
    const sendBtn = document.getElementById('send-ai-message');
    const input = document.getElementById('ai-input');
    
    // Make draggable
    makeDraggable(chatBox, chatHeader);
    
    // Close button
    closeBtn.addEventListener('click', () => {
        chatBox.classList.add('hidden');
        document.getElementById('toggle-ai').dataset.active = 'false';
    });
    
    // Send message
    const sendAIMessage = () => {
        const message = input.value.trim();
        if (message) {
            addAIMessage(message, 'user');
            input.value = '';
            
            // Simulate AI response
            setTimeout(() => {
                addAIMessage('I understand your question. How can I assist you with your language practice?', 'ai');
            }, 1000);
        }
    };
    
    sendBtn.addEventListener('click', sendAIMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAIMessage();
    });
}

// Setup Message Channel
function setupMessageChannel() {
    const channel = document.getElementById('message-channel');
    const closeBtn = document.getElementById('close-channel');
    const sendBtn = document.getElementById('send-channel-message');
    const input = document.getElementById('channel-input');
    
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
function addAIMessage(text, type) {
    const messagesDiv = document.getElementById('ai-messages');
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${type}-message`;
    messageEl.innerHTML = `<p>${text}</p>`;
    messagesDiv.appendChild(messageEl);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
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
function startCallTimer(durationMinutes) {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Convert minutes to seconds
    let seconds = durationMinutes * 60;
    
    const updateTimer = () => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('call-timer').textContent = `Ends in ${minutes}:${secs.toString().padStart(2, '0')}`;
        
        seconds--;
        
        if (seconds < 0) {
            clearInterval(timerInterval);
            // Session ended naturally - celebrate!
            showConfetti();
            customAlert('🎉 Congratulations! You practiced speaking! Great job on your language learning journey!', 'Time\'s Up!').then(() => {
                endVideoChat();
            });
        }
    };
    
    updateTimer(); // Update immediately
    timerInterval = setInterval(updateTimer, 1000);
}

// End video chat and return to language selection
function endVideoChat() {
    console.log('Ending video chat');
    
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
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;
    let isFirstDrag = true;
    
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
        
        // On first drag, set initial position to card's current center position
        if (isFirstDrag) {
            const rect = card.getBoundingClientRect();
            xOffset = rect.left + (rect.width / 2) - (window.innerWidth / 2);
            yOffset = rect.top + (rect.height / 2) - (window.innerHeight / 2);
            isFirstDrag = false;
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
        
        // Remove centering
        container.style.justifyContent = 'flex-start';
        container.style.alignItems = 'flex-start';
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


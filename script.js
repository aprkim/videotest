// State management
const state = {
    selectedLanguage: null,
    currentView: 'language-selection'
};

// User database - structured format for easy expansion
const users = [
    {
        name: "April",
        location: { top: "32%", left: "18%" }, // Berkeley
        languages: {
            english: "Professional",
            spanish: "Beginner",
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
            korean: "Beginner"
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
            const level = btn.getAttribute('data-level');
            const duration = parseInt(btn.getAttribute('data-duration'));
            selectLevel(level, duration);
        });
    });
}

// Handle level selection
function selectLevel(level, durationMinutes) {
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
        startVideoChat(matchedUser);
    } else {
        console.log('No match found');
        alert('No available users for this level. Please try another!');
    }
}

// Find a matching user
function findMatch(selectedLanguage, level) {
    const langKey = selectedLanguage.toLowerCase();
    
    // Filter users who speak the selected language
    const availableUsers = users.filter(user => {
        // Skip April (the current user)
        if (user.name === 'April') return false;
        
        // Check if they speak the language
        return user.languages.hasOwnProperty(langKey);
    });
    
    console.log('Available users for matching:', availableUsers.map(u => u.name));
    
    if (availableUsers.length === 0) return null;
    
    // For "Talk with Native" level, prioritize native speakers
    if (level === 'Native') {
        const nativeUsers = availableUsers.filter(user => 
            user.languages[langKey] === 'Native'
        );
        if (nativeUsers.length > 0) {
            return nativeUsers[Math.floor(Math.random() * nativeUsers.length)];
        }
    }
    
    // Otherwise return a random match
    return availableUsers[Math.floor(Math.random() * availableUsers.length)];
}

// Start video chat with matched user
function startVideoChat(matchedUser) {
    console.log('Starting video chat with:', matchedUser.name);
    
    // Update UI with matched user info
    document.getElementById('matched-user-name').textContent = matchedUser.name;
    document.getElementById('remote-name').textContent = matchedUser.name.toLowerCase();
    
    // Hide map and card, show video chat
    document.querySelector('.map-container').style.display = 'none';
    document.querySelector('.center-container').style.display = 'none';
    document.getElementById('video-chat').classList.remove('hidden');
    
    // Setup end call button and timer
    setupVideoCallControls();
    startCallTimer();
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
    document.getElementById('toggle-share').addEventListener('click', function() {
        console.log('Share screen clicked');
        alert('Screen sharing functionality will be added here!');
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
function startCallTimer() {
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    let seconds = 262; // 4:22 in seconds
    
    const updateTimer = () => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('call-timer').textContent = `Ends in ${minutes}:${secs.toString().padStart(2, '0')}`;
        
        seconds--;
        
        if (seconds < 0) {
            clearInterval(timerInterval);
            endVideoChat();
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


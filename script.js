// State management
const state = {
    selectedLanguage: null,
    currentView: 'language-selection'
};

// User data for dots
const activeUsers = [
    {
        name: 'April',
        top: '35%',
        left: '16%',
        languages: 'English (Professional), Spanish (Beginner), Korean (Native)',
        interests: 'Parenting, AI, Cooking'
    },
    {
        name: 'Marty',
        top: '38%',
        left: '22%',
        languages: 'English (Native), Spanish (Intermediate)',
        interests: 'Travel, Photography, Music'
    },
    {
        name: 'Emma',
        top: '28%',
        left: '41%',
        languages: 'English (Native), French (Professional)',
        interests: 'Art, Literature, Wine'
    },
    {
        name: 'Carlos',
        top: '52%',
        left: '27%',
        languages: 'Spanish (Native), English (Professional), Portuguese (Intermediate)',
        interests: 'Football, Business, Technology'
    },
    {
        name: 'Luis',
        top: '45%',
        left: '23%',
        languages: 'Spanish (Native), English (Intermediate)',
        interests: 'Food, Culture, Dance'
    },
    {
        name: 'Yuki',
        top: '40%',
        left: '75%',
        languages: 'Japanese (Native), English (Intermediate)',
        interests: 'Anime, Gaming, Technology'
    },
    {
        name: 'Ji-won',
        top: '38%',
        left: '73%',
        languages: 'Korean (Native), English (Professional)',
        interests: 'K-pop, Fashion, Fitness'
    },
    {
        name: 'Priya',
        top: '45%',
        left: '62%',
        languages: 'Hindi (Native), English (Professional)',
        interests: 'Yoga, Cinema, History'
    },
    {
        name: 'Mei',
        top: '50%',
        left: '70%',
        languages: 'Mandarin (Native), English (Intermediate)',
        interests: 'Calligraphy, Tea, Philosophy'
    },
    {
        name: 'Liam',
        top: '72%',
        left: '78%',
        languages: 'English (Native)',
        interests: 'Surfing, Nature, Adventure'
    }
];

// Initialize the page
function init() {
    renderDots();
    setupLanguageButtons();
    setupLevelButtons();
    setupBackButton();
}

// Render user dots on the map
function renderDots() {
    const container = document.getElementById('dots-container');
    
    activeUsers.forEach(user => {
        // Create dot
        const dot = document.createElement('div');
        dot.className = 'user-dot';
        dot.style.top = user.top;
        dot.style.left = user.left;
        
        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-name">${user.name}</div>
            <div class="tooltip-languages">${user.languages}</div>
            <div class="tooltip-interests">Interests: ${user.interests}</div>
        `;
        
        // Add hover events
        dot.addEventListener('mouseenter', (e) => {
            showTooltip(tooltip, dot);
        });
        
        dot.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });
        
        container.appendChild(dot);
        container.appendChild(tooltip);
    });
}

// Show tooltip near dot
function showTooltip(tooltip, dot) {
    const dotRect = dot.getBoundingClientRect();
    const tooltipWidth = 250; // approximate
    const tooltipHeight = 100; // approximate
    
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
    tooltip.classList.add('visible');
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
    
    // Here you would typically start the matching process
    // For now, we just log to console
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


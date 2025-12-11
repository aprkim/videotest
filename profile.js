/**
 * TabbiMate User Profile Manager
 * 
 * Data Storage:
 * - Uses localStorage key: "tabbimate_profile_v1"
 * - Profile structure:
 *   {
 *     languages: [{ id: string, name: string, match: boolean }],
 *     interests: string[] (max 3),
 *     location: { city: string, country: string },
 *     photoUrl?: string (Data URL)
 *   }
 * 
 * Features:
 * - Profile photo upload with preview
 * - Location tracking (city, country)
 * - Language management with match toggle
 * - Interest tags (max 3)
 * - Auto-save to localStorage on every change
 */

// Constants
const STORAGE_KEY = 'tabbimate_profile_v1';
const MAX_INTERESTS = 3;

// Profile state
let profile = {
    languages: [],
    interests: [],
    location: {
        city: '',
        country: ''
    },
    photoUrl: null
};

// DOM Elements
let elements = {};

// Initialize the profile page
function init() {
    // Cache DOM elements
    elements = {
        photoUpload: document.getElementById('photo-upload'),
        avatarImage: document.getElementById('avatar-image'),
        avatarPlaceholder: document.getElementById('avatar-placeholder'),
        removePhotoBtn: document.getElementById('remove-photo'),
        cityInput: document.getElementById('city-input'),
        countryInput: document.getElementById('country-input'),
        languageInput: document.getElementById('language-input'),
        addLanguageBtn: document.getElementById('add-language-btn'),
        languagesList: document.getElementById('languages-list'),
        interestInput: document.getElementById('interest-input'),
        addInterestBtn: document.getElementById('add-interest-btn'),
        interestsList: document.getElementById('interests-list'),
        interestCount: document.getElementById('interest-count'),
        saveStatus: document.getElementById('save-status')
    };

    // Load profile from localStorage
    loadProfile();

    // Setup event listeners
    setupEventListeners();

    // Render initial UI
    renderLanguages();
    renderInterests();
    updateInterestCount();

    // Setup card dragging (reuse from main script)
    setupCardDragging();

    // Setup map dots animation
    setupMapDots();
}

// Load profile from localStorage
function loadProfile() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            profile = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }

    // Populate UI with loaded data
    if (profile.photoUrl) {
        elements.avatarImage.src = profile.photoUrl;
        elements.avatarImage.classList.remove('hidden');
        elements.avatarPlaceholder.classList.add('hidden');
        elements.removePhotoBtn.classList.remove('hidden');
    }

    elements.cityInput.value = profile.location.city || '';
    elements.countryInput.value = profile.location.country || '';
}

// Save profile to localStorage
function saveProfile() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        showSaveStatus();
    } catch (error) {
        console.error('Error saving profile:', error);
        alert('Failed to save profile. Please try again.');
    }
}

// Show save status indicator
function showSaveStatus() {
    elements.saveStatus.classList.add('visible');
    setTimeout(() => {
        elements.saveStatus.classList.remove('visible');
    }, 2000);
}

// Setup all event listeners
function setupEventListeners() {
    // Photo upload
    elements.photoUpload.addEventListener('change', handlePhotoUpload);
    elements.removePhotoBtn.addEventListener('click', removePhoto);

    // Location inputs
    elements.cityInput.addEventListener('input', handleLocationChange);
    elements.countryInput.addEventListener('input', handleLocationChange);

    // Language management
    elements.addLanguageBtn.addEventListener('click', addLanguage);
    elements.languageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addLanguage();
        }
    });

    // Interest management
    elements.addInterestBtn.addEventListener('click', addInterest);
    elements.interestInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addInterest();
        }
    });
}

// Handle photo upload
function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB.');
        return;
    }

    // Read file as Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
        profile.photoUrl = event.target.result;
        elements.avatarImage.src = profile.photoUrl;
        elements.avatarImage.classList.remove('hidden');
        elements.avatarPlaceholder.classList.add('hidden');
        elements.removePhotoBtn.classList.remove('hidden');
        saveProfile();
    };
    reader.onerror = () => {
        alert('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
}

// Remove photo
function removePhoto() {
    profile.photoUrl = null;
    elements.avatarImage.src = '';
    elements.avatarImage.classList.add('hidden');
    elements.avatarPlaceholder.classList.remove('hidden');
    elements.removePhotoBtn.classList.add('hidden');
    elements.photoUpload.value = '';
    saveProfile();
}

// Handle location input changes
function handleLocationChange() {
    profile.location.city = elements.cityInput.value.trim();
    profile.location.country = elements.countryInput.value.trim();
    saveProfile();
}

// Add a new language
function addLanguage() {
    const languageName = elements.languageInput.value.trim();
    
    if (!languageName) {
        return;
    }

    // Check for duplicates
    const exists = profile.languages.some(
        lang => lang.name.toLowerCase() === languageName.toLowerCase()
    );

    if (exists) {
        alert('This language is already in your list.');
        return;
    }

    // Create new language entry
    const newLanguage = {
        id: generateId(),
        name: languageName,
        match: true // Default to ON for matching
    };

    profile.languages.push(newLanguage);
    elements.languageInput.value = '';
    
    renderLanguages();
    saveProfile();
}

// Remove a language
function removeLanguage(id) {
    profile.languages = profile.languages.filter(lang => lang.id !== id);
    renderLanguages();
    saveProfile();
}

// Toggle language match status
function toggleLanguageMatch(id) {
    const language = profile.languages.find(lang => lang.id === id);
    if (language) {
        language.match = !language.match;
        saveProfile();
    }
}

// Render languages list
function renderLanguages() {
    if (profile.languages.length === 0) {
        elements.languagesList.innerHTML = '<p class="empty-state">No languages added yet. Add one above!</p>';
        return;
    }

    elements.languagesList.innerHTML = profile.languages.map(lang => `
        <div class="language-item" data-id="${lang.id}">
            <div class="language-info">
                <span class="language-name">${escapeHtml(lang.name)}</span>
            </div>
            <div class="language-actions">
                <label class="toggle-switch" title="Use for matching">
                    <input type="checkbox" ${lang.match ? 'checked' : ''} 
                           onchange="toggleLanguageMatch('${lang.id}')">
                    <span class="toggle-slider"></span>
                    <span class="toggle-label">Use for matching</span>
                </label>
                <button class="icon-btn remove-btn" onclick="removeLanguage('${lang.id}')" title="Remove language">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// Add a new interest
function addInterest() {
    const interestName = elements.interestInput.value.trim();
    
    if (!interestName) {
        return;
    }

    // Check max limit
    if (profile.interests.length >= MAX_INTERESTS) {
        alert(`You can only add up to ${MAX_INTERESTS} interests.`);
        return;
    }

    // Check for duplicates
    const exists = profile.interests.some(
        interest => interest.toLowerCase() === interestName.toLowerCase()
    );

    if (exists) {
        alert('This interest is already in your list.');
        return;
    }

    profile.interests.push(interestName);
    elements.interestInput.value = '';
    
    renderInterests();
    updateInterestCount();
    saveProfile();
}

// Remove an interest
function removeInterest(index) {
    profile.interests.splice(index, 1);
    renderInterests();
    updateInterestCount();
    saveProfile();
}

// Render interests list
function renderInterests() {
    if (profile.interests.length === 0) {
        elements.interestsList.innerHTML = '<p class="empty-state">No interests added yet. Share what you love!</p>';
        return;
    }

    elements.interestsList.innerHTML = profile.interests.map((interest, index) => `
        <div class="interest-tag">
            <span class="interest-name">${escapeHtml(interest)}</span>
            <button class="interest-remove" onclick="removeInterest(${index})" title="Remove interest">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
            </button>
        </div>
    `).join('');
}

// Update interest count display
function updateInterestCount() {
    elements.interestCount.textContent = profile.interests.length;
    
    // Disable add button if at max
    if (profile.interests.length >= MAX_INTERESTS) {
        elements.addInterestBtn.disabled = true;
        elements.interestInput.disabled = true;
    } else {
        elements.addInterestBtn.disabled = false;
        elements.interestInput.disabled = false;
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Setup card dragging (simplified version from main script)
function setupCardDragging() {
    const card = document.getElementById('profile-card');
    const container = document.querySelector('.center-container');
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    function dragStart(e) {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('label')) {
            return;
        }

        const style = window.getComputedStyle(card);
        const matrix = new DOMMatrixReadOnly(style.transform);
        xOffset = matrix.m41;
        yOffset = matrix.m42;

        if (e.type === 'touchstart') {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        isDragging = true;
        card.classList.add('dragging');
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

        card.style.transform = `translate(${currentX}px, ${currentY}px)`;
    }

    function dragEnd() {
        isDragging = false;
        card.classList.remove('dragging');
    }

    card.addEventListener('mousedown', dragStart);
    card.addEventListener('touchstart', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
}

// Setup map dots (simplified - just show static dots)
function setupMapDots() {
    const dotsContainer = document.getElementById('dots-container');
    
    // Sample dot positions
    const dotPositions = [
        { top: "32%", left: "18%" },
        { top: "40%", left: "22%" },
        { top: "65%", left: "30%" },
        { top: "42%", left: "76%" },
        { top: "50%", left: "26%" }
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


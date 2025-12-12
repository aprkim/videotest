/**
 * TabbiMate User Profile Manager
 * 
 * Data Storage:
 * - Uses localStorage key: "tabbimate_profile_v1"
 * - Profile structure:
 *   {
 *     languages: [{ 
 *       id: string, 
 *       name: string, 
 *       level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native',
 *       match: boolean 
 *     }],
 *     interests: string[] (max 3),
 *     location: { 
 *       city: string, 
 *       country: string,
 *       coordinates?: { lat: number, lon: number },
 *       verified: boolean,
 *       displayName?: string
 *     },
 *     photoUrl?: string (Data URL)
 *   }
 * 
 * Features:
 * - Profile photo upload with cropping capability
 * - Location tracking (city, country)
 * - Language management with level selection and match toggle
 * - Interest tags (max 3)
 * - Auto-save to localStorage on every change
 */

// Constants
const STORAGE_KEY = 'tabbimate_profile_v1';
const MAX_INTERESTS = 3;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

// Profile state
let profile = {
    userId: null, // Unique user ID
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

// Cropper instance
let cropper = null;
let tempImageFile = null;

// Initialize the profile page
function init() {
    // Cache DOM elements
    elements = {
        photoUpload: document.getElementById('photo-upload'),
        avatarImage: document.getElementById('avatar-image'),
        avatarPlaceholder: document.getElementById('avatar-placeholder'),
        editPhotoBtn: document.getElementById('edit-photo-btn'),
        removePhotoBtn: document.getElementById('remove-photo'),
        uploadBtnText: document.getElementById('upload-btn-text'),
        cityInput: document.getElementById('city-input'),
        countryInput: document.getElementById('country-input'),
        locationStatus: document.getElementById('location-status'),
        languageInput: document.getElementById('language-input'),
        addLanguageBtn: document.getElementById('add-language-btn'),
        languagesList: document.getElementById('languages-list'),
        interestInput: document.getElementById('interest-input'),
        addInterestBtn: document.getElementById('add-interest-btn'),
        interestsList: document.getElementById('interests-list'),
        interestCount: document.getElementById('interest-count'),
        saveStatus: document.getElementById('save-status'),
        cropModal: document.getElementById('crop-modal'),
        cropImage: document.getElementById('crop-image'),
        cropSaveBtn: document.getElementById('crop-save-btn'),
        cropCancelBtn: document.getElementById('crop-cancel-btn'),
        cropCloseBtn: document.getElementById('crop-close-btn')
    };

    // Get user ID from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const urlUserId = urlParams.get('id');
    
    if (urlUserId) {
        // User ID from URL query param (e.g., ?id=12345678)
        profile.userId = urlUserId;
        localStorage.setItem('tabbimate_user_id', urlUserId);
        
        // Check if this is a new user with onboarding data
        const newUserData = localStorage.getItem('tabbimate_new_user_data');
        if (newUserData) {
            loadNewUserData();
        } else {
            // Load existing profile for this user ID
            loadProfile();
        }
        
        // Update URL to clean format: /profile/12345678
        const basePath = window.location.pathname.includes('tabbimate') 
            ? '/tabbimate/profile' 
            : '/profile';
        const cleanUrl = `${basePath}/${urlUserId}`;
        window.history.replaceState({}, '', cleanUrl);
    } else {
        // Check if URL has ID in path format (e.g., /profile/12345678)
        const pathParts = window.location.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        
        if (lastPart && /^\d{8}$/.test(lastPart)) {
            // Valid 8-digit ID in path
            profile.userId = lastPart;
            localStorage.setItem('tabbimate_user_id', lastPart);
            loadProfile();
        } else {
            // No ID in URL, get from localStorage or create new
            const storedUserId = localStorage.getItem('tabbimate_user_id');
            if (storedUserId) {
                profile.userId = storedUserId;
                loadProfile();
                // Redirect to clean URL with ID (absolute path)
                const basePath = window.location.pathname.includes('tabbimate') 
                    ? '/tabbimate/profile' 
                    : '/profile';
                window.location.href = `${basePath}/${storedUserId}`;
            } else {
                // Create new user ID and redirect
                const newUserId = Math.floor(10000000 + Math.random() * 90000000).toString();
                profile.userId = newUserId;
                localStorage.setItem('tabbimate_user_id', newUserId);
                // Redirect to clean URL with ID (absolute path)
                const basePath = window.location.pathname.includes('tabbimate') 
                    ? '/tabbimate/profile' 
                    : '/profile';
                window.location.href = `${basePath}/${newUserId}`;
            }
        }
    }

    // Setup event listeners
    setupEventListeners();

    // Render initial UI
    renderLanguages();
    renderInterests();
    updateInterestCount();

    // Setup map dots animation
    setupMapDots();
}

// Load new user data from app flow
function loadNewUserData() {
    try {
        const stored = localStorage.getItem('tabbimate_new_user_data');
        if (stored) {
            const data = JSON.parse(stored);
            
            // Pre-fill with selected language and level
            if (data.language && data.level) {
                profile.languages.push({
                    id: Date.now().toString(),
                    name: data.language,
                    level: data.level,
                    match: true
                });
            }
            
            // Pre-fill with selected interests
            if (data.interests && Array.isArray(data.interests)) {
                profile.interests = [...data.interests];
            }
            
            // Clear the temporary data
            localStorage.removeItem('tabbimate_new_user_data');
            
            // Save to profile storage
            saveProfile();
            
            console.log('New user data loaded:', data);
        }
    } catch (error) {
        console.error('Error loading new user data:', error);
    }
}

// Load profile from localStorage
function loadProfile() {
    try {
        // Load with user-specific key
        const storageKey = `tabbimate_profile_${profile.userId}`;
        const stored = localStorage.getItem(storageKey);
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
        elements.editPhotoBtn.classList.remove('hidden');
        elements.removePhotoBtn.classList.remove('hidden');
        elements.uploadBtnText.textContent = 'Change Photo';
    }

    elements.cityInput.value = profile.location.city || '';
    elements.countryInput.value = profile.location.country || '';
    
    // Show location verification status
    updateLocationStatus();
}

// Update location status display
function updateLocationStatus() {
    if (!profile.location.city || !profile.location.country) {
        elements.locationStatus.innerHTML = '';
        return;
    }

    if (profile.location.verified) {
        elements.locationStatus.innerHTML = `
            <div class="status-message status-success">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span>Location verified - You'll appear on the map</span>
            </div>
        `;
    } else if (profile.location.verified === false) {
        elements.locationStatus.innerHTML = `
            <div class="status-message status-warning">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1.33331L1.33334 14H14.6667L8 1.33331Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 6V8.66667" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    <path d="M8 11.3333H8.00667" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Location not verified - Check spelling</span>
            </div>
        `;
    }
}

// Save profile to localStorage
function saveProfile() {
    try {
        // Save with user-specific key
        const storageKey = `tabbimate_profile_${profile.userId}`;
        localStorage.setItem(storageKey, JSON.stringify(profile));
        showSaveStatus();
    } catch (error) {
        console.error('Error saving profile:', error);
        customAlert('Failed to save profile. Please try again.');
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
    elements.photoUpload.addEventListener('change', handlePhotoSelect);
    elements.editPhotoBtn.addEventListener('click', () => elements.photoUpload.click());
    elements.removePhotoBtn.addEventListener('click', removePhoto);

    // Crop modal
    elements.cropSaveBtn.addEventListener('click', saveCroppedImage);
    elements.cropCancelBtn.addEventListener('click', closeCropModal);
    elements.cropCloseBtn.addEventListener('click', closeCropModal);

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

// Handle photo file selection
function handlePhotoSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
        customAlert('Please select an image file.');
        return;
    }

    // Check file size
    if (file.size > MAX_PHOTO_SIZE) {
        customAlert('Image size should be less than 5MB.');
        return;
    }

    tempImageFile = file;

    // Read file and show cropper
    const reader = new FileReader();
    reader.onload = (event) => {
        elements.cropImage.src = event.target.result;
        showCropModal();
    };
    reader.onerror = () => {
        customAlert('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
}

// Show crop modal
function showCropModal() {
    elements.cropModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Initialize cropper
    if (cropper) {
        cropper.destroy();
    }

    cropper = new Cropper(elements.cropImage, {
        aspectRatio: 1,
        viewMode: 2,
        dragMode: 'move',
        autoCropArea: 1,
        restore: false,
        guides: true,
        center: true,
        highlight: false,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: false,
    });
}

// Close crop modal
function closeCropModal() {
    elements.cropModal.classList.add('hidden');
    document.body.style.overflow = '';
    
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    // Reset file input
    elements.photoUpload.value = '';
    tempImageFile = null;
}

// Save cropped image
function saveCroppedImage() {
    if (!cropper) return;

    // Get cropped canvas
    const canvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high',
    });

    // Convert to Data URL
    canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            profile.photoUrl = e.target.result;
            
            // Update UI
            elements.avatarImage.src = profile.photoUrl;
            elements.avatarImage.classList.remove('hidden');
            elements.avatarPlaceholder.classList.add('hidden');
            elements.editPhotoBtn.classList.remove('hidden');
            elements.removePhotoBtn.classList.remove('hidden');
            elements.uploadBtnText.textContent = 'Change Photo';
            
            saveProfile();
            closeCropModal();
        };
        reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.9);
}

// Remove photo
function removePhoto() {
    profile.photoUrl = null;
    elements.avatarImage.src = '';
    elements.avatarImage.classList.add('hidden');
    elements.avatarPlaceholder.classList.remove('hidden');
    elements.editPhotoBtn.classList.add('hidden');
    elements.removePhotoBtn.classList.add('hidden');
    elements.uploadBtnText.textContent = 'Upload Photo';
    elements.photoUpload.value = '';
    saveProfile();
}

// Handle location input changes with debouncing
let locationTimeout = null;
function handleLocationChange() {
    // Clear previous timeout
    if (locationTimeout) {
        clearTimeout(locationTimeout);
    }

    // Debounce to avoid too many API calls
    locationTimeout = setTimeout(() => {
        const city = elements.cityInput.value.trim();
        const country = elements.countryInput.value.trim();

        // Only verify if both fields have values
        if (city && country) {
            verifyLocation(city, country);
        } else {
            // Save without verification if incomplete
            profile.location.city = city;
            profile.location.country = country;
            profile.location.coordinates = null;
            profile.location.verified = false;
            saveProfile();
        }
    }, 1000); // Wait 1 second after user stops typing
}

// Verify location using Nominatim (OpenStreetMap) geocoding API
async function verifyLocation(city, country) {
    try {
        // Show loading state
        elements.cityInput.style.borderColor = '#999';
        elements.countryInput.style.borderColor = '#999';

        const query = `${city}, ${country}`;
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'TabbiMate App'
                }
            }
        );

        if (!response.ok) {
            throw new Error('Geocoding service unavailable');
        }

        const data = await response.json();

        if (data && data.length > 0) {
            // Location found and verified
            const result = data[0];
            profile.location.city = city;
            profile.location.country = country;
            profile.location.coordinates = {
                lat: parseFloat(result.lat),
                lon: parseFloat(result.lon)
            };
            profile.location.verified = true;
            profile.location.displayName = result.display_name;

            // Show success (green border)
            elements.cityInput.style.borderColor = '#4CAF50';
            elements.countryInput.style.borderColor = '#4CAF50';

            setTimeout(() => {
                elements.cityInput.style.borderColor = '';
                elements.countryInput.style.borderColor = '';
            }, 2000);

            updateLocationStatus();
            saveProfile();
        } else {
            // Location not found
            profile.location.city = city;
            profile.location.country = country;
            profile.location.coordinates = null;
            profile.location.verified = false;

            // Show warning (orange border)
            elements.cityInput.style.borderColor = '#FF9800';
            elements.countryInput.style.borderColor = '#FF9800';

            customAlert('Location could not be verified. Please check your city and country names.');

            setTimeout(() => {
                elements.cityInput.style.borderColor = '';
                elements.countryInput.style.borderColor = '';
            }, 3000);

            updateLocationStatus();
            saveProfile();
        }
    } catch (error) {
        console.error('Location verification error:', error);
        
        // Save anyway but mark as unverified
        profile.location.city = city;
        profile.location.country = country;
        profile.location.coordinates = null;
        profile.location.verified = false;

        // Show error state (red border briefly)
        elements.cityInput.style.borderColor = '#BF3143';
        elements.countryInput.style.borderColor = '#BF3143';

        setTimeout(() => {
            elements.cityInput.style.borderColor = '';
            elements.countryInput.style.borderColor = '';
        }, 2000);

        updateLocationStatus();
        saveProfile();
    }
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
        customAlert('This language is already in your list.');
        return;
    }

    // Create new language entry
    const newLanguage = {
        id: generateId(),
        name: languageName,
        level: 'Intermediate', // Default level
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

// Change language level
function changeLanguageLevel(id, newLevel) {
    const language = profile.languages.find(lang => lang.id === id);
    if (language) {
        language.level = newLevel;
        saveProfile();
    }
}

// Render languages list
function renderLanguages() {
    if (profile.languages.length === 0) {
        elements.languagesList.innerHTML = '<p class="empty-state">No languages added yet. Add one above!</p>';
        return;
    }

    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Native'];

    elements.languagesList.innerHTML = profile.languages.map(lang => {
        // Ensure level exists, default to Intermediate if missing
        const currentLevel = lang.level || 'Intermediate';
        
        return `
        <div class="language-item" data-id="${lang.id}">
            <div class="language-info">
                <span class="language-name">${escapeHtml(lang.name)}</span>
                <select class="language-level-select" onchange="changeLanguageLevel('${lang.id}', this.value)">
                    ${levels.map(level => `
                        <option value="${level}" ${currentLevel === level ? 'selected' : ''}>
                            ${level}
                        </option>
                    `).join('')}
                </select>
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
    `}).join('');
}

// Add a new interest
function addInterest() {
    const interestName = elements.interestInput.value.trim();
    
    if (!interestName) {
        return;
    }

    // Check max limit
    if (profile.interests.length >= MAX_INTERESTS) {
        customAlert(`You can only add up to ${MAX_INTERESTS} interests.`);
        return;
    }

    // Check for duplicates
    const exists = profile.interests.some(
        interest => interest.toLowerCase() === interestName.toLowerCase()
    );

    if (exists) {
        customAlert('This interest is already in your list.');
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

// Custom alert (use TabbiMate modal if available)
function customAlert(message) {
    // For now, use native alert. Can be replaced with custom modal later
    alert(message);
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
        { top: "50%", left: "26%" },
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

// Setup sign out button
function setupProfileSignOut() {
    const signoutBtn = document.getElementById('profile-signout-btn');
    if (signoutBtn) {
        signoutBtn.addEventListener('click', async () => {
            // Check if Firebase is initialized
            if (typeof firebase === 'undefined' || !firebase.auth) {
                customAlert('Please wait a moment and try again.', 'Not Ready');
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
                    customAlert('Failed to sign out. Please try again.', 'Error');
                }
            }
        });
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        setupProfileSignOut();
    });
} else {
    init();
    setupProfileSignOut();
}

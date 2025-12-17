/**
 * Authentication Page Logic
 */

// DOM Elements
let elements = {};

// Initialize
function init() {
    console.log('=== Initializing auth page ===');
    
    // Initialize Firebase
    if (!initializeFirebase()) {
        console.error('Firebase initialization failed');
        showError('Firebase could not be initialized. Please check your configuration.');
        return;
    }
    console.log('Firebase initialized successfully');

    // Cache DOM elements
    elements = {
        // Sign In
        signinForm: document.getElementById('signin-form'),
        signinCard: document.getElementById('signin-card'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        signinBtnText: document.getElementById('signin-btn-text'),
        signinSpinner: document.getElementById('signin-spinner'),
        googleSignin: document.getElementById('google-signin'),
        forgotPassword: document.getElementById('forgot-password'),
        showSignup: document.getElementById('show-signup'),

        // Sign Up
        signupForm: document.getElementById('signup-form'),
        signupCard: document.getElementById('signup-card'),
        signupEmail: document.getElementById('signup-email'),
        signupPassword: document.getElementById('signup-password'),
        confirmPassword: document.getElementById('confirm-password'),
        signupBtnText: document.getElementById('signup-btn-text'),
        signupSpinner: document.getElementById('signup-spinner'),
        googleSignup: document.getElementById('google-signup'),
        showSignin: document.getElementById('show-signin')
    };
    
    console.log('DOM elements cached:', Object.keys(elements).length, 'elements');
    console.log('firebaseService available?', typeof firebaseService);

    // Setup event listeners
    setupEventListeners();

    // Setup map dots
    setupMapDots();
    
    // Check URL hash to show signup form if needed
    console.log('Current URL hash:', window.location.hash);
    if (window.location.hash === '#signup') {
        console.log('Hash is #signup, showing signup form');
        toggleForm('signup');
    } else {
        console.log('No #signup hash, showing signin form by default');
    }
    
    console.log('=== Auth page initialization complete ===');
}

// Setup event listeners
function setupEventListeners() {
    console.log('=== Setting up event listeners ===');
    console.log('Sign in form element:', elements.signinForm);
    
    // Sign In
    if (elements.signinForm) {
        elements.signinForm.addEventListener('submit', handleSignIn);
        console.log('Sign in form listener attached');
    } else {
        console.error('Sign in form not found!');
    }
    
    elements.googleSignin.addEventListener('click', handleGoogleSignIn);
    elements.forgotPassword.addEventListener('click', handleForgotPassword);
    elements.showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForm('signup');
    });

    // Sign Up
    elements.signupForm.addEventListener('submit', handleSignUp);
    elements.googleSignup.addEventListener('click', handleGoogleSignIn);
    elements.showSignin.addEventListener('click', (e) => {
        e.preventDefault();
        toggleForm('signin');
    });
    
    console.log('Event listeners setup complete');
}

// Handle Sign In
async function handleSignIn(e) {
    console.log('=== handleSignIn called ===');
    e.preventDefault();

    const email = elements.email.value.trim();
    const password = elements.password.value;
    
    console.log('Email:', email);
    console.log('Password length:', password.length);

    if (!email || !password) {
        console.log('Missing email or password');
        showError('Please enter email and password.');
        return;
    }

    // Show loading
    setLoading('signin', true);
    
    console.log('Calling firebaseService.signIn...');
    console.log('firebaseService exists?', typeof firebaseService);

    // Sign in
    const result = await firebaseService.signIn(email, password);
    
    console.log('Sign in result:', result);

    if (result.success) {
        console.log('Sign in successful, redirecting to dashboard');
        console.log('Current URL:', window.location.href);
        
        // Get user ID from Firebase
        const userId = result.user.uid;
        console.log('User ID:', userId);
        
        // Store user info in localStorage
        localStorage.setItem('videotest_user_id', userId);
        localStorage.setItem('videotest_user_email', result.user.email);
        
        // Redirect to dashboard
        console.log('Redirecting to dashboard');
        window.location.href = 'dashboard.html';
    } else {
        console.log('Sign in failed:', result.error);
        setLoading('signin', false);
        showError(result.error || 'Sign in failed. Please try again.');
    }
}

// Handle Sign Up
async function handleSignUp(e) {
    e.preventDefault();

    const email = elements.signupEmail.value.trim();
    const password = elements.signupPassword.value;
    const confirmPass = elements.confirmPassword.value;

    if (!email || !password || !confirmPass) {
        showError('Please fill in all fields.', 'signup');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters.', 'signup');
        return;
    }

    if (password !== confirmPass) {
        showError('Passwords do not match.', 'signup');
        return;
    }

    // Show loading
    setLoading('signup', true);

    // Sign up
    const result = await firebaseService.signUp(email, password);

    if (result.success) {
        // Show success
        showSuccess('Account created! Redirecting...', 'signup');
        
        // Redirect to dashboard
        setTimeout(() => {
            console.log('Sign up successful, redirecting to dashboard');
            
            // Get user ID from Firebase
            const userId = result.user.uid;
            console.log('User ID:', userId);
            
            // Store user info in localStorage
            localStorage.setItem('videotest_user_id', userId);
            localStorage.setItem('videotest_user_email', result.user.email);
            
            console.log('Redirecting to dashboard');
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        setLoading('signup', false);
        showError(result.error || 'Sign up failed. Please try again.', 'signup');
    }
}

// Handle Google Sign In
async function handleGoogleSignIn() {
    console.log('=== Google Sign In Initiated ===');
    
    const result = await firebaseService.signInWithGoogle();
    
    console.log('Google sign in result:', result);

    if (result.success) {
        console.log('Google sign in successful, redirecting to dashboard');
        
        // Get user ID from Firebase
        const userId = result.user.uid;
        console.log('User ID:', userId);
        console.log('User email:', result.user.email);
        
        // Store user info in localStorage
        localStorage.setItem('videotest_user_id', userId);
        localStorage.setItem('videotest_user_email', result.user.email);
        
        // Redirect to dashboard
        console.log('Redirecting to dashboard');
        window.location.href = 'dashboard.html';
    } else {
        console.error('Google sign in failed:', result.error);
        
        // Show user-friendly error message
        let errorMessage = 'Google sign in failed. Please try again.';
        
        if (result.error && result.error.includes('auth/popup-blocked')) {
            errorMessage = 'Pop-up was blocked. Please allow pop-ups for this site.';
        } else if (result.error && result.error.includes('auth/popup-closed-by-user')) {
            errorMessage = 'Sign in was cancelled.';
        } else if (result.error && result.error.includes('auth/unauthorized-domain')) {
            errorMessage = 'This domain is not authorized. Please contact support.';
        }
        
        showError(errorMessage);
    }
}

// Handle Forgot Password
async function handleForgotPassword(e) {
    e.preventDefault();

    const email = elements.email.value.trim();

    if (!email) {
        showError('Please enter your email address.');
        return;
    }

    const result = await firebaseService.resetPassword(email);

    if (result.success) {
        showSuccess('Password reset email sent! Check your inbox.');
    } else {
        showError(result.error || 'Failed to send reset email.');
    }
}

// Toggle between sign in and sign up forms
function toggleForm(form) {
    console.log('toggleForm called with:', form);
    if (form === 'signup') {
        console.log('Showing signup form, hiding signin form');
        elements.signinCard.classList.add('hidden');
        elements.signupCard.classList.remove('hidden');
    } else {
        console.log('Showing signin form, hiding signup form');
        elements.signupCard.classList.add('hidden');
        elements.signinCard.classList.remove('hidden');
    }

    // Clear any error messages
    clearMessages();
}

// Set loading state
function setLoading(form, isLoading) {
    if (form === 'signin') {
        elements.signinBtnText.style.display = isLoading ? 'none' : 'inline';
        elements.signinSpinner.classList.toggle('hidden', !isLoading);
        elements.signinForm.querySelector('button[type="submit"]').disabled = isLoading;
    } else {
        elements.signupBtnText.style.display = isLoading ? 'none' : 'inline';
        elements.signupSpinner.classList.toggle('hidden', !isLoading);
        elements.signupForm.querySelector('button[type="submit"]').disabled = isLoading;
    }
}

// Show error message
function showError(message, form = 'signin') {
    clearMessages();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    const targetForm = form === 'signin' ? elements.signinForm : elements.signupForm;
    if (targetForm && targetForm.firstChild) {
        targetForm.insertBefore(errorDiv, targetForm.firstChild);
    } else if (targetForm) {
        targetForm.appendChild(errorDiv);
    } else {
        console.error('Target form not found');
        return;
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show success message
function showSuccess(message, form = 'signin') {
    clearMessages();

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;

    const targetForm = form === 'signin' ? elements.signinForm : elements.signupForm;
    if (targetForm && targetForm.firstChild) {
        targetForm.insertBefore(successDiv, targetForm.firstChild);
    } else if (targetForm) {
        targetForm.appendChild(successDiv);
    } else {
        console.error('Target form not found');
        return;
    }
}

// Clear all messages
function clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
}

// Setup map dots
function setupMapDots() {
    const dotsContainer = document.getElementById('dots-container');
    
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


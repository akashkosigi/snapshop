// ===========================
// Authentication System
// ===========================

/**
 * Initialize authentication page
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeAuth();
});

function initializeAuth() {
    // Load theme preference
    loadAuthTheme();
    
    // Set up event listeners
    setupAuthListeners();
    
    // Check if already logged in
    checkExistingAuth();
}

// ===========================
// Event Listeners
// ===========================
function setupAuthListeners() {
    // Theme toggle
    document.getElementById('authDarkModeToggle').addEventListener('click', toggleAuthTheme);
    
    // Form switching
    document.getElementById('showSignup').addEventListener('click', (e) => {
        e.preventDefault();
        showSignupForm();
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginForm();
    });
    
    // Form submissions
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
    document.getElementById('signupFormElement').addEventListener('submit', handleSignup);
    
    // Password toggle buttons
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });
    
    // Password strength checker
    document.getElementById('signupPassword').addEventListener('input', checkPasswordStrength);
    
    // Real-time validation
    setupRealtimeValidation();
}

// ===========================
// Form Switching
// ===========================
function showSignupForm() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('signupForm').classList.add('active');
    clearFormErrors();
}

function showLoginForm() {
    document.getElementById('signupForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');
    clearFormErrors();
}

// ===========================
// Login Handler
// ===========================
/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors();
    
    // Get form data
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate inputs
    let isValid = true;
    
    if (!validateEmail(email)) {
        showError('loginEmail', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (password.length < 6) {
        showError('loginPassword', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Check if user exists in localStorage
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showError('loginEmail', 'No account found with this email');
        showAuthToast('Account not found. Please sign up first.', 'error');
        return;
    }
    
    if (user.password !== password) {
        showError('loginPassword', 'Incorrect password');
        showAuthToast('Incorrect password. Please try again.', 'error');
        return;
    }
    
    // Login successful
    const authData = {
        isAuthenticated: true,
        user: {
            name: user.name,
            email: user.email,
            phone: user.phone
        },
        loginTime: new Date().toISOString()
    };
    
    // Save auth data
    if (rememberMe) {
        localStorage.setItem('snapshop_auth', JSON.stringify(authData));
    } else {
        sessionStorage.setItem('snapshop_auth', JSON.stringify(authData));
    }
    
    // Show success message
    showAuthToast('Login successful! Redirecting...', 'success');
    
    // Redirect to main shop
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// ===========================
// Signup Handler
// ===========================
/**
 * Handle signup form submission
 * @param {Event} e - Form submit event
 */
function handleSignup(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors();
    
    // Get form data
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const phone = document.getElementById('signupPhone').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validate inputs
    let isValid = true;
    
    if (name.length < 2) {
        showError('signupName', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        showError('signupEmail', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!validatePhone(phone)) {
        showError('signupPhone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    if (password.length < 6) {
        showError('signupPassword', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showError('signupConfirmPassword', 'Passwords do not match');
        isValid = false;
    }
    
    if (!agreeTerms) {
        showAuthToast('Please agree to the Terms & Conditions', 'error');
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Check if user already exists
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showError('signupEmail', 'An account with this email already exists');
        showAuthToast('Email already registered. Please login.', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now(),
        name,
        email,
        phone,
        password,
        createdAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('snapshop_users', JSON.stringify(users));
    
    // Show success message
    showAuthToast('Account created successfully! Please login.', 'success');
    
    // Switch to login form
    setTimeout(() => {
        showLoginForm();
        // Pre-fill email
        document.getElementById('loginEmail').value = email;
    }, 1500);
}

// ===========================
// Validation Functions
// ===========================
/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number
 * @param {string} phone - Phone to validate
 * @returns {boolean} Is valid
 */
function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Show validation error
 * @param {string} fieldId - Field ID
 * @param {string} message - Error message
 */
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = field.parentElement.querySelector('.error-msg');
    
    field.classList.add('error');
    if (errorSpan) {
        errorSpan.textContent = message;
    }
}

/**
 * Clear all form errors
 */
function clearFormErrors() {
    document.querySelectorAll('.auth-form input').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.error-msg').forEach(span => {
        span.textContent = '';
    });
}

// ===========================
// Real-time Validation
// ===========================
function setupRealtimeValidation() {
    // Email validation
    document.getElementById('loginEmail').addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            showError('loginEmail', 'Invalid email format');
        }
    });
    
    document.getElementById('signupEmail').addEventListener('blur', function() {
        if (this.value && !validateEmail(this.value)) {
            showError('signupEmail', 'Invalid email format');
        }
    });
    
    // Phone validation
    document.getElementById('signupPhone').addEventListener('blur', function() {
        if (this.value && !validatePhone(this.value)) {
            showError('signupPhone', 'Invalid phone number');
        }
    });
    
    // Confirm password validation
    document.getElementById('signupConfirmPassword').addEventListener('input', function() {
        const password = document.getElementById('signupPassword').value;
        if (this.value && this.value !== password) {
            showError('signupConfirmPassword', 'Passwords do not match');
        } else {
            const errorSpan = this.parentElement.querySelector('.error-msg');
            if (errorSpan) errorSpan.textContent = '';
            this.classList.remove('error');
        }
    });
    
    // Clear error on input
    document.querySelectorAll('.auth-form input').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            const errorSpan = this.parentElement.querySelector('.error-msg');
            if (errorSpan && errorSpan.textContent) {
                errorSpan.textContent = '';
            }
        });
    });
}

// ===========================
// Password Strength Checker
// ===========================
/**
 * Check password strength
 */
function checkPasswordStrength() {
    const password = document.getElementById('signupPassword').value;
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!password) {
        strengthFill.className = 'strength-fill';
        strengthText.textContent = '';
        return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    // Determine strength level
    if (strength <= 2) {
        strengthFill.className = 'strength-fill weak';
        strengthText.textContent = 'Weak password';
        strengthText.style.color = 'var(--error)';
    } else if (strength <= 4) {
        strengthFill.className = 'strength-fill medium';
        strengthText.textContent = 'Medium password';
        strengthText.style.color = 'var(--warning)';
    } else {
        strengthFill.className = 'strength-fill strong';
        strengthText.textContent = 'Strong password';
        strengthText.style.color = 'var(--success)';
    }
}

// ===========================
// Password Visibility Toggle
// ===========================
/**
 * Toggle password visibility
 */
function togglePasswordVisibility(e) {
    const button = e.currentTarget;
    const targetId = button.dataset.target;
    const input = document.getElementById(targetId);
    
    if (input.type === 'password') {
        input.type = 'text';
        button.classList.add('active');
    } else {
        input.type = 'password';
        button.classList.remove('active');
    }
}

// ===========================
// User Storage Management
// ===========================
/**
 * Get all users from localStorage
 * @returns {Array} Array of users
 */
function getUsers() {
    const users = localStorage.getItem('snapshop_users');
    return users ? JSON.parse(users) : [];
}

/**
 * Check if user is already authenticated
 */
function checkExistingAuth() {
    const authLocal = localStorage.getItem('snapshop_auth');
    const authSession = sessionStorage.getItem('snapshop_auth');
    
    if (authLocal || authSession) {
        const auth = JSON.parse(authLocal || authSession);
        if (auth.isAuthenticated) {
            // User is already logged in, redirect to shop
            window.location.href = 'index.html';
        }
    }
}

// ===========================
// Theme Management
// ===========================
/**
 * Toggle dark mode
 */
function toggleAuthTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('snapshop_theme', newTheme);
}

/**
 * Load theme preference
 */
function loadAuthTheme() {
    const savedTheme = localStorage.getItem('snapshop_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
}

// ===========================
// Toast Notifications
// ===========================
/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, error)
 */
function showAuthToast(message, type = 'success') {
    const toast = document.getElementById('authToast');
    const toastMessage = document.getElementById('authToastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

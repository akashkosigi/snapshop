// ===========================
// Product Data
// ===========================
const products = [
    {
        id: 1,
        title: "Wireless Headphones",
        description: "Premium noise-cancelling headphones with 30-hour battery life",
        price: 12499,
        category: "electronics",
        emoji: "🎧"
    },
    {
        id: 2,
        title: "Smart Watch",
        description: "Fitness tracker with heart rate monitor and GPS",
        price: 24999,
        category: "electronics",
        emoji: "⌚"
    },
    {
        id: 3,
        title: "Leather Jacket",
        description: "Genuine leather jacket with modern slim fit design",
        price: 16999,
        category: "fashion",
        emoji: "🧥"
    },
    {
        id: 4,
        title: "Running Shoes",
        description: "Lightweight running shoes with cushioned sole",
        price: 7499,
        category: "fashion",
        emoji: "👟"
    },
    {
        id: 5,
        title: "Coffee Maker",
        description: "Programmable coffee maker with thermal carafe",
        price: 6799,
        category: "home",
        emoji: "☕"
    },
    {
        id: 6,
        title: "Table Lamp",
        description: "Modern LED desk lamp with adjustable brightness",
        price: 3899,
        category: "home",
        emoji: "💡"
    },
    {
        id: 7,
        title: "Bluetooth Speaker",
        description: "Portable waterproof speaker with 360° sound",
        price: 5899,
        category: "electronics",
        emoji: "🔊"
    },
    {
        id: 8,
        title: "Designer Sunglasses",
        description: "UV protection polarized sunglasses",
        price: 10999,
        category: "fashion",
        emoji: "🕶️"
    }
];

// ===========================
// State Management
// ===========================
let cart = [];
let currentFilter = 'all';
let searchQuery = '';

// ===========================
// Initialize App
// ===========================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize the application
 * Load cart from localStorage and set up event listeners
 */
function initializeApp() {
    // Load cart from localStorage
    loadCartFromStorage();
    
    // Load theme preference
    loadThemePreference();
    
    // Render products
    renderProducts();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update cart UI
    updateCartUI();
}

// ===========================
// Event Listeners Setup
// ===========================
function setupEventListeners() {
    // Search functionality
    document.getElementById('searchInput').addEventListener('input', handleSearch);
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    
    // Cart sidebar
    document.getElementById('cartBtn').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    
    // Dark mode toggle
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilter);
    });
    
    // Checkout
    document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
    document.getElementById('closeCheckout').addEventListener('click', closeCheckout);
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
    
    // Close modals on overlay click
    document.getElementById('checkoutModal').addEventListener('click', (e) => {
        if (e.target.id === 'checkoutModal') {
            closeCheckout();
        }
    });
}

// ===========================
// Product Rendering
// ===========================
/**
 * Render products based on current filter and search query
 */
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const noResults = document.getElementById('noResults');
    
    // Filter products
    let filteredProducts = products.filter(product => {
        const matchesFilter = currentFilter === 'all' || product.category === currentFilter;
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });
    
    // Show/hide no results message
    if (filteredProducts.length === 0) {
        productsGrid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    } else {
        productsGrid.style.display = 'grid';
        noResults.style.display = 'none';
    }
    
    // Render product cards
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h4 class="product-title">${product.title}</h4>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">₹${product.price.toLocaleString('en-IN')}</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===========================
// Search Functionality
// ===========================
/**
 * Handle search input
 */
function handleSearch() {
    searchQuery = document.getElementById('searchInput').value;
    renderProducts();
}

// ===========================
// Filter Functionality
// ===========================
/**
 * Handle category filter
 */
function handleFilter(e) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Update filter and render
    currentFilter = e.target.dataset.filter;
    renderProducts();
}

// ===========================
// Cart Management
// ===========================
/**
 * Add product to cart
 * @param {number} productId - The ID of the product to add
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Save to localStorage
    saveCartToStorage();
    
    // Update UI
    updateCartUI();
    
    // Show toast notification
    showToast(`${product.title} added to cart!`);
}

/**
 * Remove product from cart
 * @param {number} productId - The ID of the product to remove
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
    showToast('Item removed from cart');
}

/**
 * Update quantity of a cart item
 * @param {number} productId - The ID of the product
 * @param {number} change - The change in quantity (+1 or -1)
 */
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    // Remove if quantity is 0
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    saveCartToStorage();
    updateCartUI();
}

/**
 * Calculate total cart price
 * @returns {number} Total price
 */
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Update cart UI (sidebar and cart count)
 */
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Show/hide empty cart message
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        emptyCart.style.display = 'flex';
        checkoutBtn.disabled = true;
    } else {
        cartItems.style.display = 'block';
        emptyCart.style.display = 'none';
        checkoutBtn.disabled = false;
        
        // Render cart items
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-image">${item.emoji}</div>
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    // Update total
    const total = calculateTotal();
    cartTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
}

/**
 * Open cart sidebar
 */
function openCart() {
    document.getElementById('cartSidebar').classList.add('open');
}

/**
 * Close cart sidebar
 */
function closeCart() {
    document.getElementById('cartSidebar').classList.remove('open');
}

// ===========================
// LocalStorage Management
// ===========================
/**
 * Save cart to localStorage
 */
function saveCartToStorage() {
    localStorage.setItem('snapshop_cart', JSON.stringify(cart));
}

/**
 * Load cart from localStorage
 */
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('snapshop_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// ===========================
// Dark Mode
// ===========================
/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('snapshop_theme', newTheme);
}

/**
 * Load theme preference from localStorage
 */
function loadThemePreference() {
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
// Checkout
// ===========================
/**
 * Open checkout modal
 */
function openCheckout() {
    const modal = document.getElementById('checkoutModal');
    const subtotal = calculateTotal();
    const shipping = 50;
    const total = subtotal + shipping;
    
    document.getElementById('checkoutSubtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('checkoutTotal').textContent = `₹${total.toLocaleString('en-IN')}`;
    
    modal.classList.add('open');
    closeCart();
}

/**
 * Close checkout modal
 */
function closeCheckout() {
    document.getElementById('checkoutModal').classList.remove('open');
    document.getElementById('checkoutForm').reset();
    clearFormErrors();
}

/**
 * Handle checkout form submission
 * @param {Event} e - Form submit event
 */
function handleCheckout(e) {
    e.preventDefault();
    
    // Clear previous errors
    clearFormErrors();
    
    // Validate form
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        country: document.getElementById('country').value.trim()
    };
    
    let isValid = true;
    
    // Validate full name
    if (formData.fullName.length < 2) {
        showFieldError('fullName', 'Please enter a valid name');
        isValid = false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showFieldError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate phone
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
        showFieldError('phone', 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Validate address
    if (formData.address.length < 10) {
        showFieldError('address', 'Please enter a complete address');
        isValid = false;
    }
    
    // Validate city
    if (formData.city.length < 2) {
        showFieldError('city', 'Please enter a valid city');
        isValid = false;
    }
    
    // Validate ZIP code
    if (formData.zipCode.length < 4) {
        showFieldError('zipCode', 'Please enter a valid ZIP code');
        isValid = false;
    }
    
    // Validate country
    if (formData.country.length < 2) {
        showFieldError('country', 'Please enter a valid country');
        isValid = false;
    }
    
    if (!isValid) {
        return;
    }
    
    // Process order (simulate)
    processOrder(formData);
}

/**
 * Show field validation error
 * @param {string} fieldId - The ID of the field
 * @param {string} message - Error message
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = field.parentElement.querySelector('.error-message');
    
    field.classList.add('error');
    errorSpan.textContent = message;
}

/**
 * Clear all form errors
 */
function clearFormErrors() {
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
        field.classList.remove('error');
    });
    document.querySelectorAll('.error-message').forEach(span => {
        span.textContent = '';
    });
}

/**
 * Process order (simulated)
 * @param {Object} formData - Form data
 */
function processOrder(formData) {
    // In a real app, this would send data to a server
    console.log('Order placed:', formData);
    console.log('Cart items:', cart);
    
    // Clear cart
    cart = [];
    saveCartToStorage();
    updateCartUI();
    
    // Close modal
    closeCheckout();
    
    // Show success message
    showToast('Order placed successfully! Thank you for shopping with SnapShop.', 5000);
}

// ===========================
// Toast Notifications
// ===========================
/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ===========================
// Utility Functions
// ===========================
/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}

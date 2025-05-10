// DOM Elements
const productsContainer = document.getElementById('products');
const cartPanel = document.getElementById('cart-panel');
const cartOverlay = document.getElementById('cart-overlay');
const cartBtn = document.getElementById('cart-button');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const cartCount = document.getElementById('cart-count');
const url = 'https://api.allorigins.win/raw?url=https://fakestoreapi.com/products';
// State
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    
    // Add event listeners
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    checkoutBtn.addEventListener('click', checkout);
    cartOverlay.addEventListener('click', closeCart);
    
    // Initialize cart counter
    updateCartCounter();
    renderCart();
});

// Fetch products from fakestoreapi
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products/category/electronics');
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Process products - add sale info for demo purposes
        products = data.map(product => ({
            ...product,
            salepercentage: Math.floor(Math.random() * 30) + 10, // Random 10-40% off
            previousprice: (product.price * 1.3).toFixed(2), // Add 30% for "original" price
            discount: (product.price * 0.3).toFixed(2) // Calculate discount
        }));
        
        renderProducts();
    } catch (error) {
        console.error('Error fetching products:', error);
        productsContainer.innerHTML = '<p class="text-center text-gray-500">Error loading products. Please try again later.</p>';
    }
}

// Render products grid
function renderProducts() {
    if (!products.length) {
        productsContainer.innerHTML = '<p class="text-center text-gray-500">No products available</p>';
        return;
    }
    
    productsContainer.innerHTML = products.map(product => `
        <div class="relative bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div class="flex justify-center items-center h-48 p-4 bg-gray-100">
                <img class="h-full object-contain" src="${product.image}" alt="${product.title}" loading="lazy" />
            </div>
            
            <div class="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                ${product.salepercentage}% OFF
            </div>
            
            <div class="p-4">
                <h3 class="text-gray-800 font-semibold text-lg mb-2 line-clamp-2">${product.title}</h3>
                
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-gray-900 font-bold text-lg">$${product.price}</span>
                    <span class="text-gray-500 text-sm line-through">$${product.previousprice}</span>
                </div>
                
                <div class="text-green-600 text-sm mb-4">Save $${product.discount}</div>
                
                <button onclick="addToCart(${product.id})" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors duration-200">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Update cart counter
function updateCartCounter() {
    const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
    cartCount.classList.toggle('hidden', count === 0);
}

// Add product to cart
function addToCart(id) {
    if (!cart[id]) {
        const product = products.find(p => p.id === id);
        if (!product) return;
        cart[id] = { ...product, quantity: 1 };
    } else {
        cart[id].quantity++;
    }
    
    saveCartToStorage();
    renderCart();
    updateCartCounter();
    
    // Show feedback
    const feedback = document.createElement('div');
    feedback.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg animate-fade-in';
    feedback.textContent = 'Item added to cart!';
    document.body.appendChild(feedback);
    setTimeout(() => {
        feedback.classList.add('animate-fade-out');
        setTimeout(() => feedback.remove(), 300);
    }, 1700);
}

// Remove product from cart
function removeFromCart(id) {
    delete cart[id];
    saveCartToStorage();
    renderCart();
    updateCartCounter();
}

// Change quantity in cart
function changeQuantity(id, qty) {
    if (qty <= 0) {
        removeFromCart(id);
    } else {
        cart[id].quantity = qty;
    }
    saveCartToStorage();
    renderCart();
    updateCartCounter();
}

// Calculate total price
function calculateTotal() {
    return Object.values(cart).reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Render cart panel contents
function renderCart() {
    const items = Object.values(cart);
    
    if (items.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="h-full flex flex-col items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p class="text-lg">Your cart is empty</p>
                <p class="text-sm mt-1">Start shopping to add items</p>
            </div>
        `;
        cartTotal.textContent = '$0.00';
        checkoutBtn.disabled = true;
        return;
    }

    cartItemsContainer.innerHTML = items.map(item => `
        <div class="flex items-center gap-4 py-4 border-b">
            <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-contain rounded" loading="lazy" />
            <div class="flex-1">
                <h4 class="font-medium text-gray-800 line-clamp-1">${item.title}</h4>
                <p class="text-blue-600 font-bold">$${item.price.toFixed(2)}</p>
                <div class="flex items-center mt-2 gap-2">
                    <button onclick="changeQuantity(${item.id}, ${item.quantity - 1})" 
                        class="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
                        -
                    </button>
                    <span class="w-8 text-center">${item.quantity}</span>
                    <button onclick="changeQuantity(${item.id}, ${item.quantity + 1})" 
                        class="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full transition-colors">
                        +
                    </button>
                </div>
            </div>
            <button onclick="removeFromCart(${item.id})" 
                class="text-gray-500 hover:text-red-500 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    `).join('');
    
    cartTotal.textContent = '$' + calculateTotal().toFixed(2);
    checkoutBtn.disabled = false;
}

// Cart visibility functions
function openCart() {
    cartPanel.classList.remove('translate-x-full');
    cartOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartPanel.classList.add('translate-x-full');
    cartOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

// Checkout button handler
function checkout() {
    const items = Object.values(cart);
    if (items.length === 0) return;
    
    const total = calculateTotal().toFixed(2);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Create a nicer looking alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    alertDiv.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-pop-in">
            <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Thank you for your purchase!</h3>
                <p class="text-gray-600 mb-4">${itemCount} item(s) - Total: $${total}</p>
                <p class="text-gray-600">Your order has been placed successfully.</p>
            </div>
            <div class="mt-6">
                <button onclick="this.closest('div').remove()" 
                    class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition-colors">
                    Continue Shopping
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Clear cart
    cart = {};
    saveCartToStorage();
    renderCart();
    closeCart();
    updateCartCounter();
}

// Storage functions
function saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Make functions available globally
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.changeQuantity = changeQuantity;

// Add some simple animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fade-out {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(10px); }
    }
    @keyframes pop-in {
        0% { opacity: 0; transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
    }
    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
    .animate-fade-out { animation: fade-out 0.2s ease-out forwards; }
    .animate-pop-in { animation: pop-in 0.2s ease-out forwards; }
`;
document.head.appendChild(style);
//categoriess bar

 document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.category-tab');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Reset styles for all tabs
            tabs.forEach(t => {
                t.classList.remove('bg-sky-600', 'text-white');
                t.classList.add('bg-slate-100', 'hover:bg-sky-100');

                const svg = t.querySelector('svg');
                const span = t.querySelector('span');

                svg?.classList.remove('stroke-white');
                svg?.classList.add('stroke-blue-500');

                span?.classList.remove('text-white');
                span?.classList.add('text-neutral-800');
            });

            // Apply active styles to the clicked tab
            tab.classList.add('bg-sky-600', 'text-white');
            tab.classList.remove('bg-slate-100', 'hover:bg-sky-100');

            const activeSvg = tab.querySelector('svg');
            const activeSpan = tab.querySelector('span');

            activeSvg?.classList.add('stroke-white');
            activeSvg?.classList.remove('stroke-blue-500');

            activeSpan?.classList.add('text-white');
            activeSpan?.classList.remove('text-neutral-800');

            console.log('Selected:', tab.dataset.category);
        });
    });
});
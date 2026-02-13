// Get the cart count element
const cartCountElement = document.getElementById('cart-count');

// Initialize the cart
let cart = {};

// Function to update the cart count
function updateCartCount() {
    const cartCount = Object.keys(cart).length;
    cartCountElement.textContent = cartCount;
}

// Function to add an item to the cart
// Updated: accepts productId (must match catalog feed ID) as first parameter
function addToCart(productId, name, price) {
    if (cart[productId]) {
        cart[productId].quantity++;
    } else {
        cart[productId] = { name, price, quantity: 1 };
    }
    updateCartCount();
    showNotification(`Added ${name} to cart!`);
    saveCartToLocalStorage();

    // Fire AddToCart Pixel event with content_ids matching catalog feed
    if (typeof fbq !== 'undefined') {
        fbq('track', 'AddToCart', {
            content_ids: [productId],
            content_type: 'product',
            contents: [{id: productId, quantity: 1}],
            value: price,
            currency: 'USD'
        });
    }
}

// Function to remove an item from the cart
function removeFromCart(productId) {
    if (cart[productId]) {
        delete cart[productId];
    }
    updateCartCount();
    saveCartToLocalStorage();
}

// Function to save the cart to local storage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to load the cart from local storage
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartCount();
    }
}

// Load the cart from local storage when the page loads
loadCartFromLocalStorage();

// Function to display the cart table
function displayCartTable() {
    const cartTableBody = document.getElementById('cart-body');
    cartTableBody.innerHTML = '';
    for (const productId in cart) {
        const item = cart[productId];
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        row.appendChild(nameCell);
        const priceCell = document.createElement('td');
        priceCell.textContent = `$${item.price}`;
        row.appendChild(priceCell);
        const quantityCell = document.createElement('td');
        quantityCell.textContent = item.quantity;
        row.appendChild(quantityCell);
        const totalCell = document.createElement('td');
        totalCell.textContent = `$${item.price * item.quantity}`;
        row.appendChild(totalCell);
        cartTableBody.appendChild(row);
    }
}

// Display the cart table when the cart page loads
if (document.getElementById('cart-table')) {
    displayCartTable();
}

// Function to initiate checkout
function initiateCheckout() {
    // Fire InitiateCheckout Pixel event
    if (typeof fbq !== 'undefined') {
        const contentIds = Object.keys(cart);
        let totalValue = 0;
        const contents = [];
        for (const productId in cart) {
            const item = cart[productId];
            totalValue += item.price * item.quantity;
            contents.push({id: productId, quantity: item.quantity});
        }
        fbq('track', 'InitiateCheckout', {
            content_ids: contentIds,
            content_type: 'product',
            contents: contents,
            value: totalValue,
            currency: 'USD',
            num_items: contents.length
        });
    }

    // Redirect to the checkout page
    window.location.href = 'checkout.html';
}

// Function to complete purchase
function completePurchase() {
    // Fire Purchase Pixel event with content_ids before clearing cart
    if (typeof fbq !== 'undefined') {
        const contentIds = Object.keys(cart);
        let totalValue = 0;
        const contents = [];
        for (const productId in cart) {
            const item = cart[productId];
            totalValue += item.price * item.quantity;
            contents.push({id: productId, quantity: item.quantity});
        }
        fbq('track', 'Purchase', {
            content_ids: contentIds,
            content_type: 'product',
            contents: contents,
            value: totalValue,
            currency: 'USD',
            num_items: contents.length
        });
    }

    // Clear the cart
    cart = {};
    saveCartToLocalStorage();
    updateCartCount();
    // Redirect to the purchase confirmation page
    window.location.href = 'purchase-confirmation.html';
}

// Add event listener to the purchase button
if (document.getElementById('purchase-btn')) {
    document.getElementById('purchase-btn').addEventListener('click', completePurchase);
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.innerHTML = `
        <span>${message}</span>
        <svg width="20" height="20" viewBox="0 0 20 20">
            <path d="M10 2C5.14 2 1 5.14 1 10s4.14 8 9 8 9-4.14 9-8S14.86 2 10 2z" fill="#fff" />
        </svg>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
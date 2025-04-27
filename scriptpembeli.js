// DOM Elements
const shopProductList = document.getElementById('shop-product-list');
const cartItems = document.getElementById('cart-items');
const totalPrice = document.getElementById('total-price');
const cartEmpty = document.getElementById('cart-empty');
const cartActions = document.getElementById('cart-actions');
const checkoutBtn = document.getElementById('checkout-btn');
const clearCartBtn = document.getElementById('clear-cart-btn');
const cartCount = document.getElementById('cart-count');
const floatingCartCount = document.getElementById('floating-cart-count');
const floatingCartBtn = document.querySelector('.floating-cart');
const cartPanel = document.querySelector('.cart-panel');
const closeCartBtn = document.querySelector('.close-cart');
const cartOverlay = document.querySelector('.cart-overlay');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const categoryItems = document.querySelectorAll('.category-item');

// Data
let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentCategory = 'all';
let currentSearch = '';

// Initialize
renderShopProducts();
renderCart();
updateCartCount();

// Event Listeners
checkoutBtn.addEventListener('click', checkout);
clearCartBtn.addEventListener('click', clearCart);
floatingCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);
searchBtn.addEventListener('click', searchProducts);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchProducts();
});

// Category Filter
categoryItems.forEach(item => {
  item.addEventListener('click', () => {
    categoryItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    currentCategory = item.dataset.category;
    renderShopProducts();
  });
});

// Render Products
function renderShopProducts() {
  shopProductList.innerHTML = '';
  
  let filteredProducts = products;
  
  // Filter by category
  if (currentCategory !== 'all') {
    filteredProducts = filteredProducts.filter(
      product => product.category === currentCategory
    );
  }
  
  // Filter by search
  if (currentSearch) {
    filteredProducts = filteredProducts.filter(
      product => product.name.toLowerCase().includes(currentSearch.toLowerCase()) ||
        product.description.toLowerCase().includes(currentSearch.toLowerCase())
    );
  }
  
  if (filteredProducts.length === 0) {
    shopProductList.innerHTML = '<p class="no-products">Tidak ada produk yang ditemukan</p>';
    return;
  }
  
  filteredProducts.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200'" />
      <div class="product-info">
        <h2>${product.name}</h2>
        <p class="price">Rp ${product.price.toLocaleString()}</p>
        <p class="location"><i class="fas fa-map-marker-alt"></i> ${product.location || 'Indonesia'}</p>
        <div class="rating">
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star"></i>
          <i class="fas fa-star-half-alt"></i>
          <span>(${Math.floor(Math.random() * 100) + 1})</span>
        </div>
        <button class="btn-primary" onclick="addToCart(${index})">+ Keranjang</button>
      </div>
    `;
    shopProductList.appendChild(card);
  });
}

// Cart Functions
function addToCart(index) {
  const product = products[index];
  const existingItem = cart.find(item => item.id === product.id);
  
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  
  saveCart();
  renderCart();
  updateCartCount();
  showToast(`${product.name} berhasil ditambahkan ke keranjang!`);
  
  const cards = document.querySelectorAll('.product-card');
  if (cards[index]) {
    cards[index].classList.add('bounce');
    setTimeout(() => {
      cards[index].classList.remove('bounce');
    }, 500);
  }
}

function removeFromCart(index) {
  const removedItem = cart[index];
  cart.splice(index, 1);
  saveCart();
  renderCart();
  updateCartCount();
  showToast(`${removedItem.name} dihapus dari keranjang`, 'error');
}

function renderCart() {
  cartItems.innerHTML = '';
  if (cart.length === 0) {
    cartEmpty.style.display = 'block';
    totalPrice.innerText = 'Total: Rp 0';
    cartActions.classList.add('hidden');
    return;
  }
  
  cartEmpty.style.display = 'none';
  cartActions.classList.remove('hidden');
  
  let total = 0;
  cart.forEach((item, i) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">Rp ${item.price.toLocaleString()} x ${item.quantity || 1}</p>
      </div>
      <button class="remove-item" onclick="removeFromCart(${i})">
        <i class="fas fa-trash"></i>
      </button>
    `;
    cartItems.appendChild(li);
    total += parseInt(item.price) * (item.quantity || 1);
  });
  totalPrice.textContent = `Total: Rp ${total.toLocaleString()}`;
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  cartCount.textContent = count;
  floatingCartCount.textContent = count;
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  updateCartCount();
  showToast('Keranjang berhasil dikosongkan', 'success');
}

function checkout() {
  if (cart.length === 0) {
    showToast('Keranjang kosong, tidak bisa checkout', 'error');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (parseInt(item.price) * (item.quantity || 1)), 0);
  showToast(`Checkout berhasil! Total pembayaran: Rp ${total.toLocaleString()}`, 'success');
  
  // Save transaction history
  const transactions = JSON.parse(localStorage.getItem('transactions')) || [];
  transactions.push({
    date: new Date().toISOString(),
    items: [...cart],
    total: total
  });
  localStorage.setItem('transactions', JSON.stringify(transactions));
  
  // Clear cart
  clearCart();
  closeCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Cart Panel
function openCart() {
  cartPanel.classList.add('active');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartPanel.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Search
function searchProducts() {
  currentSearch = searchInput.value.trim();
  renderShopProducts();
}

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = '';
  if (type === 'success') {
    icon = '<i class="fas fa-check-circle"></i>';
    toast.style.backgroundColor = '#42b549';
  } else if (type === 'error') {
    icon = '<i class="fas fa-exclamation-circle"></i>';
    toast.style.backgroundColor = '#dc3545';
  }
  
  toast.innerHTML = `${icon} ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}

// Bounce Animation
const style = document.createElement('style');
style.textContent = `
  @keyframes bounce {
    0% { transform: scale(1); }
    30% { transform: scale(1.2); }
    60% { transform: scale(0.9); }
    100% { transform: scale(1); }
  }
  .bounce {
    animation: bounce 0.5s;
  }
`;
document.head.appendChild(style);
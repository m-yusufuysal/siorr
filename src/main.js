import './style.css'

document.querySelector('#app').innerHTML = `
  <!-- Top Bar -->
  <div class="top-bar">
    <div class="top-bar-content">
      <span class="top-bar-arrow">❮</span>
      <span>✨ Lifetime Stone Warranty ✨</span>
      <span class="top-bar-arrow">❯</span>
    </div>
  </div>

  <header>
    <div class="header-left">
      <div class="logo-container" id="header-logo" style="cursor: pointer;">
        <div class="sior-logo">
          <span class="logo-text">Sior</span>
          <span class="logo-subtitle">Elite Craftsmanship</span>
        </div>
      </div>
      <nav id="main-nav">
        <ul>
          <li><a href="#" data-view="home">Home</a></li>
          <li><a href="#" data-view="collection">Under 100 AED</a></li>
          <li><a href="#" data-view="Rings">Rings</a></li>
          <li><a href="#" data-view="Necklaces">Necklaces</a></li>
          <li><a href="#" data-view="Earrings">Earrings</a></li>
          <li><a href="#" data-view="Bracelets">Bracelets</a></li>
          <li><a href="#" data-view="contact">Contact</a></li>
        </ul>
      </nav>
    </div>

    <div class="header-right">
      <div class="search-container">
        <input type="text" id="inline-search" class="inline-search-input" placeholder="Search... ">
        <button id="search-btn" class="icon-btn" aria-label="Search">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
      </div>
      <div class="currency-selector" id="currency-selector">
        <span class="current-currency">USD</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>
        <div class="currency-dropdown">
          <div class="currency-option" data-value="AED">AED</div>
          <div class="currency-option" data-value="USD">USD</div>
          <div class="currency-option" data-value="EUR">EUR</div>
        </div>
      </div>
      <button id="cart-btn" class="icon-btn" aria-label="Cart">
        <div class="cart-icon-wrapper">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
          <span id="cart-count" class="cart-badge" style="display: none;">0</span>
        </div>
      </button>
      <button id="menu-toggle" class="icon-btn mobile-only" aria-label="Menu">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    </div>
  </header>

  <div class="discount-ribbon">
    <span>10% OFF!</span>
    <button class="ribbon-close">&times;</button>
  </div>

  <main id="main-content">
    <!-- Content dynamically injected here -->
  </main>

  <footer>
    <div class="footer-top">
      <div class="slogan">Stay in the Glow</div>
      <h2>Join the Insider List</h2>
      <p>Early launches, private flash deals & care tips — straight to your inbox.</p>
      <form class="insider-form">
        <input type="email" placeholder="E-mail" required>
        <button type="submit">SUBSCRIBE</button>
      </form>
    </div>
    <div class="footer-main">
      <div class="footer-col footer-promise">
        <h4>Our Promise</h4>
        <p>Bellorra creates lab-grown moissanite jewelry that rivals a diamond's fire, yet leaves the planet — and your wallet — at peace. Ethical. Attainable. Crafted to shine on you, always.</p>
        <a href="mailto:support@bellorra.com">support@bellorra.com</a>
      </div>
      <div class="footer-col">
        <h4>ABOUT</h4>
        <ul>
          <li><a href="#" id="contact-link-footer">Contact Us</a></li>
          <li><a href="#">FAQ</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>INFORMATION</h4>
        <ul>
          <li><a href="#">Shipping Info</a></li>
          <li><a href="#">Terms of Use</a></li>
          <li><a href="#">Privacy Policy</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>JEWELRY</h4>
        <ul>
          <li><a href="#" data-view="Rings" class="view-link">Rings</a></li>
          <li><a href="#" data-view="Necklaces" class="view-link">Necklaces</a></li>
          <li><a href="#" data-view="Earrings" class="view-link">Earrings</a></li>
          <li><a href="#" data-view="Bracelets" class="view-link">Bracelets</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="payment-icons">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa">
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Maestro">
        <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_Pay_logo.svg" alt="Apple Pay">
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Google_Pay_Logo.svg" alt="Google Pay">
      </div>
      <div class="copyright">
        &copy; ${new Date().getFullYear()} Sior Heritage Group. All Rights Reserved.
      </div>
    </div>
  </footer>

  <!-- Cart Modal -->
  <div id="cart-modal" class="modal-overlay">
    <div class="modal-content cart-modal-content">
      <div class="modal-header">
        <h2>Your Shopping Bag</h2>
        <span class="modal-close" data-target="cart-modal">&times;</span>
      </div>
      <div id="cart-items" class="cart-items-container">
        <!-- Cart Items Injected Here -->
        <div class="empty-cart-message">Your bag is empty.</div>
      </div>
      <div class="cart-footer">
        <div class="cart-total">
          <span>Total</span>
          <span id="cart-total-price">0 AED</span>
        </div>
        <button id="checkout-btn" class="btn-primary full-width">Proceed to Checkout</button>
      </div>
    </div>
  </div>

  <!-- Checkout Modal -->
  <div id="checkout-modal" class="modal-overlay">
    <div class="modal-content checkout-modal-content">
      <span class="modal-close" data-target="checkout-modal">&times;</span>
      <h2>Secure Checkout</h2>
      <form class="modal-form" id="checkout-form">
        <div class="form-group">
          <label>Contact Information</label>
          <input type="email" placeholder="Email Address" required>
        </div>
        <div class="form-group">
          <label>Shipping Address</label>
          <input type="text" placeholder="Full Name" required>
          <input type="text" placeholder="Address" required>
          <div class="form-row">
            <input type="text" placeholder="City" required>
            <input type="text" placeholder="Zip Code" required>
          </div>
        </div>
        <div class="form-group">
          <label>Payment Details</label>
          <div class="fake-card-input">
            <span class="icon">💳</span>
            <input type="text" placeholder="Card Number" required>
          </div>
          <div class="form-row">
            <input type="text" placeholder="MM/YY" required>
            <input type="text" placeholder="CVC" required>
          </div>
        </div>
        <button type="submit" class="btn-primary full-width">Pay Now <span id="checkout-btn-price"></span></button>
      </form>
    </div>
  </div>

  <!-- Appointment Modal -->
  <div id="appointment-modal" class="modal-overlay">
    <div class="modal-content">
      <span class="modal-close" data-target="appointment-modal">&times;</span>
      <h2>Boutique Appointment</h2>
      <p>Reserve your private viewing at our flagship boutique.</p>
      <form class="modal-form" id="appointment-form">
        <input type="text" placeholder="Full Name" required>
        <input type="email" placeholder="Email Address" required>
        <input type="tel" placeholder="Phone Number" required>
        <button type="submit">Request Appointment</button>
      </form>
    </div>
  </div>
`

// Product Data
const products = [
  { id: 1, name: 'Eternal Sparkle Ring', category: 'Rings', price: '18,500 AED', material: '18k White Gold | VVS Diamonds', image: '/ring.png', style: '' },
  { id: 2, name: 'Golden Dawn Solitaire', category: 'Rings', price: '22,400 AED', material: 'Rose Gold | Rare Pink Diamond', image: '/ring.png', style: '' },
  { id: 3, name: 'Midnight Noir Band', category: 'Rings', price: '9,800 AED', material: 'Black Gold | Polished Onyx', image: '/ring.png', style: '' },
  { id: 4, name: 'Celestial Halo Emerald', category: 'Rings', price: '28,900 AED', material: 'Platinum | Colombian Emerald', image: '/ring.png', style: '' },
  { id: 5, name: 'Elite Diamond Choker', category: 'Necklaces', price: '45,000 AED', material: 'Platinum | 5ct Round Diamonds', image: '/ring.png', style: '' },
  { id: 6, name: 'Royal Sapphire Pendant', category: 'Necklaces', price: '32,000 AED', material: '18k White Gold | Ceylon Sapphire', image: '/ring.png', style: '' },
  { id: 7, name: 'Masterpiece Chrono', category: 'Timepieces', price: '120,000 AED', material: 'Titanium | Diamond Bezel', image: '/ring.png', style: '' },
];

function renderProducts(category = 'All', targetId = 'product-grid') {
  const grid = document.getElementById(targetId) || document.querySelector('.product-grid');
  if (!grid) return;
  const filtered = category === 'All' ? products : products.filter(p => p.category === category);

  grid.innerHTML = filtered.map(p => `
    <div class="product-card reveal">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" style="${p.style}">
        <button class="quick-add-btn" data-id="${p.id}">ADD TO BAG</button>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.material}</p>
        <div class="product-price">${p.price}</div>
      </div>
    </div>
  `).join('');

  // Re-run animation observer for new elements
  initReveal();

  // Update product count if element exists
  const countEl = document.getElementById('product-count');
  if (countEl) countEl.textContent = filtered.length;
}

window.switchCategoryTab = (category, btn) => {
  // Update UI
  const tabs = btn.parentElement.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  // Render products
  renderProducts(category, 'home-category-grid');
};

window.navigateToCategory = (category) => {
  const tabBtn = document.querySelector(`.tab-btn[onclick*="${category}"]`);
  if (tabBtn) {
    tabBtn.click();
    setTimeout(() => {
      document.querySelector('.sparkle-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
};

// Initial Render
navigateToView('home');

// Navigation logic
function navigateToView(viewId) {
  const mainContent = document.getElementById('main-content');
  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewId === 'home') {
    mainContent.innerHTML = `
      <section class="hero" id="home">
        <div class="hero-bg"></div>
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <div class="hero-sior-logo">Sior</div>
          <p>The Epitome of Modern Prestige & Timeless Elegance</p>
        </div>
      </section>

      <section class="message-section">
        <h2>A Legacy of Fine Craftsmanship</h2>
        <p>Elevating the art of jewelry for generations. Defined by perfection, worn by legends.</p>
        <div style="margin-top: 30px;">
           <button class="btn-outline" style="border-color: #FDE8C4; color: #FDE8C4;" onclick="navigateToView('collection')">FIND YOUR PERFECT FIT</button>
        </div>
      </section>

      <section class="visual-categories">
        <div class="visual-category-card" onclick="navigateToCategory('Rings')">
          <img src="/rings-category.jpg" alt="Rings">
          <div class="category-overlay">
            <h3>Rings</h3>
          </div>
        </div>
        <div class="visual-category-card" onclick="navigateToCategory('Necklaces')">
          <img src="/necklaces-category.jpg" alt="Necklaces">
          <div class="category-overlay">
            <h3>Necklaces</h3>
          </div>
        </div>
        <div class="visual-category-card" onclick="navigateToCategory('Earrings')">
          <img src="/earrings-category.jpg" alt="Earrings">
          <div class="category-overlay">
            <h3>Earrings</h3>
          </div>
        </div>
        <div class="visual-category-card" onclick="navigateToCategory('Bracelets')">
          <img src="/bracelets-category.jpg" alt="Bracelets">
          <div class="category-overlay">
            <h3>Bracelets</h3>
          </div>
        </div>
      </section>

      <section class="sparkle-section">
        <div class="section-tagline">Four Ways to Shine, Which Will You Choose?</div>
        <div class="category-tabs">
          <button class="tab-btn active" onclick="switchCategoryTab('Rings', this)">Rings</button>
          <button class="tab-btn" onclick="switchCategoryTab('Bracelets', this)">Bracelets</button>
          <button class="tab-btn" onclick="switchCategoryTab('Earrings', this)">Earrings</button>
          <button class="tab-btn" onclick="switchCategoryTab('Necklaces', this)">Necklaces</button>
        </div>
        <div class="product-grid" id="home-category-grid">
          <!-- Dynamically loaded products -->
        </div>
        <div class="section-footer">
        </div>
      </section>

      <section class="sior-promise">
        <div class="promise-header">
           <div class="uncover-badge">UNCOVER THE BRILLIANCE</div>
           <h2>The Sior Promise</h2>
        </div>
        <div class="promise-grid">
          <div class="promise-item">
            <div class="promise-icon">↺</div>
            <h3>30-Day Easy Returns</h3>
          </div>
          <div class="promise-item">
            <div class="promise-icon">✈</div>
            <h3>Free Insured Express Shipping</h3>
          </div>
          <div class="promise-item">
            <div class="promise-icon">▤</div>
            <h3>GIA Authenticity Card</h3>
          </div>
          <div class="promise-item">
            <div class="promise-icon">💎</div>
            <h3>Lifetime Stone Warranty</h3>
          </div>
        </div>
        <div class="promise-banner">
          <p>Build the jewellery wardrobe you've always wanted: lab-grown brilliance that's kind to your budget and kinder to the Earth, so you can indulge in more than one piece—guilt-free.</p>
        </div>
      </section>

      <section class="bestsellers">
        <div class="section-tagline">Chosen by 2,000+ American women — yours next?</div>
        <h2>Bestsellers of the Week</h2>
        <div class="product-grid" id="bestsellers-grid">
           <!-- Bestsellers loaded here -->
        </div>
      </section>

      <section class="about" id="about">
        <div class="about-container">
          <div class="about-text">
            <h2>The Legacy of Sior</h2>
            <p>With over two decades of uncompromising dedication to the art of fine jewelry, Sior stands as a beacon of elite craftsmanship. Our journey began with a single vision: to create pieces that are not merely accessories, but living heirlooms of prestige.</p>
            <p>Every creation is a dialogue between artisan and gemstone, handcrafted in our private ateliers using only the most exceptional materials ethically sourced from across the globe.</p>
          </div>
          <div class="about-image"></div>
        </div>
      </section>
    `;
    renderProducts('Rings', 'home-category-grid');
    renderProducts('All', 'bestsellers-grid');
    initReveal();
  } else if (viewId === 'contact') {
    mainContent.innerHTML = `
      <section class="contact-page">
        <div class="contact-header">
          <h1>Connect with Our Concierge</h1>
          <p>Our advisors are ready to assist you with bespoke requests, sizing, and style consultations.</p>
        </div>
        <div class="contact-form-container">
          <form id="contact-form-main" class="luxury-form">
            <div class="form-row">
              <input type="text" placeholder="First Name" required>
              <input type="text" placeholder="Last Name" required>
            </div>
            <input type="email" placeholder="Email Address" required>
            <textarea placeholder="How can we assist you?" rows="5" required></textarea>
            <button type="submit" class="btn-primary">SEND MESSAGE</button>
          </form>
        </div>
      </section>
    `;
    document.getElementById('contact-form-main').addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you. We will be in touch shortly.');
    });
  } else {
    // Category Pages
    const displayCategory = viewId === 'collection' ? 'Elite Collection' : viewId;
    mainContent.innerHTML = `
      <section class="category-page">
        <div class="category-header">
          <h1 class="fade-in">${displayCategory}</h1>
          <div class="category-divider"></div>
        </div>
        <div class="category-filters">
           <div class="filter-count"><span id="product-count">0</span> Creations</div>
           <div class="filter-controls">
             <button class="filter-toggle">Sort By <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"></path></svg></button>
           </div>
        </div>
        <div class="product-grid" id="category-grid">
          <!-- Products will be rendered here -->
        </div>
      </section>
    `;
    const filterCat = viewId === 'collection' ? 'All' : viewId;
    renderProducts(filterCat, 'category-grid');
  }
}

// Interactivity logic
document.querySelectorAll('#main-nav a, .view-link').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const viewId = this.getAttribute('data-view');
    navigateToView(viewId);

    // Update active state in nav (if applicable)
    document.querySelectorAll('#main-nav a').forEach(a => a.classList.remove('active'));
    if (this.closest('#main-nav')) {
      this.classList.add('active');
    }
  });
});

// Footer Contact Link
document.addEventListener('click', (e) => {
  const logo = e.target.closest('#header-logo');
  if (logo) {
    e.preventDefault();
    navigateToView('home');
    return;
  }

  if (e.target.id === 'contact-link-footer') {
    e.preventDefault();
    navigateToView('contact');
  }
});

// Modal Logic
const modal = document.getElementById('appointment-modal');
const closeBtn = document.querySelector('.modal-close');
const appointmentBtns = ['appointment-btn', 'subscribe-btn'];

appointmentBtns.forEach(id => {
  const btn = document.getElementById(id);
  if (btn) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.classList.add('active');
    });
  }
});

closeBtn.addEventListener('click', () => modal.classList.remove('active'));
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

document.getElementById('appointment-form').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Thank you. A Sior concierge will contact you within 24 hours.');
  modal.classList.remove('active');
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('active');
    const isOpened = mainNav.classList.contains('active');
    menuToggle.innerHTML = isOpened
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
  });

  // Close menu when clicking links
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('active');
      menuToggle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });
  });
}

// Discount Ribbon Close
const ribbonClose = document.querySelector('.ribbon-close');
if (ribbonClose) {
  ribbonClose.addEventListener('click', () => {
    document.querySelector('.discount-ribbon').style.display = 'none';
  });
}

// Cart State
let cart = [];

function updateCartUI() {
  const cartCount = document.getElementById('cart-count');
  const cartItemsContainer = document.getElementById('cart-items');
  const totalPriceDisplay = document.getElementById('cart-total-price');

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = totalItems;
  cartCount.style.display = totalItems > 0 ? 'flex' : 'none';

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart-message">Your bag is empty.</div>';
    totalPriceDisplay.textContent = '0 AED';
    return;
  }

  cartItemsContainer.innerHTML = cart.map(item => {
    const p = products.find(prod => prod.id === item.id);
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-item-details">
          <h4>${p.name}</h4>
          <span class="cart-item-price">${p.price}</span>
          <div class="cart-controls">
            <div class="quantity-control">
              <button class="quantity-btn" onclick="updateQty(${item.id}, -1)">-</button>
              <span class="quantity-display">${item.quantity}</span>
              <button class="quantity-btn" onclick="updateQty(${item.id}, 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const total = cart.reduce((sum, item) => {
    const p = products.find(prod => prod.id === item.id);
    const priceNum = parseInt(p.price.replace(/[^0-9]/g, ''));
    return sum + (priceNum * item.quantity);
  }, 0);

  totalPriceDisplay.textContent = `${total.toLocaleString()} AED`;
}

window.updateQty = (id, delta) => {
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
    }
    updateCartUI();
  }
};

window.removeFromCart = (id) => {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
};

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('quick-add-btn')) {
    const id = parseInt(e.target.dataset.id);
    const product = products.find(p => p.id === id);
    if (product) {
      showProductDetail(product);
    }
  }
});

// Cart and Checkout Modal Logic
const cartModal = document.getElementById('cart-modal');
const cartBtn = document.getElementById('cart-btn');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutBtn = document.getElementById('checkout-btn');

if (cartBtn) cartBtn.addEventListener('click', () => cartModal.classList.add('active'));
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    cartModal.classList.remove('active');
    checkoutModal.classList.add('active');
  });
}

document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    document.getElementById(target).classList.remove('active');
  });
});

// Category Filtering
const categoryMap = {
  'All Creations': 'All',
  'Boutique Rings': 'Rings',
  'Elite Necklaces': 'Necklaces',
  'Diamond Timepieces': 'Timepieces',
  'Masterpiece Sets': 'Sets'
};

document.querySelectorAll('.category-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.category-nav a').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    renderProducts(categoryMap[link.innerText] || 'All');
  });
});

// Initial Render removed from here as it's now inside navigateToView call chain

// Reveal on Scroll
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));
}

// Parallax Effect
window.addEventListener('scroll', () => {
  const scrolled = window.pageYOffset;
  const parallaxImgs = document.querySelectorAll('.parallax-img');
  parallaxImgs.forEach(img => {
    const speed = 0.4;
    img.style.transform = `translateY(${scrolled * speed}px)`;
  });
});

initReveal();

// Header scroll behavior
let lastScrollY = window.scrollY;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > 100) {
    header.classList.add('header-scrolled');
  } else {
    header.classList.remove('header-scrolled');
  }

  if (currentScrollY > lastScrollY && currentScrollY > 200) {
    // Scrolling down
    header.classList.add('header-hidden');
  } else {
    // Scrolling up or at top
    header.classList.remove('header-hidden');
  }

  lastScrollY = currentScrollY;
});

// Currency Selector Logic
const currencySelector = document.getElementById('currency-selector');
const currentCurrencySpan = currencySelector.querySelector('.current-currency');

currencySelector.addEventListener('click', (e) => {
  currencySelector.classList.toggle('active');

  if (e.target.classList.contains('currency-option')) {
    const newVal = e.target.dataset.value;
    currentCurrencySpan.textContent = newVal;
    currencySelector.classList.remove('active');
    // Here you could update prices based on exchange rates
  }
});

document.addEventListener('click', (e) => {
  if (!currencySelector.contains(e.target)) {
    currencySelector.classList.remove('active');
  }
});

// Search functionality
const searchBtn = document.getElementById('search-btn');
const inlineSearch = document.getElementById('inline-search');

searchBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  inlineSearch.classList.toggle('active');
  if (inlineSearch.classList.contains('active')) {
    inlineSearch.focus();
  }
});

inlineSearch.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const query = inlineSearch.value;
    if (query) {
      alert(`Searching for: ${query}`);
      inlineSearch.classList.remove('active');
      inlineSearch.value = '';
    }
  }
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    inlineSearch.classList.remove('active');
  }
});

// Product detail selection UI logic
// We will replace the quick-add behavior with a detail modal
document.addEventListener('click', (e) => {
  const productCard = e.target.closest('.product-card');
  if (productCard && !e.target.classList.contains('quick-add-btn')) {
    const productId = productCard.querySelector('.quick-add-btn').dataset.id;
    const product = products.find(p => p.id == productId);
    showProductDetail(product);
  }
});

function showProductDetail(product) {
  // Create a detail modal on the fly or reuse one
  let detailModal = document.getElementById('product-detail-modal');
  if (!detailModal) {
    detailModal = document.createElement('div');
    detailModal.id = 'product-detail-modal';
    detailModal.className = 'modal-overlay';
    document.body.appendChild(detailModal);
  }

  detailModal.innerHTML = `
    <div class="modal-content product-detail-content">
      <span class="modal-close" onclick="document.getElementById('product-detail-modal').classList.remove('active')">&times;</span>
      <div class="detail-grid">
        <div class="detail-image">
          <img src="${product.image}" alt="${product.name}" style="${product.style}">
        </div>
        <div class="detail-info">
          <h2>${product.name}</h2>
          <div class="detail-price">${product.price}</div>
          <p class="detail-description">${product.material}. A masterpiece of elite craftsmanship, designed for those who define excellence.</p>
          
          <div class="selection-group">
            <label>Ring Size</label>
            <div class="size-options">
              ${[5, 5.5, 6, 6.5, 7, 7.5, 8].map(s => `<button class="option-btn">${s}</button>`).join('')}
            </div>
          </div>

          <div class="selection-group">
            <label>Material</label>
            <div class="material-options">
              <button class="option-btn active">18K White Gold</button>
              <button class="option-btn">Platinum</button>
              <button class="option-btn">Rose Gold</button>
            </div>
          </div>

          <div class="detail-actions">
            <button class="btn-primary" onclick="addToBagFromDetail(${product.id})">ADD TO BAG</button>
            <button class="btn-primary buy-now" onclick="buyItNow(${product.id})">BUY IT NOW</button>
          </div>
        </div>
      </div>
    </div>
  `;

  detailModal.classList.add('active');

  // Add option button logic
  detailModal.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      this.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

window.addToBagFromDetail = (id) => {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }
  updateCartUI();
  document.getElementById('product-detail-modal').classList.remove('active');
  document.getElementById('cart-modal').classList.add('active');
};

window.buyItNow = (id) => {
  addToBagFromDetail(id);
  document.getElementById('cart-modal').classList.remove('active');
  document.getElementById('checkout-modal').classList.add('active');
};

import './style.css'
import { createClient } from '@supabase/supabase-js'

// Supabase Initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Base URL for assets
const BASE_URL = import.meta.env.BASE_URL;

function getAssetPath(path) {
  return path.startsWith('/') ? BASE_URL + path.slice(1) : BASE_URL + path;
}

// Global state for products (will be fetched from Supabase later)
let productsState = [];

// Affiliate Tracking Logic
function initAffiliateTracking() {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref) {
    localStorage.setItem('sior_ref', ref);
    console.log('Affiliate reference captured:', ref);
    // Remove ref from URL to keep it clean
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

initAffiliateTracking();

// Visitor Analytics Logic
// Visitor Analytics Logic
async function trackVisitor() {
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  let sessionId = localStorage.getItem('sior_session_id');
  let lastSeen = parseInt(localStorage.getItem('sior_last_seen') || '0');
  const now = Date.now();
  const ref = localStorage.getItem('sior_ref') || 'direct';

  // Create new session if expired or doesn't exist
  if (!sessionId || (now - lastSeen > SESSION_TIMEOUT)) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('sior_session_id', sessionId);

    let visitorData = {
      session_id: sessionId,
      device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      browser: navigator.userAgent,
      landing_page: window.location.href,
      referrer: document.referrer || 'direct',
      affiliate_code: ref !== 'direct' ? ref : null
    };

    try {
      // Fetch location data (optional, but nice)
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        visitorData.ip_address = data.ip;
        visitorData.country = data.country_name;
        visitorData.city = data.city;
      }
    } catch (err) {
      console.warn('Location data fetch failed, proceeding with basic tracking:', err);
    }

    try {
      // Always log the session even if location data failed
      await supabase.from('analytics_sessions').insert([visitorData]);
    } catch (err) {
      console.error('Session record insertion failed:', err);
    }
  }

  // Update last seen
  localStorage.setItem('sior_last_seen', now.toString());

  // Log page view
  try {
    await supabase.from('analytics_page_views').insert([{
      session_id: sessionId,
      page_url: window.location.href,
      page_title: document.title,
      referrer_url: document.referrer
    }]);

    // Also update legacy traffic logs for backward compatibility if needed
    // or just leave it out to switch purely to new system. 
    // Keeping legacy for now to not break existing charts immediately:
    /*
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    await supabase.from('traffic_logs').insert([{
        page_url: window.location.href,
        country: data.country_name,
        city: data.city,
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        affiliate_ref: ref
    }]);
    */
  } catch (err) {
    console.error('Page view tracking failed:', err);
  }
}

trackVisitor();

// Initial Render & Routing Logic
function initApp() {
  initAffiliateTracking();

  // Real-time Product Synchronization
  supabase
    .channel('products-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
      console.log('Real-time product update received:', payload);
      // If we are in the admin dashboard, refresh the list
      const adminProductList = document.getElementById('admin-product-list');
      if (adminProductList) {
        renderAdminProducts();
      }

      // Refresh any active product grid on the public site
      const activeGrid = document.querySelector('.product-grid');
      if (activeGrid) {
        // If it's a category page, try to keep the category filter
        const categoryHeader = document.querySelector('.category-header h1');
        const filterCat = categoryHeader ? categoryHeader.textContent : 'All';
        renderProducts(filterCat === 'Elite Collection' ? 'All' : filterCat, activeGrid.id || 'category-grid');
      }
    })
    .subscribe();

  // Handle /admin routing
  const path = window.location.pathname;
  if (path.endsWith('/admin') || window.location.hash === '#admin') {
    navigateToView('admin-login');
  } else {
    navigateToView('home');
  }

  // Listen for hash changes
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') navigateToView('admin-login');
  });
}

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
        <div class="menu-close-header mobile-only">
          <button class="menu-close-btn" id="menu-close">&times;</button>
        </div>
        <ul>
          <li><a href="#" data-view="home">Home</a></li>
          <!-- Under 100 AED removed as requested -->
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
        <span class="current-currency">AED</span>
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
        <p>Sior creates lab-grown moissanite jewelry that rivals a diamond's fire, yet leaves the planet — and your wallet — at peace. Ethical. Attainable. Crafted to shine on you, always.</p>
        <a href="mailto:support@siorjewellery.com">siorjewellery</a>
      </div>
      <div class="footer-col">
        <h4>ABOUT</h4>
        <ul>
          <li><a href="#" id="contact-link-footer">Contact Us</a></li>
          <li><a href="#" data-view="faq" class="view-link">FAQ</a></li>
          <li><a href="#" data-view="shipping" class="view-link">Shipping</a></li>
          <li><a href="#" data-view="privacy" class="view-link">Privacy Policy</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>FOLLOW US</h4>
        <div class="social-links">
          <a href="https://instagram.com/siorjewellery" target="_blank" title="Instagram">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="https://tiktok.com/@siorjewellery" target="_blank" title="TikTok">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          </a>
        </div>
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

  <!-- Info Modal for Legal/FAQ -->
  <div id="info-modal" class="modal-overlay">
    <div class="modal-content legal-modal-content">
      <span class="modal-close" data-target="info-modal">&times;</span>
      <div id="info-modal-body"></div>
    </div>
  </div>
`;

initApp();

// Checkout Form Submission with Affiliate Tracking & Supabase Persistence
document.addEventListener('submit', async (e) => {
  if (e.target.id === 'checkout-form') {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    const ref = localStorage.getItem('sior_ref');
    const customerEmail = e.target.querySelector('input[type="email"]').value;
    const totalPrice = document.getElementById('checkout-btn-price').textContent;

    const { data, error } = await supabase.from('orders').insert([{
      customer_email: customerEmail,
      total_price: totalPrice,
      affiliate_ref: ref || 'direct',
      items: cart.map(item => {
        const p = productsState.find(prod => prod.id === item.id);
        return { name: p.name, quantity: item.quantity, price: p.price };
      })
    }]);

    if (error) {
      alert('Checkout Failed: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay Now';
    } else {
      // Simulate Order Success Notification & Email
      console.log(`[SIMULATED EMAIL SENT TO ${customerEmail}]`);
      console.log(`Subject: Your Sior Elite Order Confirmation (#${Date.now().toString().slice(-6)})`);
      console.log(`Content: Thank you for your purchase of ${totalPrice}. Your items are being prepared for express delivery.`);

      alert(`✨ Order Placed Successfully!\n\nA confirmation email has been sent to ${customerEmail}.\nTotal: ${totalPrice}\nRef: ${ref || 'direct'}\n\nThank you for choosing Sior.`);

      cart = [];
      updateCartUI();
      document.getElementById('checkout-modal').classList.remove('active');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay Now';
    }
  }
});

// Initial Product Data
productsState = [
  { id: 1, name: 'Eternal Sparkle Ring', category: 'Rings', price: '18,500 AED', material: '18k White Gold | VVS Diamonds', image: getAssetPath('/ring.png'), style: '' },
  { id: 2, name: 'Golden Dawn Solitaire', category: 'Rings', price: '22,400 AED', material: 'Rose Gold | Rare Pink Diamond', image: getAssetPath('/ring.png'), style: '' },
  { id: 3, name: 'Midnight Noir Band', category: 'Rings', price: '9,800 AED', material: 'Black Gold | Polished Onyx', image: getAssetPath('/ring.png'), style: '' },
  { id: 4, name: 'Celestial Halo Emerald', category: 'Rings', price: '28,900 AED', material: 'Platinum | Colombian Emerald', image: getAssetPath('/ring.png'), style: '' },
  { id: 5, name: 'Elite Diamond Choker', category: 'Necklaces', price: '45,000 AED', material: 'Platinum | 5ct Round Diamonds', image: getAssetPath('/ring.png'), style: '' },
  { id: 6, name: 'Royal Sapphire Pendant', category: 'Necklaces', price: '32,000 AED', material: '18k White Gold | Ceylon Sapphire', image: getAssetPath('/ring.png'), style: '' },
  { id: 7, name: 'Masterpiece Chrono', category: 'Timepieces', price: '120,000 AED', material: 'Titanium | Diamond Bezel', image: getAssetPath('/ring.png'), style: '' },
];

// Helper to format currency elegantly
function formatCurrency(amount) {
  const numericPrice = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, "")) : amount;
  if (isNaN(numericPrice)) return amount;
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0
  }).format(numericPrice);
}

async function renderProducts(category = 'All', targetId = 'product-grid') {
  const grid = document.getElementById(targetId) || document.querySelector('.product-grid');
  if (!grid) return;

  // Elite Skeleton Loaders
  grid.innerHTML = Array(4).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton-shimmer"></div>
    </div>
  `).join('');

  let query = supabase.from('products').select('*').eq('status', 'active').order('id', { ascending: false });
  if (category !== 'All') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    grid.innerHTML = '<div class="error">The vault is temporarily unavailable.</div>';
    return;
  }

  productsState = data.map(p => {
    let img = '/ring.png';
    let imgList = p.image_url;

    // Handle potential stringified JSON if database hasn't fully migrated type
    if (typeof imgList === 'string' && (imgList.startsWith('[') || imgList.startsWith('{'))) {
      try {
        imgList = JSON.parse(imgList);
      } catch (e) {
        console.warn('Failed to parse image_url string:', imgList);
      }
    }

    if (imgList) {
      if (Array.isArray(imgList)) {
        img = imgList[0] || '/ring.png';
      } else {
        img = imgList;
      }
    }
    return {
      ...p,
      image: img.startsWith('http') || img.startsWith('data') ? img : getAssetPath(img)
    };
  });

  grid.innerHTML = productsState.map(p => `
    <div class="product-card reveal">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}" 
             onerror="this.src='${getAssetPath('/ring.png')}'; this.style.mixBlendMode='normal';"
             style="${p.style || ''}" 
             loading="lazy">
        <button class="quick-add-btn" data-id="${p.id}">ADD TO BAG</button>
      </div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <p>${p.material || 'Fine Jewelry'}</p>
        <div class="product-price">${formatCurrency(p.price)}</div>
      </div>
    </div>
  `).join('');

  if (typeof initReveal === 'function') initReveal();
  const countEl = document.getElementById('product-count');
  if (countEl) countEl.textContent = productsState.length;
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
  // If we are on home, we can scroll to the category grid if it exists, 
  // but better to navigate specifically to the collection view
  navigateToView(category);
};



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
        <div class="visual-category-card" onclick="window.navigateToView('Rings')">
          <img src="${getAssetPath('/rings-category.jpg')}" alt="Rings">
          <div class="category-overlay">
            <h3>Rings</h3>
          </div>
        </div>
        <div class="visual-category-card" onclick="window.navigateToView('Necklaces')">
          <img src="${getAssetPath('/necklaces-category.jpg')}" alt="Necklaces">
          <div class="category-overlay">
            <h3>Necklaces</h3>
          </div>
        </div>
        <div class="visual-category-card" onclick="window.navigateToView('Earrings')">
          <img src="${getAssetPath('/earrings-category.jpg')}" alt="Earrings">
          <div class="category-overlay">
            <h3>Earrings</h3>
          </div>
        </div>
        <div class="visual-category-card" onclick="window.navigateToView('Bracelets')">
          <img src="${getAssetPath('/bracelets-category.jpg')}" alt="Bracelets">
          <div class="category-overlay">
            <h3>Bracelets</h3>
          </div>
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
    initReveal();
    initReveal();
  } else if (viewId === 'faq') {
    mainContent.innerHTML = `
      <section class="legal-page">
        <h1>Frequently Asked Questions</h1>
        <div class="faq-accordion">
          <div class="faq-item">
            <h3>How do I know my ring size?</h3>
            <p>Sior offers a complimentary physical ring sizer sent to your doorstep. Alternatively, you can visit our "Size Guide" or use our virtual concierge service for precise measurements.</p>
          </div>
          <div class="faq-item">
            <h3>Do you offer custom designs?</h3>
            <p>Yes, our Masterpiece Atelier specializes in bespoke creations. From selecting the perfect stone to the final hand-polished setting, we bring your vision to life.</p>
          </div>
          <div class="faq-item">
            <h3>What is Moissanite?</h3>
            <p>Moissanite is a rare, naturally occurring mineral that we masterfully recreate in labs. It possesses more fire and brilliance than a diamond and is exceptionally durable for daily wear.</p>
          </div>
          <div class="faq-item">
            <h3>Is Sior jewelry ethically sourced and certified?</h3>
            <p>Absolutely. Every Sior masterpiece is crafted using lab-grown moissanite and recycled noble metals, ensuring a conflict-free and environmentally conscious legacy. Each piece is accompanied by a GIA or Sior Authenticity Card, guaranteeing the uncompromising quality and provenance of your selection.</p>
          </div>
          <div class="faq-item">
            <h3>Can I visit a boutique?</h3>
            <p>We operate exclusive private viewing suites in Dubai, London, and New York. Appointments can be requested through our "Boutique Appointment" modal.</p>
          </div>
          <div class="faq-item">
            <h3>What is your warranty?</h3>
            <p>Every Sior piece comes with a Lifetime Stone Warranty and a 2-year manufacturing guarantee. We stand behind the elite quality of our craftsmanship.</p>
          </div>
        </div>
      </section>
    `;
  } else if (viewId === 'privacy') {
    mainContent.innerHTML = `
      <section class="legal-page">
        <h1>Privacy & Data Security</h1>
        <div class="legal-content">
          <p>Your trust is our most valued asset. Sior Heritage Group is committed to maintaining the highest standards of data protection and privacy for our global clientele.</p>
          
          <h3>1. Data Encryption</h3>
          <p>All transactions are processed through AES-256 bit encryption, the industry standard for financial security. We do not store sensitive payment information on our servers.</p>
          
          <h3>2. Collection of Information</h3>
          <p>We collect essential data to fulfill your orders and enhance your elite shopping experience, including your contact details, shipping preferences, and purchase history.</p>
          
          <h3>3. Private Concierge Data</h3>
          <p>Communications with our bespoke advisors are kept strictly confidential and are used solely to provide personalized service and advice.</p>
          
          <h3>4. International Standards</h3>
          <p>We comply with GDPR and other international privacy frameworks to ensure your rights are protected wherever you are in the world.</p>
        </div>
      </section>
    `;
  } else if (viewId === 'shipping') {
    mainContent.innerHTML = `
      <section class="legal-page">
        <h1>Bespoke Delivery & Logistics</h1>
        <div class="legal-content">
          <p>Sior ensures that every piece reaches you with the same level of care and precision with which it was crafted.</p>
          
          <h3>Complimentary Express Shipping</h3>
          <p>We offer worldwide, fully insured express delivery on every order. Our logistics partners include specialized luxury couriers to ensure maximum security.</p>
          
          <h3>Lead Times</h3>
          <ul>
            <li><strong>Ready-to-Wear:</strong> Dispatched within 24 hours.</li>
            <li><strong>Made-to-Order:</strong> Requires 7-14 business days for artisanal crafting.</li>
            <li><strong>Bespoke Creations:</strong> Timeline provided during consultation.</li>
          </ul>
          
          <h3>Customs & Duties</h3>
          <p>For our international clients, Sior pre-calculates and handles all import duties to ensure a seamless "white-glove" delivery experience to your doorstep.</p>
        </div>
      </section>
    `;
  } else if (viewId === 'terms') {
    mainContent.innerHTML = `
      <section class="legal-page">
        <h1>Terms of Exclusive Engagement</h1>
        <div class="legal-content">
          <p>By engaging with the Sior digital boutique, you agree to our terms of service, designed to protect the integrity of our brand and the satisfaction of our clients.</p>
          
          <h3>Authenticity Guarantee</h3>
          <p>All items sold are guaranteed authentic Sior creations. Every piece is accompanied by a unique digital certificate of authenticity and a GIA/IGI grading report where applicable.</p>
          
          <h3>Investment & Valuation</h3>
          <p>Prices listed reflect the current market value of materials and artistry. Sior reserves the right to adjust pricing based on global commodity fluctuations.</p>
          
          <h3>Use of Brand Assets</h3>
          <p>All imagery, descriptions, and designs are protected by international intellectual property laws. Unauthorized reproduction is strictly prohibited.</p>
          
          <h3>Dispute Resolution</h3>
          <p>We strive for perfection in every interaction. In the rare event of a dispute, our concierge team is empowered to find an equitable solution for our clients.</p>
        </div>
      </section>
    `;
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
  } else if (viewId === 'admin-login') {
    mainContent.innerHTML = `
      <section class="admin-login-page">
        <div class="contact-header">
          <h1>Yönetici Erişimi</h1>
          <p>Koleksiyonu yönetmek için lütfen şifrenizi girin.</p>
        </div>
        <div class="contact-form-container">
          <form id="admin-login-form" class="luxury-form">
            <input type="password" id="admin-password" placeholder="Yönetici Şifresi" required>
            <button type="submit" class="btn-primary">GİRİŞ YAP</button>
          </form>
        </div>
      </section>
    `;
    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('admin-password').value;
      if (pass === 'sior2026') { // Mock password
        localStorage.setItem('sior_admin', 'true');
        navigateToView('admin-dashboard');
      } else {
        alert('Geçersiz şifre.');
      }
    });
  } else if (viewId === 'admin-dashboard') {
    if (localStorage.getItem('sior_admin') !== 'true') return navigateToView('admin-login');

    // Admin Dashboard Shell
    document.getElementById('app').innerHTML = `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="sidebar-logo">
          <div class="logo-text">Sior</div>
          <div class="logo-subtitle">Elite Craftsmanship</div>
        </div>
        <nav class="sidebar-nav">
          <div class="sidebar-section">
            <div class="sidebar-label">Yönetim</div>
            <a href="#" class="sidebar-link active" data-tab="overview">
               <span class="icon">📊</span> Genel Bakış
            </a>
            <a href="#" class="sidebar-link" data-tab="products">
               <span class="icon">💍</span> Ürünler
            </a>
            <a href="#" class="sidebar-link" data-tab="orders">
               <span class="icon">📦</span> Siparişler
            </a>
            <a href="#" class="sidebar-link" data-tab="customers">
               <span class="icon">👥</span> Müşteriler
            </a>
          </div>
          
          <div class="sidebar-section">
             <div class="sidebar-label">Pazarlama ve Büyüme</div>
             <a href="#" class="sidebar-link" data-tab="analytics">
                <span class="icon">📈</span> Analizler
             </a>
             <a href="#" class="sidebar-link" data-tab="affiliates">
                <span class="icon">🤝</span> İş Ortakları
             </a>
             <a href="#" class="sidebar-link" data-tab="campaigns">
                <span class="icon">📢</span> Kampanyalar
             </a>
          </div>
          
          <div class="sidebar-section">
             <div class="sidebar-label">Sistem Ayarları</div>
             <a href="#" class="sidebar-link" data-tab="settings">
                <span class="icon">⚙️</span> Ayarlar
             </a>
             <a href="/" class="sidebar-link" target="_blank">
                <span class="icon">🏠</span> Mağazayı Gör
             </a>
             <a href="#" class="sidebar-link logout" onclick="logoutAdmin()">
                <span class="icon">🚪</span> Çıkış Yap
             </a>
          </div>
        </nav>
      </aside>
      <main class="admin-main-panel">
        <header class="admin-panel-header">
          <h1 id="admin-tab-title">Dashboard Overview</h1>
          <div id="admin-header-actions"></div>
        </header>
        <div class="admin-panel-content" id="admin-main-content">
          <!-- Content injected here -->
        </div>
      </main>
    </div>
  `;

    // Initialize Sidebar Tabs
    initAdminTabs();
    loadDashboardTab('overview');
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

window.navigateToView = navigateToView;

// Modal system for Information/Legal pages
window.openInfoModal = (type) => {
  const modal = document.getElementById('info-modal');
  const body = document.getElementById('info-modal-body');

  const content = {
    faq: `
      <h1>Frequently Asked Questions</h1>
      <div class="faq-accordion">
        <div class="faq-item">
          <h3>How do I know my ring size?</h3>
          <p>Sior offers a complimentary physical ring sizer sent to your doorstep. Alternatively, you can visit our "Size Guide" or use our virtual concierge service.</p>
        </div>
        <div class="faq-item">
          <h3>Do you offer custom designs?</h3>
          <p>Yes, our Masterpiece Atelier specializes in bespoke creations. From selecting the perfect stone to the final hand-polished setting.</p>
        </div>
        <div class="faq-item">
          <h3>What is Moissanite?</h3>
          <p>Moissanite is a rare, naturally occurring mineral that we masterfully recreate in labs. It possesses more fire and brilliance than a diamond.</p>
        </div>
        <div class="faq-item">
          <h3>Is Sior jewelry ethically sourced and certified?</h3>
          <p>Absolutely. Every Sior masterpiece is crafted using lab-grown moissanite and recycled noble metals, ensuring a conflict-free and environmentally conscious legacy. Each piece is accompanied by a GIA or Sior Authenticity Card, guaranteeing the uncompromising quality and provenance of your selection.</p>
        </div>
        <div class="faq-item">
          <h3>What is your warranty?</h3>
          <p>Every Sior piece comes with a Lifetime Stone Warranty and a 2-year manufacturing guarantee.</p>
        </div>
      </div>
    `,
    shipping: `
      <h1>Bespoke Delivery & Logistics</h1>
      <div class="legal-content">
        <p>Sior ensures that every piece reaches you with the same level of care and precision with which it was crafted.</p>
        <h3>Complimentary Express Shipping</h3>
        <p>We offer worldwide, fully insured express delivery on every order via specialized luxury couriers.</p>
        <h3>Lead Times</h3>
        <ul>
          <li><strong>Ready-to-Wear:</strong> Dispatched within 24 hours.</li>
          <li><strong>Made-to-Order:</strong> Requires 7-14 business days.</li>
        </ul>
      </div>
    `,
    terms: `
      <h1>Terms of Exclusive Engagement</h1>
      <div class="legal-content">
        <p>By engaging with Sior, you agree to our terms of service, designed to protect the integrity of our brand and your satisfaction.</p>
        <h3>Authenticity Guarantee</h3>
        <p>All items sold are guaranteed authentic Sior creations, accompanied by a grading report where applicable.</p>
        <h3>Investment & Valuation</h3>
        <p>Prices reflect the current market value of materials and Sior artistry.</p>
      </div>
    `,
    privacy: `
      <h1>Privacy & Data Security</h1>
      <div class="legal-content">
        <p>Your trust is our most valued asset. Sior Heritage Group is committed to protecting your privacy.</p>
        <h3>Data Encryption</h3>
        <p>All transactions are processed through AES-256 bit encryption, the industry standard for financial security.</p>
        <h3>Collection of Information</h3>
        <p>We collect essential data only to fulfill your orders and enhance your elite shopping experience.</p>
      </div>
    `
  };

  body.innerHTML = content[type] || 'Content not found.';
  modal.classList.add('active');
};

// Interactivity logic
document.querySelectorAll('#main-nav a, .view-link, .modal-link').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const viewId = this.getAttribute('data-view');

    // Check if it should open in a modal
    const modalTypes = ['faq', 'shipping', 'terms', 'privacy'];
    if (modalTypes.includes(viewId)) {
      window.openInfoModal(viewId);
    } else {
      navigateToView(viewId);
    }

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

// Generalized Modal Logic
document.querySelectorAll('.modal-close').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-target');
    if (target) {
      document.getElementById(target).classList.remove('active');
    }
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

// Mobile Menu Toggle
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const menuClose = document.getElementById('menu-close');

// Create overlay if not exists
let overlay = document.querySelector('.menu-overlay');
if (!overlay) {
  overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  document.body.appendChild(overlay);
}

function toggleMobileMenu(forceClose = false) {
  const isOpened = mainNav.classList.contains('active');
  if (forceClose || isOpened) {
    mainNav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  } else {
    mainNav.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => toggleMobileMenu());
}

if (menuClose) {
  menuClose.addEventListener('click', () => toggleMobileMenu(true));
}

if (overlay) {
  overlay.addEventListener('click', () => toggleMobileMenu(true));
}

// Close menu when clicking links
if (mainNav) {
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMobileMenu(true));
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
    const p = productsState.find(prod => prod.id === item.id);
    return `
      < div class="cart-item" >
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
    const p = productsState.find(prod => prod.id === item.id);
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
    const product = productsState.find(p => p.id === id);
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
      alert(`Searching for: ${query} `);
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
    const product = productsState.find(p => p.id == productId);
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
      < div class="modal-content product-detail-content" >
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
    </div >
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

// Admin Functions & Dashboard Logic
window.logoutAdmin = () => {
  localStorage.removeItem('sior_admin');
  window.location.hash = '';
  navigateToView('home');
};

function initAdminTabs() {
  const tabs = document.querySelectorAll('.sidebar-link[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      loadDashboardTab(tabId);
    });
  });
}

async function loadDashboardTab(tabId) {
  const container = document.getElementById('admin-main-content');
  const title = document.getElementById('admin-tab-title');
  const actions = document.getElementById('admin-header-actions');
  if (!container || !title || !actions) return;

  actions.innerHTML = '';
  container.innerHTML = '<div class="loading">Yükleniyor...</div>';

  if (tabId === 'overview') {
    title.textContent = 'Mağaza Verileri';
    const { data: orders } = await supabase.from('orders').select('*');
    const { count: totalVisits } = await supabase.from('analytics_sessions').select('*', { count: 'exact', head: true });
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: activeUsers } = await supabase.from('analytics_sessions').select('*', { count: 'exact', head: true }).gt('created_at', fiveMinutesAgo);

    const totalSales = orders?.reduce((acc, curr) => acc + parseInt((curr.total_price || '0').replace(/[^0-9]/g, '')), 0) || 0;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Toplam Gelir</div>
          <div class="stat-value">${totalSales.toLocaleString()} AED</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Toplam Sipariş</div>
          <div class="stat-value">${orders?.length || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Şu An Aktif</div>
          <div class="stat-value live-pulse" id="stat-active-users">${activeUsers || 0}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Toplam Ziyaret</div>
          <div class="stat-value" id="stat-total-visits">${totalVisits || 0}</div>
        </div>
      </div>
      <div class="recent-section">
        <h3>Anlık Aktivite</h3>
        <p id="rt-activity-log">Trafik kaynakları izleniyor...</p>
      </div>
    `;

    if (window.analyticsSubscription) supabase.removeChannel(window.analyticsSubscription);
    window.analyticsSubscription = supabase
      .channel('admin-analytics')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analytics_sessions' }, async (payload) => {
        const { count: freshVisits } = await supabase.from('analytics_sessions').select('*', { count: 'exact', head: true });
        const activeEl = document.getElementById('stat-active-users');
        const totalEl = document.getElementById('stat-total-visits');
        const logEl = document.getElementById('rt-activity-log');

        if (totalEl) totalEl.textContent = freshVisits;
        if (logEl) {
          logEl.innerHTML = `<strong>${payload.new.country || 'Bilinmeyen'}</strong> konumundan yeni bir ziyaretçi geldi!`;
          setTimeout(() => { if (logEl) logEl.innerHTML = 'Trafik izleniyor...'; }, 5000);
        }
      })
      .subscribe();

  } else if (tabId === 'products') {
    title.textContent = 'Koleksiyon Yöneticisi';
    actions.innerHTML = `<button class="btn-add" onclick="window.openAddProductModal()">+ Ürün Ekle</button>`;
    container.innerHTML = `
      <div class="product-filters-row">
        <select id="filter-category" onchange="filterProducts()">
          <option value="">Tüm Kategoriler</option>
          <option value="Rings">Yüzükler</option>
          <option value="Necklaces">Kolyeler</option>
          <option value="Earrings">Küpeler</option>
          <option value="Bracelets">Bileklikler</option>
          <option value="Elite Collection">Elite Koleksiyonu</option>
        </select>
        <select id="filter-status" onchange="filterProducts()">
          <option value="">Tüm Durumlar</option>
          <option value="active">Aktif</option>
          <option value="draft">Taslak</option>
        </select>
        <input type="search" id="product-search" placeholder="SKU veya isim ara..." oninput="filterProducts()">
      </div>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr><th>Ürün</th><th>Kategori</th><th>Tür</th><th>Fiyat</th><th>Durum</th><th>İşlemler</th></tr>
          </thead>
          <tbody id="admin-product-list"></tbody>
        </table>
      </div>
    `;
    renderAdminProducts();

  } else if (tabId === 'orders') {
    title.textContent = 'Sipariş Yönetimi';
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    container.innerHTML = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr><th>Sipariş No</th><th>Müşteri</th><th>Toplam</th><th>Durum</th><th>Tarih</th><th>İşlemler</th></tr>
          </thead>
          <tbody>
            ${data?.map(o => `
              <tr>
                <td>#${o.id}</td>
                <td>${o.customer_email}</td>
                <td>${o.total_price}</td>
                <td><span class="status-pill ${o.status}">${o.status}</span></td>
                <td>${new Date(o.created_at).toLocaleDateString('tr-TR')}</td>
                <td><button class="action-btn-sm" onclick="window.viewOrder(${o.id})">Detaylar</button></td>
              </tr>
            `).join('') || '<tr><td colspan="6">Henüz sipariş yok.</td></tr>'}
          </tbody>
        </table>
      </div>
      `;

  } else if (tabId === 'analytics') {
    title.textContent = 'Trafik ve Hedef Kitle';
    const { data: sessions } = await supabase.from('analytics_sessions').select('*').order('created_at', { ascending: false }).limit(100);

    // Aggregations
    const countries = {};
    const sources = {};

    sessions?.forEach(s => {
      countries[s.country || 'Bilinmeyen'] = (countries[s.country || 'Bilinmeyen'] || 0) + 1;
      sources[s.referrer || 'Doğrudan'] = (sources[s.referrer || 'Doğrudan'] || 0) + 1;
    });

    container.innerHTML = `
      <div class="analytics-grid-elite">
        <div class="stat-card-elite">
          <h3>En Çok Ziyaret Edilen Ülkeler</h3>
          <div class="analytics-list">
            ${Object.entries(countries).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, count]) => `
              <div class="analytics-row">
                <span>${c}</span>
                <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width: ${(count / sessions.length) * 100}%"></div></div>
                <span class="count-tag">${count}</span>
              </div>
            `).join('') || '<p>Veri yok</p>'}
          </div>
        </div>
        <div class="stat-card-elite">
          <h3>Trafik Kanalları</h3>
          <div class="analytics-list">
            ${Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, count]) => `
              <div class="analytics-row">
                <span title="${s}">${(s || 'Doğrudan').replace('https://', '').substring(0, 20)}...</span>
                <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width: ${(count / sessions.length) * 100}%"></div></div>
                <span class="count-tag">${count}</span>
              </div>
            `).join('') || '<p>Veri yok</p>'}
          </div>
        </div>
      </div>
      <div class="admin-table-container" style="margin-top: 30px;">
        <h3>Canlı Ziyaretçi Akışı</h3>
        <table class="admin-table">
          <thead><tr><th>Saat</th><th>Konum</th><th>Cihaz</th><th>Yönlendiren</th></tr></thead>
          <tbody>
            ${sessions?.map(s => `
              <tr>
                <td>${new Date(s.created_at).toLocaleTimeString('tr-TR')}</td>
                <td>${s.country || 'Bilinmeyen'}</td>
                <td><span class="device-pill">${s.device_type || 'Masaüstü'}</span></td>
                <td><small>${(s.referrer || 'Doğrudan').substring(0, 40)}</small></td>
              </tr>
            `).join('') || '<tr><td colspan="4">Veri toplanıyor...</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

  } else if (tabId === 'customers') {
    title.textContent = 'Müşteri İlişkileri (CRM)';
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    container.innerHTML = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead><tr><th>Müşteri</th><th>E-posta</th><th>Toplam Harcama</th><th>Seviye</th><th>İşlemler</th></tr></thead>
          <tbody>
            ${data?.map(c => `
              <tr>
                <td><strong>${c.first_name} ${c.last_name}</strong></td>
                <td>${c.email}</td>
                <td>${(c.total_spent || 0).toLocaleString()} AED</td>
                <td><span class="tier-badge ${c.customer_tier}">${c.customer_tier || 'Standart'}</span></td>
                <td><button class="action-btn-sm" onclick="window.viewCustomer(${c.id})">Profil</button></td>
              </tr>
            `).join('') || '<tr><td colspan="5">Henüz müşteri yok.</td></tr>'}
          </tbody>
        </table>
      </div>
      `;

  } else if (tabId === 'campaigns') {
    title.textContent = 'Pazarlama Kampanyaları';
    actions.innerHTML = `<button class="btn-add" onclick="window.openCampaignModal()">+ Yeni Kampanya</button>`;

    container.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Aktif Kampanyalar</div>
          <div class="stat-value">2</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Toplam Harcama</div>
          <div class="stat-value">7,500 AED</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">ROAS</div>
          <div class="stat-value">4.2x</div>
        </div>
      </div>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead><tr><th>Kampanya</th><th>Durum</th><th>Harcama</th><th>Dönüşüm</th><th>İşlemler</th></tr></thead>
          <tbody>
            <tr>
              <td><strong>Winter Gala 2026</strong></td>
              <td><span class="status-pill active" style="background:#e6fffb; color:#006d75;">Aktif</span></td>
              <td>5,000 AED</td>
              <td>12</td>
              <td><button class="action-btn-sm" onclick="window.alert('Analiz devam ediyor...')">Analiz Et</button></td>
            </tr>
            <tr>
              <td><strong>Valentine's Early Access</strong></td>
              <td><span class="status-pill paused" style="background:#fff7e6; color:#d48806;">Duraklatıldı</span></td>
              <td>2,500 AED</td>
              <td>8</td>
              <td><button class="action-btn-sm" onclick="window.alert('Yönetici onayı bekliyor...')">Devam Ettir</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

  } else if (tabId === 'affiliates') {
    title.textContent = 'Satış Ortaklığı (Affiliate)';
    actions.innerHTML = `<button class="btn-add" onclick="openAddAffiliateModal()">+ Ortak Ekle</button>`;
    const { data } = await supabase.from('affiliates').select('*').order('total_sales', { ascending: false });
    container.innerHTML = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead><tr><th>İş Ortağı</th><th>Kod</th><th>Satışlar</th><th>Komisyon</th><th>İşlemler</th></tr></thead>
          <tbody>
            ${data?.map(a => `
              <tr>
                <td><strong>${a.first_name} ${a.last_name}</strong></td>
                <td><code>${a.affiliate_code}</code></td>
                <td>${(a.total_sales || 0).toLocaleString()} AED</td>
                <td>${(a.total_commission_earned || 0).toLocaleString()} AED</td>
                <td><button class="action-btn-sm" onclick="viewAffiliate(${a.id})">Detaylar</button></td>
              </tr>
            `).join('') || '<tr><td colspan="5">Henüz üye yok.</td></tr>'}
          </tbody>
        </table>
      </div>
      `;

  } else if (tabId === 'settings') {
    title.textContent = 'Mağaza Kuralları ve API';
    container.innerHTML = `
      <div class="settings-grid-elite">
        <div class="settings-card-elite">
          <h3>Pazarlama Entegrasyonları</h3>
          <div class="form-group-elite"><label>Meta Pixel ID</label><input type="text" placeholder="Örn: 123456789"></div>
          <div class="form-group-elite"><label>Google Tag Manager</label><input type="text" placeholder="GTM-XXXXXX"></div>
          <button class="btn-submit-elite" onclick="alert('Ayarlar kaydedildi')">Entegrasyonları Kaydet</button>
        </div>
      </div>
      `;
  }
}

async function renderAdminProducts(filteredData = null) {
  const list = document.getElementById('admin-product-list');
  if (!list) return;

  let data = filteredData;
  if (!data) {
    const { data: fetched, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (error) return;
    data = fetched;
  }

  window.adminProductsState = data;
  console.log('Admin products state updated:', window.adminProductsState.length, 'items');

  list.innerHTML = data.map(p => {
    let img = '/ring.png';
    let imgList = p.image_url;

    if (typeof imgList === 'string' && (imgList.startsWith('[') || imgList.startsWith('{'))) {
      try { imgList = JSON.parse(imgList); } catch (e) { }
    }

    if (imgList) {
      if (Array.isArray(imgList)) {
        img = imgList[0] || '/ring.png';
      } else {
        img = imgList;
      }
    }
    const imgSrc = (img.startsWith('http') || img.startsWith('data')) ? img : getAssetPath(img);

    return `
      <tr>
        <td>
          <div class="admin-prod-cell">
            <img src="${imgSrc}" width="40" height="40" style="object-fit: contain; border-radius: 4px;">
            <div>
              <strong>${p.name}</strong>
              ${p.sku ? `<br><small style="color:#999">SKU: ${p.sku}</small>` : ''}
            </div>
          </div>
        </td>
        <td>${p.category || '-'}</td>
        <td>${p.product_type || 'Fiziksel'}</td>
        <td>${p.price}</td>
        <td><span class="status-pill ${p.status || 'active'}">${p.status === 'draft' ? 'Taslak' : (p.status === 'active' ? 'Aktif' : p.status)}</span></td>
        <td>
          <button class="action-btn-sm" onclick="window.openProductModalById(${p.id})">Düzenle</button>
          ${p.status === 'draft' ? `<button class="publish-btn-sm" onclick="window.publishProduct(${p.id})">Yayınla</button>` : ''}
          <button class="delete-btn-sm" onclick="window.deleteProduct(${p.id})">Kaldır</button>
        </td>
      </tr>
      `;
  }).join('') || '<tr><td colspan="6">Ürün bulunamadı.</td></tr>';
}

window.filterProducts = async () => {
  const category = document.getElementById('filter-category')?.value || '';
  const status = document.getElementById('filter-status')?.value || '';
  const search = document.getElementById('product-search')?.value?.toLowerCase() || '';

  let query = supabase.from('products').select('*').order('id', { ascending: true });

  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return;

  const filtered = data.filter(p =>
    !search || p.name?.toLowerCase().includes(search) || p.sku?.toLowerCase().includes(search)
  );

  renderAdminProducts(filtered);
};

// Unified Product Modal for Add and Edit (Redesigned with 4 Areas)
window.openProductModal = (product = null) => {
  const isEdit = !!product;
  const modal = document.createElement('div');
  modal.className = 'admin-product-modal';
  modal.innerHTML = `
      <div class="admin-modal-content large admin-form">
      <div class="modal-header-elite">
        <h2>${isEdit ? 'Masterpiece\'i Düzenle' : 'Yeni Tasarım Ekle'}</h2>
        <span class="modal-close-elite" onclick="this.closest('.admin-product-modal').remove()">&times;</span>
      </div>
      <form id="product-form">
        <div class="admin-modal-grid-elite">
          <!-- ALAN 1: KİMLİK & KÜRASYON -->
          <div class="modal-section-elite">
            <div class="section-badge">1</div>
            <h3>Ürün Kimliği</h3>
            <div class="form-group">
              <label>Ürün Adı *</label>
              <input type="text" id="prod-name" value="${isEdit ? (product.name || '') : ''}" placeholder="Örn: Eternal Sparkle Ring" required>
            </div>
            <div class="form-group">
              <label>Stok Kodu (SKU)</label>
              <input type="text" id="prod-sku" value="${isEdit ? (product.sku || '') : ''}" placeholder="Örn: SIOR-RNG-001">
            </div>
            <div class="form-row-elite">
              <div class="form-group">
                <label>Kategori *</label>
                <select id="prod-category" required onchange="window.updateCategoryFields()">
                  <option value="">Kategori Seçin</option>
                  ${['Rings', 'Necklaces', 'Earrings', 'Bracelets'].map(cat => {
    const translations = { 'Rings': 'Yüzükler', 'Necklaces': 'Kolyeler', 'Earrings': 'Küpeler', 'Bracelets': 'Bileklikler' };
    return `<option value="${cat}" ${isEdit && product.category === cat ? 'selected' : ''}>${translations[cat] || cat}</option>`;
  }).join('')}
                </select>
              </div>
              <div class="form-group">
                <label>Durum</label>
                <select id="prod-status">
                  <option value="active" ${isEdit && product.status === 'active' ? 'selected' : (!isEdit ? 'selected' : '')}>Yayında</option>
                  <option value="draft" ${isEdit && product.status === 'draft' ? 'selected' : ''}>Taslak</option>
                  <option value="archived" ${isEdit && product.status === 'archived' ? 'selected' : ''}>Arşivlendi</option>
                </select>
              </div>
            </div>
          </div>

          <!-- ALAN 2: SEÇKİN NİTELİKLER -->
          <div class="modal-section-elite">
            <div class="section-badge">2</div>
            <h3>Seçkin Nitelikler</h3>
            <div class="form-group">
              <label>Ana Materyal *</label>
              <input type="text" id="prod-material" value="${isEdit ? (product.material || '') : ''}" placeholder="Örn: 18k Beyaz Altın" required>
            </div>
            <div id="dynamic-fields-container">
              <p style="font-size: 11px; color: var(--text-muted); opacity: 0.7; font-style: italic;">Özel nitelikleri görmek için bir kategori seçin.</p>
            </div>
          </div>

          <!-- ALAN 3: FİYATLANDIRMA -->
          <div class="modal-section-elite">
            <div class="section-badge">3</div>
            <h3>Fiyatlandırma</h3>
            <div class="form-group">
              <label>Satış Fiyatı (AED) *</label>
              <div class="input-with-icon">
                <input type="text" id="prod-price" value="${isEdit ? (product.price || '') : ''}" placeholder="Örn: 18,500" required>
              </div>
            </div>
            <div class="form-group">
              <label>Eski Fiyat (Opsiyonel)</label>
              <div class="input-with-icon">
                <input type="text" id="prod-compare-price" value="${isEdit ? (product.compare_at_price || '') : ''}" placeholder="Örn: 22,000">
              </div>
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 10px;">Fiyatlar otomatik olarak düzenlenir.</p>
          </div>

          <!-- ALAN 4: GALERİ & HİKAYE -->
          <div class="modal-section-elite full-width">
            <div class="section-badge">4</div>
            <h3>Galeri ve Hikaye</h3>
            <div class="form-group">
              <label>Ürün Hikayesi / Açıklama</label>
              <textarea id="prod-desc" rows="3" placeholder="Bu parçanın ruhunu tanımlayın...">${isEdit ? (product.description || '') : ''}</textarea>
            </div>
            
            <div class="gallery-management-elite">
              <label>Görsel Kütüphanesi</label>
              <div id="dropzone" class="dropzone-elite">
                <div class="dropzone-content">
                  <span class="drop-icon">✧</span>
                  <p>Görselleri buraya sürükleyin veya göz atmak için tıklayın</p>
                  <small>Desteklenen: JPG, PNG, WEBP (Maksimum 5MB)</small>
                </div>
                <input type="file" id="file-input" multiple accept="image/*" style="display: none;">
              </div>
              <div id="preview-gallery" class="preview-gallery-elite">
                <!-- Önizlemeler burada görünecek -->
              </div>
              <input type="hidden" id="prod-image-value" value="${isEdit ? (Array.isArray(product.image_url) ? product.image_url.join(', ') : (product.image_url || '')) : ''}">
            </div>
          </div>
        </div>
        
        <div class="form-actions-admin-elite" style="margin-top: 40px; border-top: 1px solid rgba(58,81,108,0.1); padding-top: 25px;">
          <button type="button" class="btn-cancel-elite" onclick="this.closest('.admin-product-modal').remove()">İptal Et</button>
          <button type="submit" class="btn-submit-elite">${isEdit ? 'Güncelle' : 'Koleksiyona Ekle'}</button>
        </div>
      </form>

    </div>
      `;
  document.body.appendChild(modal);

  // Dynamic Fields Logic
  window.updateCategoryFields = () => {
    const category = document.getElementById('prod-category').value;
    const container = document.getElementById('dynamic-fields-container');
    container.innerHTML = '';

    let fields = '';
    const attrs = isEdit ? (product.attributes || {}) : {};

    if (category === 'Rings') {
      fields = `
      <div class="form-row-elite">
          <div class="form-group">
            <label>Yüzük Ölçüsü (US)</label>
            <select id="attr-ring-size">
              <option value="">Ölçü Seçin</option>
              ${[4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13].map(s => `<option value="${s}" ${attrs.ring_size == s ? 'selected' : ''}>US ${s}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Değerli Metal Türü</label>
            <select id="attr-metal-type">
               <option value="">Metal Seçin</option>
               ${[
          { val: '18k Yellow Gold', label: '18 Ayar Sarı Altın' },
          { val: '18k White Gold', label: '18 Ayar Beyaz Altın' },
          { val: '18k Rose Gold', label: '18 Ayar Rose Altın' },
          { val: 'Platinum', label: 'Platin' }
        ].map(m => `
                 <option value="${m.val}" ${attrs.metal_type === m.val ? 'selected' : ''}>${m.label}</option>
               `).join('')}
            </select>
          </div>
        </div>
      <div class="form-group" style="margin-top: 15px;">
        <label>Taş Kesim Sanatı</label>
        <select id="attr-stone-cut">
          <option value="">Kesim Seçin</option>
          ${[
          { val: 'Round Brilliant', label: 'Yuvarlak Parlak' },
          { val: 'Princess', label: 'Prenses' },
          { val: 'Emerald', label: 'Zümrüt' },
          { val: 'Oval', label: 'Oval' },
          { val: 'Radiant', label: 'Radyan' },
          { val: 'Pear', label: 'Armut' },
          { val: 'Cushion', label: 'Yastık' }
        ].map(cut => `
               <option value="${cut.val}" ${attrs.stone_cut === cut.val ? 'selected' : ''}>${cut.label}</option>
             `).join('')}
        </select>
      </div>
    `;
    } else if (category === 'Necklaces') {
      fields = `
      <div class="form-row-elite">
          <div class="form-group">
            <label>Zincir Uzunluğu (İnç)</label>
            <select id="attr-chain-length">
               ${[16, 18, 20, 22, 24, 30].map(l => `<option value="${l}" ${attrs.chain_length == l ? 'selected' : ''}>${l}"</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Klips Mekanizması</label>
            <input type="text" id="attr-clasp" value="${attrs.clasp || ''}" placeholder="Örn: Lobster Clasp">
          </div>
        </div>
      `;
    } else if (category === 'Earrings') {
      fields = `
      <div class="form-group">
          <label>Küpe Arkası Tipi</label>
          <select id="attr-backing">
             <option value="">Tip Seçin</option>
             ${[
          { val: 'Push-back', label: 'Vidalı (Push-back)' },
          { val: 'Screw-back', label: 'Vidalı (Screw-back)' },
          { val: 'Latch-back', label: 'Mandal Tokalı' },
          { val: 'Lever-back', label: 'Yaylı Tokalı' }
        ].map(b => `<option value="${b.val}" ${attrs.backing === b.val ? 'selected' : ''}>${b.label}</option>`).join('')}
          </select>
        </div>
      `;
    } else if (category === 'Bracelets') {
      fields = `
      <div class="form-group">
          <label>Çap / Boyut</label>
          <input type="text" id="attr-diameter" value="${attrs.diameter || ''}" placeholder="Örn: 6.5 inches">
        </div>
    `;
    }

    container.innerHTML = fields;
  };

  // Initialize fields if editing
  if (isEdit) {
    window.updateCategoryFields();
  }

  // Gallery Logic: Now handles both existing URLs and new File objects
  let galleryItems = isEdit ? (Array.isArray(product.image_url) ? [...product.image_url] : (product.image_url ? [product.image_url] : [])) : [];
  const dropzone = modal.querySelector('#dropzone');
  const fileInput = modal.querySelector('#file-input');
  const previewGallery = modal.querySelector('#preview-gallery');

  const updateGalleryUI = () => {
    previewGallery.innerHTML = galleryItems.map((item, index) => {
      let src = '';
      if (item instanceof File) {
        src = URL.createObjectURL(item);
      } else {
        src = (item.startsWith('http') || item.startsWith('data')) ? item : getAssetPath(item);
      }
      return `
      <div class="preview-item">
        <img src="${src}" alt="Galeri öğesi">
          <button type="button" class="remove-item" onclick="window.removeGalleryItem(${index})">&times;</button>
        </div>
    `;
    }).join('');
  };

  window.removeGalleryItem = (index) => {
    galleryItems.splice(index, 1);
    updateGalleryUI();
  };

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('active'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('active'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('active');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  const handleFiles = (files) => {
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        galleryItems.push(file); // Store real file for official upload
        updateGalleryUI();
      }
    });
  };

  updateGalleryUI();

  // Initial call for edit mode
  if (isEdit) window.updateCategoryFields();


  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.btn-submit-elite');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Synchronizing...';

    // Helper to sanitize numeric strings (remove commas, spaces, currency symbols)
    const sanitizePrice = (val) => {
      if (val === null || val === undefined) return '';
      return val.toString().replace(/[^0-9.]/g, '');
    };

    const attributes = {};
    const attrContainer = document.getElementById('dynamic-fields-container');
    if (attrContainer) {
      const inputs = attrContainer.querySelectorAll('input, select');
      inputs.forEach(input => {
        if (input.value) {
          const key = input.id.replace('attr-', '').replace(/-/g, '_');
          attributes[key] = input.value;
        }
      });
    }

    submitBtn.textContent = 'Uploading Assets...';

    const finalImageUrls = [];
    try {
      for (const item of galleryItems) {
        if (item instanceof File) {
          // Official Supabase Storage Upload
          const fileExt = item.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
          const filePath = `products/${fileName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, item);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          finalImageUrls.push(publicUrl);
        } else {
          // Keep existing URL
          finalImageUrls.push(item);
        }
      }
    } catch (uploadErr) {
      console.error('Asset upload failed:', uploadErr);
      alert('Görsel yükleme hatası oluştu. Lütfen bağlantınızı kontrol edin.');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Tekrar Dene';
      return;
    }

    const image_url = finalImageUrls.length > 0 ? finalImageUrls : ['/ring.png'];
    submitBtn.textContent = 'Senkronize ediliyor...';

    // Sanitize and format price to standard display (with AED)
    let rawPrice = sanitizePrice(document.getElementById('prod-price').value);
    let rawCompare = sanitizePrice(document.getElementById('prod-compare-price').value);

    console.log('Sanitizing prices:', { raw: document.getElementById('prod-price').value, sanitized: rawPrice });

    const formattedPrice = rawPrice ? `${parseFloat(rawPrice).toLocaleString()} AED` : '0 AED';
    const formattedCompare = rawCompare ? `${parseFloat(rawCompare).toLocaleString()} AED` : null;

    const productStatus = document.getElementById('prod-status').value;
    const productData = {
      name: document.getElementById('prod-name').value,
      sku: document.getElementById('prod-sku').value || null,
      price: formattedPrice,
      category: document.getElementById('prod-category').value,
      compare_at_price: formattedCompare,
      material: document.getElementById('prod-material').value,
      description: document.getElementById('prod-desc').value || '',
      attributes: attributes,
      status: productStatus,
      is_active: productStatus === 'active',
      image_url: image_url
    };


    try {
      let error;
      if (isEdit) {
        console.log('Updating product:', product.id, productData);
        const { error: err } = await supabase.from('products').update(productData).eq('id', product.id);
        error = err;
      } else {
        console.log('Inserting new product:', productData);
        const { error: err } = await supabase.from('products').insert([productData]);
        error = err;
      }

      if (error) throw error;

      modal.remove();

      // Refresh admin list immediately for local feedback
      await renderAdminProducts();
      // Public site and other admin tabs will be refreshed by the Real-time Channel
    } catch (err) {
      console.error('Submission error:', err);
      alert('Veri senkronizasyon hatası: ' + err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = isEdit ? 'Güncelle' : 'Koleksiyona Ekle';
    }
  });
};

// Update legacy calls
window.openAddProductModal = () => window.openProductModal();
window.openProductModalById = (id) => {
  console.log('Attempting to open modal for ID:', id);
  const p = (window.adminProductsState || []).find(prod => prod.id == id);
  if (p) {
    console.log('Product found:', p.name);
    window.openProductModal(p);
  } else {
    console.warn('Product not found in state. State length:', (window.adminProductsState || []).length);
    alert('Ürün mevcut görünümde bulunamadı.');
  }
};
window.editProduct = (id) => window.openProductModalById(id);

window.deleteProduct = async (id) => {
  console.log('Requesting deletion for ID:', id);
  if (!id) return;
  if (confirm('Bu sanat eserini koleksiyondan kaldırmak istediğinize emin misiniz?')) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;

      console.log('Deletion successful');
      // Update local state to ensure reactivity
      if (window.adminProductsState) {
        window.adminProductsState = window.adminProductsState.filter(p => p.id !== id);
      }
      loadDashboardTab('products');
      renderProducts(); // Refresh public storefront
    } catch (err) {
      console.error('Deletion error:', err);
      alert('Ürün silme hatası. Lütfen RLS politikalarını kontrol edin. \n\nDetaylar: ' + err.message);
    }
  }
};

window.publishProduct = async (id) => {
  try {
    const { error } = await supabase.from('products').update({ status: 'active', is_active: true }).eq('id', id);
    if (error) throw error;

    await renderAdminProducts();
    renderProducts(); // Refresh public storefront
  } catch (err) {
    console.error('Publishing error:', err);
    alert('Ürün yayınlama hatası: ' + err.message);
  }
};

// Campaign Modal
window.openCampaignModal = () => {
  const modal = document.createElement('div');
  modal.className = 'admin-product-modal';
  modal.innerHTML = `
      <div class="admin-modal-content large admin-form">
      <div class="modal-header-elite">
        <h2>Yeni Kampanya Başlat</h2>
        <span class="modal-close-elite" onclick="this.closest('.admin-product-modal').remove()">&times;</span>
      </div>
      <form id="campaign-form">
        <div class="form-group">
          <label>Kampanya Adı</label>
          <input type="text" id="camp-name" placeholder="Örn: Ramazan Özel 2026" required>
        </div>
        <div class="form-row-admin">
          <div class="form-group">
            <label>Bütçe (AED)</label>
            <input type="number" id="camp-budget" placeholder="Örn: 10000" required>
          </div>
          <div class="form-group">
            <label>Kanal</label>
            <select id="camp-channel">
              <option value="meta">Meta (Instagram/FB)</option>
              <option value="google">Google Arama</option>
              <option value="tiktok">TikTok Reklamları</option>
              <option value="email">E-posta Pazarlama</option>
            </select>
          </div>
        </div>
        <div class="form-actions-admin">
          <button type="button" class="btn-cancel" onclick="this.closest('.admin-product-modal').remove()">Vazgeç</button>
          <button type="submit" class="btn-submit">Kampanyayı Başlat</button>
        </div>
      </form>
    </div >
      `;
  document.body.appendChild(modal);

  document.getElementById('campaign-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Kampanya mantığı başlatıldı. Veriler analiz motoruyla senkronize ediliyor...');
    modal.remove();
  });
};

// =====================================
// DISCOUNT MANAGEMENT FUNCTIONS
// =====================================
window.openAddDiscountModal = () => {
  const modal = document.createElement('div');
  modal.className = 'admin-product-modal';
  modal.innerHTML = `
      <div class="admin-modal-content">
      <h2>İndirim Kodu Oluştur</h2>
      <form id="add-discount-form">
        <div class="form-group">
          <label>İndirim Kodu *</label>
          <input type="text" id="disc-code" placeholder="Örn: SAVE20" style="text-transform: uppercase;" required>
        </div>
        <div class="form-row-admin">
          <div class="form-group">
            <label>İndirim Tipi *</label>
            <select id="disc-type">
              <option value="percentage">Yüzde (%)</option>
              <option value="fixed">Sabit Tutar (AED)</option>
              <option value="free_shipping">Ücretsiz Kargo</option>
            </select>
          </div>
          <div class="form-group">
            <label>Değer *</label>
            <input type="number" id="disc-value" placeholder="Örn: 10" required>
          </div>
        </div>
        <div class="form-row-admin">
          <div class="form-group">
            <label>Min. Alışveriş (AED)</label>
            <input type="number" id="disc-min" placeholder="0">
          </div>
          <div class="form-group">
            <label>Kullanım Limiti</label>
            <input type="number" id="disc-limit" placeholder="Sınırsız">
          </div>
        </div>
        <div class="form-group">
          <label>Son Kullanma Tarihi</label>
          <input type="date" id="disc-expiry">
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" onclick="this.closest('.admin-product-modal').remove()">İptal</button>
          <button type="submit" class="btn-submit">İndirim Oluştur</button>
        </div>
      </form>
    </div>
      `;
  document.body.appendChild(modal);

  document.getElementById('add-discount-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Oluşturuluyor...';

    const discountData = {
      code: document.getElementById('disc-code').value.toUpperCase(),
      discount_type: document.getElementById('disc-type').value,
      discount_value: parseFloat(document.getElementById('disc-value').value),
      minimum_purchase_amount: parseFloat(document.getElementById('disc-min').value) || null,
      usage_limit: parseInt(document.getElementById('disc-limit').value) || null,
      ends_at: document.getElementById('disc-expiry').value || null,
      is_active: true
    };

    const { error } = await supabase.from('discount_codes').insert([discountData]);

    if (error) {
      alert('Error: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Discount';
    } else {
      modal.remove();
      loadDashboardTab('discounts');
    }
  });
};

window.editDiscount = async (id) => {
  const { data } = await supabase.from('discount_codes').select('*').eq('id', id).single();
  if (data) {
    const newValue = prompt(`Mevcut değer: ${data.discount_value} \nYeni değeri girin: `);
    if (newValue) {
      await supabase.from('discount_codes').update({ discount_value: parseFloat(newValue) }).eq('id', id);
      loadDashboardTab('discounts');
    }
  }
};

window.deleteDiscount = async (id) => {
  if (confirm('Bu indirim kodunu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
    await supabase.from('discount_codes').delete().eq('id', id);
    loadDashboardTab('discounts');
  }
};

// =====================================
// SETTINGS FUNCTIONS
// =====================================
// =====================================
// ORDER & CUSTOMER VIEW FUNCTIONS
// =====================================
window.viewOrder = async (id) => {
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) return alert('Sipariş bulunamadı.');

  const modal = document.createElement('div');
  modal.className = 'admin-product-modal';
  modal.innerHTML = `
      <div class="admin-modal-content large">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
        <h2>Sipariş #${order.id}</h2>
        <span class="status-pill ${order.status}">${order.status === 'completed' ? 'Tamamlandı' : (order.status === 'pending' ? 'Beklemede' : order.status)}</span>
      </div>
      
      <div style="display:grid; grid-template-columns: 2fr 1fr; gap:30px;">
        <div>
          <h3>Ürünler</h3>
          <table class="admin-table" style="margin-top:15px;">
             <thead><tr><th>Ürün</th><th>Adet</th><th>Fiyat</th></tr></thead>
             <tbody>
                ${(order.items || []).map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price}</td>
                  </tr>
                `).join('')}
             </tbody>
          </table>
          <div style="text-align:right; margin-top:20px; font-size:1.2rem;">
            <strong>Toplam: ${order.total_price}</strong>
          </div>
        </div>
        
        <div style="background:#f8fafc; padding:20px; border-radius:8px;">
          <h3>Müşteri</h3>
          <p style="margin-top:10px;"><strong>E-posta:</strong> ${order.customer_email}</p>
          <p><strong>Referans:</strong> ${order.affiliate_ref || 'Doğrudan'}</p>
          <p><strong>Tarih:</strong> ${new Date(order.created_at).toLocaleString()}</p>
          
          <h3 style="margin-top:20px;">Teslimat Bilgisi</h3>
          <p style="color:#666">Simüle edilmiş teslimat bilgileri burada görünecektir.</p>
          
          <div style="margin-top:30px; display:flex; flex-direction:column; gap:10px;">
            <button class="btn-submit" onclick="updateOrderStatus(${order.id}, 'completed')">Tamamlandı Olarak İşaretle</button>
            <button class="btn-cancel" onclick="this.closest('.admin-product-modal').remove()">Kapat</button>
          </div>
        </div>
      </div>
    </div>
      `;
  document.body.appendChild(modal);
};

window.updateOrderStatus = async (id, status) => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) alert('Hata: ' + error.message);
  else {
    document.querySelector('.admin-product-modal')?.remove();
    loadDashboardTab('orders');
  }
};

window.viewCustomer = async (id) => {
  const { data: customer, error } = await supabase.from('customers').select('*').eq('id', id).single();
  if (error) return alert('Müşteri bulunamadı.');

  const modal = document.createElement('div');
  modal.className = 'admin-product-modal';
  modal.innerHTML = `
      <div class="admin-modal-content">
      <h2>Müşteri Profili</h2>
      <div style="text-align:center; margin-bottom:20px;">
        <div style="width:80px; height:80px; background:var(--primary-navy); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 10px; font-size:2rem;">
          ${(customer.first_name || 'C')[0]}
        </div>
        <h3>${customer.first_name || ''} ${customer.last_name || ''}</h3>
        <p>${customer.email}</p>
        <span class="tier-badge ${customer.customer_tier}" style="margin-top:10px; display:inline-block;">${customer.customer_tier === 'Elite Partner' ? 'Elite Ortak' : (customer.customer_tier === 'VIP' ? 'VIP Müşteri' : 'Normal Cari')}</span>
      </div>
      
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
        <div style="background:#f8fafc; padding:15px; text-align:center; border-radius:8px;">
          <small>Toplam Harcama</small>
          <div style="font-size:1.2rem; font-weight:600;">${(customer.total_spent || 0).toLocaleString()} AED</div>
        </div>
        <div style="background:#f8fafc; padding:15px; text-align:center; border-radius:8px;">
          <small>Toplam Sipariş</small>
          <div style="font-size:1.2rem; font-weight:600;">${customer.total_orders || 0}</div>
        </div>
      </div>
      
      <div class="form-actions">
         <button class="btn-submit" onclick="this.closest('.admin-product-modal').remove()">Tamam</button>
      </div>
    </div>
      `;
  document.body.appendChild(modal);
};

// End of file

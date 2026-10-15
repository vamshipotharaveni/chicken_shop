/* ═══════════════════════════════════════════════════════
   JYOTHI CHICKEN CENTER – Main Application JavaScript
   ═══════════════════════════════════════════════════════ */

// ── Global State ──────────────────────────────────────
const API_BASE = ''; // same-origin
let allProducts = [];
let cart = JSON.parse(localStorage.getItem('jc_cart') || '[]');
let shopSettings = {
  shopOpen: true,
  shopPhone: '917993996127',
  orderPhone: '919160726658',
  shopAddress: 'Near canal, Saidhapur Road, Huzurabad, Karimnagar, Telangana'
};
let adminToken = sessionStorage.getItem('jc_admin_token') || '';
let currentCategory = 'all';
let searchQuery = '';
let allOrders = [];
let orderFilter = 'all';
let allOffers = [];

const DEFAULT_DISPLAY_PHONE = '7993996127';
const DEFAULT_ORDER_PHONE = '9160726658';
const DEFAULT_SHOP_ADDRESS = 'Near canal, Saidhapur Road, Huzurabad, Karimnagar, Telangana';
const DEFAULT_SHOP_MAP_URL = 'https://www.google.com/maps?q=18.2049723,79.3888069';

const OFFER_TEMPLATES = {
  dussehra: {
    label: 'Dussehra', labelTe: 'దసరా', badge: '🏹 DUSSEHRA', emoji: '🏹',
    discount: '15% OFF',
    text: 'Dussehra Special on all fresh chicken cuts',
    textTe: 'దసరా స్పెషల్ — అన్ని తాజా చికెన్ కట్స్‌పై',
    desc: 'Celebrate Vijayadashami with farm-fresh hygienic chicken.',
    descTe: 'విజయదశమి సందర్భంగా తాజా హైజీనిక్ చికెన్.'
  },
  diwali: {
    label: 'Diwali', labelTe: 'దీపావళి', badge: '🪔 DIWALI', emoji: '🪔',
    discount: '₹50 OFF',
    text: 'Diwali / Deepavali lights offer on 2kg+ orders',
    textTe: 'దీపావళి ఆఫర్ — 2 కిలోల పైన ఆర్డర్లకు',
    desc: 'Festive packing and extra savings this Deepavali.',
    descTe: 'ఈ దీపావళికి పండుగ ప్యాకింగ్ మరియు ఎక్కువ ఆదా.'
  },
  ugadi: {
    label: 'Ugadi', labelTe: 'ఉగాది', badge: '🌼 UGADI', emoji: '🌼',
    discount: '10% OFF',
    text: 'Ugadi New Year freshness deal',
    textTe: 'ఉగాది నూతన సంవత్సరం తాజా చికెన్ డీల్',
    desc: 'Start the Telugu new year with pure farm-fresh cuts.',
    descTe: 'తెలుగు నూతన సంవత్సరాన్ని తాజా కట్స్‌తో ప్రారంభించండి.'
  },
  sankranti: {
    label: 'Sankranti', labelTe: 'సంక్రాంతి', badge: '🪁 SANKRANTI', emoji: '🪁',
    discount: '₹20/kg',
    text: 'Sankranti harvest special — bulk orders save more',
    textTe: 'సంక్రాంతి స్పెషల్ — బల్క్ ఆర్డర్లకు ఎక్కువ ఆదా',
    desc: 'Weekend & festival bulk chicken at harvest rates.',
    descTe: 'పండుగ మరియు వారాంతం బల్క్ ఆర్డర్లకు ప్రత్యేక ధర.'
  }
};

// ── Performance: Cached products for instant load ─────
const CACHED_PRODUCTS_KEY = 'jc_products_cache';
const CACHED_SETTINGS_KEY = 'jc_settings_cache';
const CACHED_OFFERS_KEY = 'jc_offers_cache';

// Theme & Language State
let currentTheme = localStorage.getItem('jc_theme') || 'light';
let currentLang = localStorage.getItem('jc_lang') || 'en'; // 'en' or 'te'
let currentCoords = null; // { lat, lng }

// ── Translations Dictionary ───────────────────────────
const TRANSLATIONS = {
  en: {
    brand_title: '👑 Jyothi Fresh Chicken',
    brand_subtitle: 'Farm Fresh • Daily Quality Delivery • Hygienic Custom Cuts',
    search_placeholder: 'Search chicken products...',
    hero_badge: '🍗 100% Farm Fresh Everyday',
    hero_title: 'Premium Chicken Delivered Fresh Daily',
    hero_tagline: 'Hygienic Cutting • Best Local Rates • Delivered within the hour',
    shop_open: 'OPEN NOW',
    shop_closed: 'CLOSED',
    ticker_label: "Today's Rates",
    offer_1: '₹20/kg OFF automatically applied on orders above 3kg',
    offer_2: 'Full Chicken + Boneless Combo @ ₹500 (Save ₹40)',
    offer_3: 'Free custom Clean & Cut service on all orders',
    products_title: 'Our Fresh Products',
    items_count: '{count} Items Available',
    in_stock: '● In Stock',
    out_of_stock: '● Out of Stock',
    add_to_cart: 'Order Now',
    out_of_stock_btn: 'Out of Stock',
    cart_header_title: 'Your Cart',
    cart_empty_msg: 'Your cart is empty.<br>Add some delicious fresh chicken!',
    cutting_heading: '🔪 Cutting Preferences',
    notes_label: 'Special Instructions',
    notes_placeholder: 'Any special instructions? (e.g., extra clean, separate packaging...)',
    delivery_heading: '📋 Delivery Details',
    label_name: 'Your Full Name',
    name_placeholder: 'Enter your name',
    label_phone: 'Phone Number (WhatsApp)',
    phone_placeholder: 'e.g., 9876543210',
    label_address: 'Delivery Location *',
    address_placeholder: 'House/Flat No, Landmark, Area, Street (required)',
    detect_btn: 'Detect Live GPS Location',
    detecting_btn: 'Detecting GPS...',
    total_amount: 'Total Amount:',
    order_whatsapp: 'Continue on WhatsApp',
    clear_cart: 'Clear Cart',
    view_cart_btn: 'View Cart & Order',
    items_in_cart: '{count} {items} in Cart',
    item_singular: 'Item',
    item_plural: 'Items',
    about_title: 'Why Choose Jyothi Fresh Chicken?',
    about_subtitle: 'Pure freshness, hygienic processing, and trusted quality in every cut.',
    trust_1_title: '100% Farm Fresh',
    trust_1_desc: 'Sourced daily from certified local farms. Zero frozen, zero preservatives.',
    trust_2_title: 'Custom Cuts',
    trust_2_desc: 'Expert butcher cutting according to your preferences – Curry, Biryani, Boneless.',
    trust_3_title: 'Strict Hygiene',
    trust_3_desc: 'Thoroughly washed, pre-cleaned, and packed in food-grade sanitised containers.',
    trust_4_title: 'Express Delivery',
    trust_4_desc: 'Order through WhatsApp with live GPS location detection and get doorstep delivery.',
    reviews_title: 'Customer Reviews',
    bulk_title: '🎉 Planning a Party, Wedding or Event?',
    bulk_subtitle: 'Order fresh chicken in bulk at exclusive discounted rates with complimentary delivery.',
    bulk_btn: 'Order Bulk on WhatsApp',
    loading_text: 'Loading fresh products...',
    success_title: '',
    success_desc: ''
  },
  te: {
    brand_title: '👑 జ్యోతి ఫ్రెష్ చికెన్',
    brand_subtitle: 'తాజా ఫారం చికెన్ • నాణ్యమైన కటింగ్ • గంటలో డెలివరీ',
    search_placeholder: 'చికెన్ ఉత్పత్తులను శోధించండి...',
    hero_badge: '🍗 100% తాజా ఫారం చికెన్',
    hero_title: 'రోజూ తాజా చికెన్ మీ ఇంటి వద్దకే',
    hero_tagline: 'పరిశుభ్రమైన కట్టింగ్ • తక్కువ ధరలు • గంటలో డెలివరీ',
    shop_open: 'షాప్ తెరిచి ఉంది',
    shop_closed: 'షాప్ మూసివేయబడింది',
    ticker_label: 'నేటి ధరలు',
    offer_1: '3 కిలోల పైన ఆర్డర్‌లపై కిలోకు ₹20 తగ్గింపు',
    offer_2: 'ఫుల్ చికెన్ + బోన్‌లెస్ కాంబో ₹500 మాత్రమే (₹40 ఆదా)',
    offer_3: 'అన్ని ఆర్డర్లపై ఉచిత కట్టింగ్ మరియు క్లీనింగ్',
    products_title: 'మా తాజా చికెన్ ఉత్పత్తులు',
    items_count: '{count} ఉత్పత్తులు అందుబాటులో ఉన్నాయి',
    in_stock: '● అందుబాటులో ఉంది',
    out_of_stock: '● అందుబాటులో లేదు',
    add_to_cart: 'ఇప్పుడే ఆర్డర్ చేయండి',
    out_of_stock_btn: 'అందుబాటులో లేదు',
    cart_header_title: 'మీ కార్ట్',
    cart_empty_msg: 'మీ కార్ట్ ఖాళీగా ఉంది.<br>తాజా చికెన్ ఎంచుకోండి!',
    cutting_heading: '🔪 కట్టింగ్ ప్రాధాన్యతలు',
    notes_label: 'ప్రత్యేక సూచనలు',
    notes_placeholder: 'ఏవైనా ప్రత్యేక సూచనలు ఉంటే రాయండి (ఉదా: సన్నని ముక్కలు, వేరుగా ప్యాకింగ్...)',
    delivery_heading: '📋 డెలివరీ వివరాలు',
    label_name: 'మీ పూర్తి పేరు',
    name_placeholder: 'మీ పేరు నమోదు చేయండి',
    label_phone: 'ఫోన్ నంబర్ (వాట్సాప్)',
    phone_placeholder: 'ఉదా: 9876543210',
    label_address: 'డెలివరీ లొకేషన్ *',
    address_placeholder: 'ఇంటి నంబర్, ల్యాండ్‌మార్క్, వీధి పేరు (తప్పనిసరి)',
    detect_btn: 'లైవ్ GPS లొకేషన్ గుర్తించండి',
    detecting_btn: 'GPS గుర్తిస్తోంది...',
    total_amount: 'మొత్తం ధర:',
    order_whatsapp: 'వాట్సాప్‌లో కొనసాగించండి',
    clear_cart: 'కార్ట్ క్లియర్ చేయండి',
    view_cart_btn: 'కార్ట్ చూడండి & ఆర్డర్ చేయండి',
    items_in_cart: 'కార్ట్‌లో {count} ఐటెమ్‌లు ఉన్నాయి',
    item_singular: 'ఐటెమ్',
    item_plural: 'ఐటెమ్‌లు',
    about_title: 'జ్యోతి ఫ్రెష్ చికెన్‌ని ఎందుకు ఎంచుకోవాలి?',
    about_subtitle: 'సంపూర్ణ తాజాదనం, పరిశుభ్రమైన కటింగ్ మరియు నమ్మకమైన నాణ్యత.',
    trust_1_title: '100% తాజా ఫారం చికెన్',
    trust_1_desc: 'రోజూ స్థానిక ఫారాల నుండి సేకరిస్తాము. నిల్వ ఉంచని స్వచ్ఛమైన చికెన్.',
    trust_2_title: 'మీకు నచ్చిన విధంగా కటింగ్',
    trust_2_desc: 'కర్రీ కట్, బిర్యానీ కట్, బోన్‌లెస్ ముక్కలు పరిశుభ్రంగా చేస్తాము.',
    trust_3_title: 'కఠినమైన పరిశుభ్రత',
    trust_3_desc: 'పూర్తిగా శుభ్రం చేసి, పరిశుభ్రమైన ఫుడ్ గ్రేడ్ కంటైనర్లలో ప్యాక్ చేస్తాము.',
    trust_4_title: 'వేగవంతమైన డెలివరీ',
    trust_4_desc: 'లైవ్ GPS లొకేషన్‌తో వాట్సాప్ ద్వారా ఆర్డర్ చేయండి, త్వరగా డెలివరీ పొందండి.',
    reviews_title: 'కస్టమర్ల సమీక్షలు',
    bulk_title: '🎉 ఫంక్షన్ లేదా ఈవెంట్ ఉందా?',
    bulk_subtitle: 'ఫంక్షన్లు మరియు పార్టీల కొరకు చికెన్ హోల్‌సేల్ ధరలకే ఆర్డర్ చేయండి.',
    bulk_btn: 'వాట్సాప్‌లో బల్క్ ఆర్డర్ చేయండి',
    loading_text: 'ఉత్పత్తులు లోడ్ అవుతున్నాయి...',
    success_title: '',
    success_desc: ''
  }
};

const CATEGORIES_TRANSLATION = {
  all: { en: '🍗 All', te: '🍗 అన్నీ' },
  whole: { en: '🐓 Whole', te: '🐓 పూర్తి కోడి' },
  skinless: { en: 'Skinless', te: 'చర్మం లేని' },
  boneless: { en: '🦴 Boneless', te: '🦴 బోన్‌లెస్' },
  currycut: { en: '🍛 Curry Cut', te: '🍛 కర్రీ కట్' },
  wings: { en: '🍗 Wings', te: '🍗 వింగ్స్' },
  legs: { en: '🦵 Legs', te: '🦵 లెగ్స్' },
  liver: { en: 'Liver', te: 'కాలేయం' },
  keema: { en: 'Keema', te: 'కీమా' },
  gizzard: { en: 'Gizzard', te: 'గిజ్జర్డ్' },
  breast: { en: 'Breast', te: 'రొమ్ము' },
  heart: { en: 'Heart', te: 'గుండె' },
  feet: { en: 'Feet', te: 'పాదాలు' }
};

// ── DOM References ────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const productsGrid = $('#products-grid');
const cartDrawer = $('#cart-drawer');
const cartOverlay = $('#cart-overlay');
const cartItemsContainer = $('#cart-items-container');
const cartEmpty = $('#cart-empty');
const cartCount = $('#cart-count');
const cartHeaderCount = $('#cart-header-count');
const cartTotalAmount = $('#cart-total-amount');
const whatsappBtn = $('#whatsapp-order-btn');
const loadingOverlay = $('#loading-overlay');
const toastContainer = $('#toast-container');
const shopStatusEl = $('#shop-status');
const shopStatusText = $('#shop-status-text');
const adminPanel = $('#admin-panel');
const adminLogin = $('#admin-login');
const adminContent = $('#admin-content');
const bookingModal = null;

// Floating Cart Elements
const floatingCartBar = $('#floating-cart-bar');
const floatingCartCount = $('#floating-cart-count');
const floatingCartItemsText = $('#floating-cart-items-text');
const floatingCartTotal = $('#floating-cart-total');

// ── Initialization (FAST – renders instantly) ─────────
document.addEventListener('DOMContentLoaded', () => {
  init();
});

async function init() {
  applyTheme(currentTheme);

  // Step 1: INSTANT RENDER from cache or demo data (0ms delay)
  const cachedProducts = localStorage.getItem(CACHED_PRODUCTS_KEY);
  if (cachedProducts) {
    try { allProducts = JSON.parse(cachedProducts); } catch(e) { allProducts = getDemoProducts(); }
  } else {
    allProducts = getDemoProducts();
  }
  const cachedSettings = localStorage.getItem(CACHED_SETTINGS_KEY);
  if (cachedSettings) {
    try { shopSettings = { ...shopSettings, ...JSON.parse(cachedSettings) }; } catch(e) {}
  }
  const cachedOffers = localStorage.getItem(CACHED_OFFERS_KEY);
  if (cachedOffers) {
    try { allOffers = JSON.parse(cachedOffers); } catch(e) { allOffers = getDefaultOffers(); }
  } else {
    allOffers = getDefaultOffers();
  }

  applyLanguage(currentLang);
  updateCartUI();
  renderStorefrontOffers();
  updateContactUI();

  // Step 2: HIDE LOADING INSTANTLY (page already has content)
  hideLoading();

  // Step 3: Bind all events and init UI components immediately
  bindEvents();
  initHeroCanvas();
  initTestimonialsCarousel();
  initBackToTop();
  initFloatingNavbar();
  initOffersCarousel();

  // Step 4: BACKGROUND REFRESH from API (non-blocking, with fast timeout)
  refreshFromAPI();
}

async function refreshFromAPI() {
  const FAST_TIMEOUT = 3000; // 3s max wait for API

  const fetchWithTimeout = (url, opts = {}, timeout = FAST_TIMEOUT) => {
    return Promise.race([
      fetch(API_BASE + url, { headers: { 'Content-Type': 'application/json', ...opts.headers }, ...opts }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);
  };

  // Refresh products in background
  try {
    const res = await fetchWithTimeout('/api/products');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      allProducts = data;
      localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(data));
      renderProducts();
      renderRatesTicker();
    }
  } catch(e) { /* Using cached/demo data – no problem */ }

  // Refresh settings in background
  try {
    const res = await fetchWithTimeout('/api/admin/settings');
    const data = await res.json();
    shopSettings = { ...shopSettings, ...data };
    localStorage.setItem(CACHED_SETTINGS_KEY, JSON.stringify(data));
    updateShopStatus();
    updateAnnouncement();
  } catch(e) { /* Using defaults – no problem */ }

  try {
    const res = await fetchWithTimeout('/api/offers');
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      allOffers = data;
      localStorage.setItem(CACHED_OFFERS_KEY, JSON.stringify(data));
      renderStorefrontOffers();
    }
  } catch(e) { /* keep cached offers */ }
}

// ── Theme System (Light by Default & Dark Mode) ───────
function applyTheme(theme) {
  currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('jc_theme', theme);

  const themeIcon = $('#theme-icon');
  if (themeIcon) {
    if (theme === 'dark') {
      themeIcon.className = 'fas fa-sun';
      themeIcon.parentElement.setAttribute('title', 'Switch to Light Mode');
    } else {
      themeIcon.className = 'fas fa-moon';
      themeIcon.parentElement.setAttribute('title', 'Switch to Dark Mode');
    }
  }
}

function toggleTheme() {
  const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(nextTheme);
  showToast(nextTheme === 'dark' ? 'Dark Mode Enabled' : 'Light Mode Enabled', 'info');
}

// ── Language System (English ONLY or Telugu ONLY) ─────
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('jc_lang', lang);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // Update Language Toggle Button Label
  const langBtnLabel = $('#lang-btn-label');
  if (langBtnLabel) {
    // Shows the other language that clicking will switch to
    langBtnLabel.textContent = lang === 'en' ? 'తెలుగు' : 'English';
  }

  // Update Static UI Elements
  if ($('#brand-title')) $('#brand-title').textContent = t.brand_title;
  if ($('#brand-subtitle')) $('#brand-subtitle').textContent = t.brand_subtitle;
  if ($('#search-input')) $('#search-input').placeholder = t.search_placeholder;
  if ($('#search-input-mobile')) $('#search-input-mobile').placeholder = t.search_placeholder;
  if ($('#hero-badge')) $('#hero-badge').textContent = t.hero_badge;
  if ($('#hero-title')) $('#hero-title').textContent = t.hero_title;
  if ($('#hero-tagline')) $('#hero-tagline').textContent = t.hero_tagline;
  if ($('#ticker-label')) $('#ticker-label').innerHTML = `<i class="fas fa-tag"></i> ${t.ticker_label}`;

  if ($('#products-section-title')) $('#products-section-title').innerHTML = `<i class="fas fa-drumstick-bite"></i> ${t.products_title}`;
  if ($('#cart-header-title')) $('#cart-header-title').textContent = t.cart_header_title;
  if ($('#cart-empty-msg')) $('#cart-empty-msg').innerHTML = t.cart_empty_msg;
  if ($('#specs-heading')) $('#specs-heading').textContent = t.cutting_heading;
  if ($('#notes-label')) $('#notes-label').textContent = t.notes_label;
  if ($('#order-notes')) $('#order-notes').placeholder = t.notes_placeholder;
  if ($('#delivery-heading')) $('#delivery-heading').textContent = t.delivery_heading;
  if ($('#label-name')) $('#label-name').textContent = t.label_name;
  if ($('#customer-name')) $('#customer-name').placeholder = t.name_placeholder;
  if ($('#label-phone')) $('#label-phone').textContent = t.label_phone;
  if ($('#customer-phone')) $('#customer-phone').placeholder = t.phone_placeholder;
  if ($('#label-address')) $('#label-address').textContent = t.label_address;
  if ($('#customer-address')) $('#customer-address').placeholder = t.address_placeholder;
  if ($('#detect-btn-text')) $('#detect-btn-text').textContent = t.detect_btn;
  if ($('#cart-total-label')) $('#cart-total-label').textContent = t.total_amount;
  if ($('#whatsapp-btn-text')) $('#whatsapp-btn-text').textContent = t.order_whatsapp;
  if ($('#clear-cart-text')) $('#clear-cart-text').textContent = t.clear_cart;
  if ($('#floating-view-cart-label')) $('#floating-view-cart-label').textContent = t.view_cart_btn;

  if ($('#about-title')) $('#about-title').textContent = t.about_title;
  if ($('#about-subtitle')) $('#about-subtitle').textContent = t.about_subtitle;
  if ($('#trust-1-title')) $('#trust-1-title').textContent = t.trust_1_title;
  if ($('#trust-1-desc')) $('#trust-1-desc').textContent = t.trust_1_desc;
  if ($('#trust-2-title')) $('#trust-2-title').textContent = t.trust_2_title;
  if ($('#trust-2-desc')) $('#trust-2-desc').textContent = t.trust_2_desc;
  if ($('#trust-3-title')) $('#trust-3-title').textContent = t.trust_3_title;
  if ($('#trust-3-desc')) $('#trust-3-desc').textContent = t.trust_3_desc;
  if ($('#trust-4-title')) $('#trust-4-title').textContent = t.trust_4_title;
  if ($('#trust-4-desc')) $('#trust-4-desc').textContent = t.trust_4_desc;
  if ($('#reviews-title')) $('#reviews-title').innerHTML = `<i class="fas fa-star"></i> ${t.reviews_title}`;
  if ($('#bulk-title')) $('#bulk-title').textContent = t.bulk_title;
  if ($('#bulk-subtitle')) $('#bulk-subtitle').textContent = t.bulk_subtitle;
  if ($('#bulk-btn-text')) $('#bulk-btn-text').textContent = t.bulk_btn;
  if ($('#loading-text')) $('#loading-text').textContent = t.loading_text;

  // Cutting preferences label update
  $$('.spec-checkbox').forEach(box => {
    const span = box.querySelector('.spec-label');
    if (span) {
      span.textContent = lang === 'te' ? span.dataset.te : span.dataset.en;
    }
  });

  // Category Pills text update
  $$('.category-pill').forEach(pill => {
    const cat = pill.dataset.category;
    if (CATEGORIES_TRANSLATION[cat]) {
      pill.textContent = CATEGORIES_TRANSLATION[cat][lang] || CATEGORIES_TRANSLATION[cat].en;
    }
  });

  updateShopStatus();
  updateContactUI();
  renderStorefrontOffers();
  renderProducts();
  renderRatesTicker();
  updateCartUI();
}

function toggleLanguage() {
  const nextLang = currentLang === 'en' ? 'te' : 'en';
  applyLanguage(nextLang);
  showToast(nextLang === 'te' ? 'భాష: తెలుగు' : 'Language: English', 'success');
}

// ── API Helpers (with timeout for fast failure) ───────
async function apiFetch(url, options = {}, timeout = 4000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(API_BASE + url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options
    });
    clearTimeout(timeoutId);
    return await res.json();
  } catch (e) {
    console.error('API Error:', url, e.message);
    throw e;
  }
}

// ── Load Products (called for admin refresh, not on initial load) ──
async function loadProducts() {
  try {
    const data = await apiFetch('/api/products');
    if (Array.isArray(data) && data.length > 0) {
      allProducts = data;
      localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(data));
    } else {
      allProducts = getDemoProducts();
    }
  } catch (e) {
    if (!allProducts || allProducts.length === 0) allProducts = getDemoProducts();
  }
  renderProducts();
  renderRatesTicker();
}

function getDemoProducts() {
  return [
    { _id: 'd1', name: 'Full Chicken', nameTelugu: 'పూర్తి కోడి', category: 'whole', pricePerKg: 220, unit: 'kg', image: '/images/full_chicken.svg', description: 'Fresh whole chicken with skin. Best for rich curries.', descriptionTelugu: 'తాజా పూర్తి కోడి. కర్రీలకు ఎంతో రుచికరం.', inStock: true, displayOrder: 1 },
    { _id: 'd2', name: 'Skinless Chicken', nameTelugu: 'చర్మం లేని కోడి', category: 'skinless', pricePerKg: 240, unit: 'kg', image: '/images/full_chicken.svg', description: 'Fresh tender chicken without skin. Lean and healthy.', descriptionTelugu: 'చర్మం తీసివేసిన తాజా కోడి. ఆరోగ్యకరం.', inStock: true, displayOrder: 2 },
    { _id: 'd3', name: 'Boneless Chicken', nameTelugu: 'ఎముక లేని కోడి', category: 'boneless', pricePerKg: 320, unit: 'kg', image: '/images/boneless.svg', description: 'Pure boneless tender breast meat. Ideal for fry & tikka.', descriptionTelugu: 'స్వచ్ఛమైన ఎముక లేని చికెన్. ఫ్రై మరియు టిక్కా కోసం.', inStock: true, displayOrder: 3 },
    { _id: 'd4', name: 'Chicken Liver', nameTelugu: 'కోడి కాలేయం', category: 'liver', pricePerKg: 120, unit: 'kg', image: '/images/liver.svg', description: 'Fresh chicken liver, rich in natural iron and nutrients.', descriptionTelugu: 'తాజా కోడి కాలేయం. పోషకాలు మరియు ఐరన్ సమృద్ధిగా.', inStock: true, displayOrder: 4 },
    { _id: 'd5', name: 'Chicken Wings', nameTelugu: 'కోడి రెక్కలు', category: 'wings', pricePerKg: 180, unit: 'kg', image: '/images/wings.svg', description: 'Juicy chicken wings with skin. Perfect for crispy fry.', descriptionTelugu: 'రుచికరమైన కోడి రెక్కలు. క్రిస్పీ ఫ్రైకి అనుకూలం.', inStock: true, displayOrder: 5 },
    { _id: 'd6', name: 'Chicken Legs (Drumsticks)', nameTelugu: 'కోడి కాళ్ళు (డ్రమ్‌స్టిక్స్)', category: 'legs', pricePerKg: 200, unit: 'kg', image: '/images/legs.svg', description: 'Meaty tender chicken drumsticks, great for tandoor.', descriptionTelugu: 'మాంసంతో కూడిన కోడి కాళ్ళు. తందూరి మరియు బిర్యానీ కోసం.', inStock: true, displayOrder: 6 },
    { _id: 'd7', name: 'Chicken Keema', nameTelugu: 'కోడి కీమా', category: 'keema', pricePerKg: 340, unit: 'kg', image: '/images/keema.svg', description: 'Freshly minced premium boneless chicken. Ready to cook.', descriptionTelugu: 'తాజాగా గ్రైండ్ చేసిన కోడి కీమా.', inStock: true, displayOrder: 7 },
    { _id: 'd8', name: 'Chicken Gizzard', nameTelugu: 'కోడి గిజ్జర్డ్', category: 'gizzard', pricePerKg: 100, unit: 'kg', image: '/images/liver.svg', description: 'Cleaned and hygienically processed chicken gizzards.', descriptionTelugu: 'బాగా శుభ్రం చేసిన కోడి గిజ్జర్డ్ ముక్కలు.', inStock: true, displayOrder: 8 },
    { _id: 'd9', name: 'Chicken Curry Cut', nameTelugu: 'కోడి కర్రీ కట్', category: 'currycut', pricePerKg: 230, unit: 'kg', image: '/images/full_chicken.svg', description: 'Evenly cut medium pieces, ideal for home chicken curry.', descriptionTelugu: 'ఇంటి కర్రీ కోసం సమానంగా కట్ చేసిన ముక్కలు.', inStock: true, displayOrder: 9 },
    { _id: 'd10', name: 'Chicken Breast', nameTelugu: 'కోడి రొమ్ము', category: 'breast', pricePerKg: 360, unit: 'kg', image: '/images/boneless.svg', description: 'Clean lean chicken breast fillet. High protein diet cut.', descriptionTelugu: 'అధిక ప్రోటీన్ కలిగిన తాజా కోడి రొమ్ము ముక్కలు.', inStock: true, displayOrder: 10 },
    { _id: 'd11', name: 'Chicken Feet', nameTelugu: 'కోడి పాదాలు', category: 'feet', pricePerKg: 80, unit: 'kg', image: '/images/legs.svg', description: 'Cleaned, pre-washed fresh chicken feet for soup.', descriptionTelugu: 'శుభ్రం చేసిన కోడి పాదాలు. సూప్ కొరకు.', inStock: false, displayOrder: 11 },
    { _id: 'd12', name: 'Chicken Heart', nameTelugu: 'కోడి గుండె', category: 'heart', pricePerKg: 110, unit: 'kg', image: '/images/liver.svg', description: 'Fresh chicken heart portions. Nutritious and flavorful.', descriptionTelugu: 'తాజా కోడి గుండె భాగాలు. ఎంతో బలవర్ధకమైనవి.', inStock: true, displayOrder: 12 }
  ];
}

// ── Load Settings (called for admin refresh, not on initial load) ──
async function loadSettings() {
  try {
    const data = await apiFetch('/api/admin/settings');
    shopSettings = { ...shopSettings, ...data };
    localStorage.setItem(CACHED_SETTINGS_KEY, JSON.stringify(data));
  } catch (e) {
    // using defaults
  }
  updateShopStatus();
  updateAnnouncement();
}

function updateShopStatus() {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  if (shopSettings.shopOpen) {
    shopStatusEl.className = 'shop-status open';
    shopStatusText.textContent = t.shop_open;
    document.body.classList.remove('shop-closed-mode');
  } else {
    shopStatusEl.className = 'shop-status closed';
    shopStatusText.textContent = t.shop_closed;
    document.body.classList.add('shop-closed-mode');
  }
  if (shopSettings.shopAddress) {
    const footerAddr = $('#footer-address');
    if (footerAddr) {
      footerAddr.textContent = shopSettings.shopAddress;
      footerAddr.href = shopSettings.shopAddress === DEFAULT_SHOP_ADDRESS
        ? DEFAULT_SHOP_MAP_URL
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopSettings.shopAddress)}`;
    }
  }
}

function updateAnnouncement() {
  const bar = $('#announcement-bar');
  const text = $('#announcement-text');
  if (shopSettings.shopMessage && shopSettings.shopMessage.trim()) {
    text.textContent = shopSettings.shopMessage;
    bar.style.display = 'block';
  } else {
    bar.style.display = 'none';
  }
}

function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function toWaNumber(value) {
  let d = digitsOnly(value);
  if (d.length === 10) d = '91' + d;
  if (d.length === 11 && d.startsWith('0')) d = '91' + d.slice(1);
  return d;
}

function formatInPhone(value) {
  const d = digitsOnly(value);
  const ten = d.length >= 10 ? d.slice(-10) : d;
  if (ten.length === 10) return `+91 ${ten.slice(0, 5)} ${ten.slice(5)}`;
  return value || '';
}

function getDisplayPhone() {
  return shopSettings.shopPhone || DEFAULT_DISPLAY_PHONE;
}

function getOrderPhone() {
  return shopSettings.orderPhone || DEFAULT_ORDER_PHONE;
}

function updateContactUI() {
  const display = formatInPhone(getDisplayPhone());
  $$('.js-display-phone').forEach(el => {
    el.textContent = display;
  });
  const wa = toWaNumber(getOrderPhone());
  $$('.js-order-wa').forEach(el => {
    const href = el.getAttribute('href') || '';
    const textMatch = href.match(/[?&]text=([^&]*)/);
    const text = textMatch ? decodeURIComponent(textMatch[1]) : 'Hi, I want to order fresh chicken';
    el.setAttribute('href', `https://wa.me/${wa}?text=${encodeURIComponent(text)}`);
  });
  const footerBrand = $('#footer-brand-title');
  if (footerBrand) footerBrand.textContent = currentLang === 'te' ? '👑 జ్యోతి ఫ్రెష్ చికెన్' : '👑 Jyothi Fresh Chicken';
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function productImageSrc(p) {
  const src = (p && p.image) ? p.image : '/images/full_chicken.svg';
  if (src.startsWith('data:') || src.startsWith('blob:')) return src;
  const v = p.imageVersion || p.updatedAt || '';
  if (!v) return src;
  return src + (src.includes('?') ? '&' : '?') + 'v=' + encodeURIComponent(v);
}

function flashSaveButton(btn, ok = true) {
  if (!btn) return;
  if (!btn.dataset.originalLabel) btn.dataset.originalLabel = btn.innerHTML;
  const original = btn.dataset.originalLabel;
  btn.classList.add('btn-clicked-success');
  btn.innerHTML = ok
    ? '<i class="fas fa-check"></i> Saved!'
    : '<i class="fas fa-times"></i> Failed';
  btn.disabled = true;
  setTimeout(() => {
    btn.classList.remove('btn-clicked-success');
    btn.innerHTML = original;
    btn.disabled = false;
  }, 2000);
}

function getDefaultOffers() {
  return Object.keys(OFFER_TEMPLATES).map((key, i) => {
    const t = OFFER_TEMPLATES[key];
    return {
      _id: 'of-' + key,
      template: key,
      discount: t.discount,
      text: t.text,
      textTelugu: t.textTe,
      description: t.desc,
      descriptionTelugu: t.descTe,
      emoji: t.emoji,
      active: true,
      displayOrder: i + 1
    };
  });
}

function renderStorefrontOffers() {
  const track = $('#offers-track');
  const dotsWrap = $('#offers-dots');
  if (!track) return;

  const source = Array.isArray(allOffers) && allOffers.length ? allOffers : getDefaultOffers();
  const offers = source.filter(o => o.active !== false).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  const list = offers.length ? offers : getDefaultOffers();

  track.innerHTML = list.map(o => {
    const tpl = OFFER_TEMPLATES[o.template] || OFFER_TEMPLATES.dussehra;
    const title = (currentLang === 'te' && o.textTelugu) ? o.textTelugu : (o.text || tpl.text);
    const desc = (currentLang === 'te' && o.descriptionTelugu) ? o.descriptionTelugu : (o.description || tpl.desc);
    const badge = `${o.emoji || tpl.emoji} ${(currentLang === 'te' ? tpl.labelTe : tpl.label).toUpperCase()}`;
    const discount = o.discount || tpl.discount;
    return `
      <div class="bb-offer-card tpl-${o.template || 'dussehra'}">
        <div class="bb-offer-top">
          <span class="bb-card-badge">${badge}</span>
          <span class="bb-discount-pill">${discount}</span>
        </div>
        <div class="bb-offer-body">
          <h3 class="bb-card-title">${title}</h3>
          <p class="bb-card-desc">${desc}</p>
        </div>
        <div class="bb-offer-footer">
          <span class="bb-coupon-tag"><i class="fas fa-tag"></i> ${currentLang === 'te' ? 'పండుగ ఆఫర్' : 'FESTIVAL OFFER'}</span>
          <a href="#products-grid" class="bb-action-btn">${currentLang === 'te' ? 'షాప్ చేయండి' : 'Shop Now'} <i class="fas fa-arrow-right"></i></a>
        </div>
      </div>
    `;
  }).join('');

  if (dotsWrap) {
    dotsWrap.innerHTML = list.map((_, i) => `<span class="bb-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('');
  }
  initOffersCarousel();
}

// ── Rates Ticker ──────────────────────────────────────
function renderRatesTicker() {
  const ticker = $('#rates-ticker-content');
  if (!ticker || allProducts.length === 0) return;

  const inStockProducts = allProducts.filter(p => p.inStock);
  const items = [...inStockProducts, ...inStockProducts];

  ticker.innerHTML = items.map(p => {
    // Strict language display: English name if EN, Telugu name if TE
    const displayName = currentLang === 'te' && p.nameTelugu ? p.nameTelugu : p.name;
    const unitLabel = currentLang === 'te' ? (p.unit === 'kg' ? 'కిలో' : 'పీస్') : p.unit;
    return `
      <span class="rate-item">
        <span class="rate-name">${displayName}</span>
        <span class="rate-price">₹${p.pricePerKg}/${unitLabel}</span>
        <span class="rate-separator">●</span>
      </span>
    `;
  }).join('');
}

// ── Render Products ───────────────────────────────────
function renderProducts() {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  let filtered = allProducts;

  // Category filter
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.nameTelugu || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.descriptionTelugu || '').toLowerCase().includes(q)
    );
  }

  const countBadge = $('#products-count-badge');
  if (countBadge) {
    countBadge.textContent = t.items_count.replace('{count}', filtered.length);
  }

  if (filtered.length === 0) {
    productsGrid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--text-muted);">
        <div style="font-size:3rem;margin-bottom:14px;">🔍</div>
        <p style="font-size:1.1rem;font-weight:600;color:var(--text-primary);">${currentLang === 'te' ? 'ఉత్పత్తులు ఏవీ కనుగొనబడలేదు' : 'No products found'}</p>
        <p style="font-size:0.85rem;margin-top:6px;">${currentLang === 'te' ? 'మరొక వర్గం లేదా సెర్చ్ పదాన్ని ప్రయత్నించండి' : 'Try a different category or search term'}</p>
      </div>
    `;
    return;
  }

  productsGrid.innerHTML = filtered.map((p, i) => {
    const isKg = p.unit === 'kg';
    const defaultQty = isKg ? 0.5 : 1;
    const step = isKg ? 0.25 : 1;
    const minQty = isKg ? 0.25 : 1;

    // Strict Language Rendering Requirement:
    const productName = (currentLang === 'te' && p.nameTelugu) ? p.nameTelugu : p.name;
    const productDesc = (currentLang === 'te' && p.descriptionTelugu) ? p.descriptionTelugu : (p.description || '');
    const isShopClosed = !shopSettings.shopOpen;
    const isDisabled = isShopClosed || !p.inStock;

    const stockStatusText = isShopClosed
      ? (currentLang === 'te' ? '● షాప్ మూసివేయబడింది' : '● Shop Closed')
      : (p.inStock ? t.in_stock : t.out_of_stock);

    const buttonText = isShopClosed
      ? (currentLang === 'te' ? 'షాప్ మూసివేయబడింది' : 'Shop Closed')
      : (p.inStock ? t.add_to_cart : t.out_of_stock_btn);

    const unitText = currentLang === 'te' ? (p.unit === 'kg' ? 'కిలో' : 'పీస్') : p.unit;

    return `
      <div class="product-card ${!p.inStock ? 'out-of-stock' : ''} ${isShopClosed ? 'shop-closed-card' : ''}" data-id="${p._id}" onclick="buyNow('${p._id}')">
        <div class="product-card-image">
          <img src="${productImageSrc(p)}" alt="${productName}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22><rect fill=%22%231A1A2E%22 width=%22400%22 height=%22300%22/><text x=%22200%22 y=%22160%22 text-anchor=%22middle%22 fill=%22%234A4A5A%22 font-size=%2260%22>🍗</text></svg>'">
          <span class="stock-badge ${isShopClosed ? 'shop-closed-badge' : (p.inStock ? 'in-stock' : 'out-of-stock-badge')}">${stockStatusText}</span>
        </div>
        <div class="product-card-body">
          <div class="product-name ${currentLang === 'te' ? 'telugu-font' : ''}">${productName}</div>
          <p class="product-description">${productDesc}</p>
          <div class="price-tag">
            <span class="price-symbol">₹</span>
            <span class="price-amount">${p.pricePerKg}</span>
            <span class="price-unit">/ ${unitText}</span>
          </div>
          <div class="quantity-control" onclick="event.stopPropagation()">
            <button class="qty-btn" onclick="event.stopPropagation(); changeQty('${p._id}', -${step})" ${isDisabled ? 'disabled' : ''} aria-label="Decrease quantity">
              <i class="fas fa-minus"></i>
            </button>
            <input type="number" class="qty-input" id="qty-${p._id}" value="${defaultQty}" min="${minQty}" step="${step}" ${isDisabled ? 'disabled' : ''} aria-label="Quantity">
            <button class="qty-btn" onclick="event.stopPropagation(); changeQty('${p._id}', ${step})" ${isDisabled ? 'disabled' : ''} aria-label="Increase quantity">
              <i class="fas fa-plus"></i>
            </button>
            <span class="qty-unit">${unitText}</span>
          </div>
          <button class="add-to-cart-btn" onclick="event.stopPropagation(); buyNow('${p._id}')" ${isDisabled ? 'disabled' : ''}>
            <i class="fas ${isShopClosed ? 'fa-store-slash' : 'fa-bolt'}"></i> ${buttonText}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// ── Quantity Controls ─────────────────────────────────
function buyNow(id) {
  addToCart(id);
}

function changeQty(id, delta) {
  const input = document.getElementById('qty-' + id);
  if (!input) return;
  const product = allProducts.find(p => p._id === id);
  const minQty = product && product.unit === 'kg' ? 0.25 : 1;
  let val = parseFloat(input.value) + delta;
  val = Math.max(minQty, Math.round(val * 100) / 100);
  input.value = val;
}

// ── Cart Management ───────────────────────────────────
function addToCart(id) {
  if (!shopSettings.shopOpen) {
    showToast(currentLang === 'te' ? 'షాప్ ప్రస్తుతం మూసివేయబడింది' : 'Shop is currently closed. Ordering paused.', 'error');
    return;
  }
  const product = allProducts.find(p => p._id === id);
  if (!product || !product.inStock) {
    showToast(currentLang === 'te' ? 'ఈ ఉత్పత్తి ప్రస్తుతం స్టాక్‌లో లేదు' : 'This product is out of stock', 'error');
    return;
  }

  const qtyInput = document.getElementById('qty-' + id);
  const qty = parseFloat(qtyInput ? qtyInput.value : (product.unit === 'kg' ? 0.5 : 1));

  const existing = cart.find(item => item.productId === id);
  if (existing) {
    existing.quantity = Math.round((existing.quantity + qty) * 100) / 100;
    existing.subtotal = existing.quantity * existing.pricePerKg;
  } else {
    cart.push({
      productId: id,
      name: product.name,
      nameTelugu: product.nameTelugu || '',
      pricePerKg: product.pricePerKg,
      quantity: qty,
      unit: product.unit,
      subtotal: qty * product.pricePerKg
    });
  }

  saveCart();
  updateCartUI();
  openCart();

  const displayName = (currentLang === 'te' && product.nameTelugu) ? product.nameTelugu : product.name;
  showToast(`${displayName} ${currentLang === 'te' ? 'చెక్‌అవుట్‌కు వెళ్లారు!' : 'ready for checkout!'}`, 'success');

  // Trigger bounce effect on cart icon
  cartCount.classList.remove('hidden');
  cartCount.classList.add('bounce');
  setTimeout(() => cartCount.classList.remove('bounce'), 400);
}

function updateCartItemQty(productId, delta) {
  const item = cart.find(i => i.productId === productId);
  if (!item) return;
  const minQty = item.unit === 'kg' ? 0.25 : 1;
  item.quantity = Math.max(minQty, Math.round((item.quantity + delta) * 100) / 100);
  item.subtotal = item.quantity * item.pricePerKg;
  saveCart();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.productId !== productId);
  saveCart();
  updateCartUI();
  showToast(currentLang === 'te' ? 'ఐటెమ్ తొలగించబడింది' : 'Item removed from cart', 'info');
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  showToast(currentLang === 'te' ? 'కార్ట్ ఖాళీ చేయబడింది' : 'Cart cleared', 'info');
}

function saveCart() {
  localStorage.setItem('jc_cart', JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.subtotal, 0);
}

function updateCartUI() {
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const count = cart.length;
  const total = getCartTotal();

  // Header and nav badges
  cartCount.textContent = count;
  cartHeaderCount.textContent = count;
  if (count > 0) {
    cartCount.classList.remove('hidden');
  } else {
    cartCount.classList.add('hidden');
  }

  // Cart total text
  cartTotalAmount.textContent = '₹' + total.toFixed(0);

  // Enable WhatsApp only when cart has items AND delivery location is filled
  whatsappBtn.disabled = count === 0 || !hasRequiredDeliveryLocation();

  // Floating Bottom Cart Bar Updates (User Requirement)
  if (floatingCartBar) {
    if (count > 0) {
      floatingCartBar.classList.remove('hidden');
      if (floatingCartCount) floatingCartCount.textContent = count;
      if (floatingCartTotal) floatingCartTotal.textContent = '₹' + total.toFixed(0);
      if (floatingCartItemsText) {
        const itemWord = count === 1 ? t.item_singular : t.item_plural;
        floatingCartItemsText.textContent = t.items_in_cart.replace('{count}', count).replace('{items}', itemWord);
      }
    } else {
      floatingCartBar.classList.add('hidden');
    }
  }

  // Cart Items List
  if (count === 0) {
    cartItemsContainer.innerHTML = '';
    cartEmpty.style.display = 'flex';
  } else {
    cartEmpty.style.display = 'none';
    const step = (u) => u === 'kg' ? 0.25 : 1;
    cartItemsContainer.innerHTML = cart.map(item => {
      const displayName = (currentLang === 'te' && item.nameTelugu) ? item.nameTelugu : item.name;
      const unitText = currentLang === 'te' ? (item.unit === 'kg' ? 'కిలో' : 'పీస్') : item.unit;
      return `
        <div class="cart-item" data-id="${item.productId}">
          <div class="cart-item-info">
            <div class="cart-item-name ${currentLang === 'te' ? 'telugu-font' : ''}">${displayName}</div>
            <div class="cart-item-meta">${item.quantity} ${unitText} × ₹${item.pricePerKg}/${unitText}</div>
          </div>
          <div class="cart-item-actions">
            <button class="qty-btn" onclick="updateCartItemQty('${item.productId}', -${step(item.unit)})" aria-label="Reduce"><i class="fas fa-minus"></i></button>
            <span class="qty-display">${item.quantity}</span>
            <button class="qty-btn" onclick="updateCartItemQty('${item.productId}', ${step(item.unit)})" aria-label="Increase"><i class="fas fa-plus"></i></button>
          </div>
          <div class="cart-item-price">₹${item.subtotal.toFixed(0)}</div>
          <button class="cart-item-remove" onclick="removeFromCart('${item.productId}')" aria-label="Remove item"><i class="fas fa-trash-alt"></i></button>
        </div>
      `;
    }).join('');
  }
}

// ── Cart Drawer Open & Close (Flawless Scrolling) ─────
function openCart() {
  cartDrawer.classList.add('active');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('active');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ── Geolocation & Direct Navigation Links ────────────
function detectLocation() {
  if (!navigator.geolocation) {
    showToast(currentLang === 'te' ? 'లొకేషన్ మీ బ్రౌజర్‌లో సపోర్ట్ చేయదు' : 'Geolocation is not supported by your browser', 'error');
    return;
  }

  const btn = $('#detect-location-btn');
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${t.detecting_btn}</span>`;
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      currentCoords = { lat: latitude, lng: longitude };

      const badge = $('#location-status-badge');
      if (badge) {
        badge.style.display = 'flex';
        badge.innerHTML = `<i class="fas fa-check-circle"></i> GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      }

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
        const data = await res.json();
        if (data && data.display_name) {
          $('#customer-address').value = data.display_name;
          showToast(currentLang === 'te' ? 'లొకేషన్ విజయవంతంగా గుర్తించబడింది!' : 'GPS Location detected successfully!', 'success');
        } else {
          $('#customer-address').value = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          showToast('GPS coordinates recorded', 'success');
        }
      } catch (e) {
        $('#customer-address').value = `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        showToast('GPS coordinates saved', 'info');
      }

      btn.innerHTML = `<i class="fas fa-location-crosshairs"></i> <span>${t.detect_btn}</span>`;
      btn.disabled = false;
      updateCartUI();
    },
    (err) => {
      showToast(currentLang === 'te' ? 'లొకేషన్ గుర్తించలేకపోయాము. దయచేసి టైప్ చేయండి.' : 'Could not detect GPS location. Please enter manually.', 'error');
      btn.innerHTML = `<i class="fas fa-location-crosshairs"></i> <span>${t.detect_btn}</span>`;
      btn.disabled = false;
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
  );
}

// ── WhatsApp Order (With Direct Google Maps Navigation) ─
async function placeOrder() {
  const name = $('#customer-name').value.trim();
  const phone = $('#customer-phone').value.trim();
  const address = $('#customer-address').value.trim();

  if (cart.length === 0) {
    showToast(currentLang === 'te' ? 'మీ కార్ట్ ఖాళీగా ఉంది!' : 'Your cart is empty!', 'error');
    return;
  }
  if (!name) {
    showToast(currentLang === 'te' ? 'దయచేసి మీ పేరును నమోదు చేయండి' : 'Please enter your name', 'error');
    $('#customer-name').focus();
    return;
  }
  if (!phone || phone.length < 10) {
    showToast(currentLang === 'te' ? 'దయచేసి సరైన ఫోన్ నంబర్ నమోదు చేయండి' : 'Please enter a valid 10-digit phone number', 'error');
    $('#customer-phone').focus();
    return;
  }
  if (!address) {
    showToast(currentLang === 'te' ? 'దయచేసి డెలివరీ లొకేషన్ నమోదు చేయండి లేదా GPS గుర్తించండి' : 'Delivery location is required. Enter your address or detect GPS.', 'error');
    $('#customer-address').focus();
    return;
  }

  // Gather cutting preferences
  const specs = [];
  $$('.spec-checkbox input:checked').forEach(cb => specs.push(cb.value));

  const notes = $('#order-notes').value.trim();
  const total = getCartTotal();

  // Construct Direct Google Maps Navigation Links
  let mapsNavUrl = '';
  let mapsPinUrl = '';
  if (currentCoords && currentCoords.lat && currentCoords.lng) {
    mapsNavUrl = `https://www.google.com/maps/dir/?api=1&destination=${currentCoords.lat},${currentCoords.lng}`;
    mapsPinUrl = `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`;
  } else if (address) {
    mapsNavUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  // Build WhatsApp Message with Rich Formatting & Direct Navigation Link
  let msg = `🐔 *JYOTHI CHICKEN CENTER*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *NEW CUSTOMER ORDER*\n\n`;
  msg += `👤 *Customer Name:* ${name}\n`;
  msg += `📱 *Customer Phone:* ${phone}\n`;
  if (address) msg += `📍 *Delivery Address:* ${address}\n`;

  if (mapsNavUrl) {
    msg += `\n🗺️ *DIRECT NAVIGATION TO HOUSE (Click to Navigate):*\n${mapsNavUrl}\n`;
    if (mapsPinUrl) {
      msg += `📌 *Pin Location:* ${mapsPinUrl}\n`;
    }
  }

  msg += `\n🛒 *Ordered Items:*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;

  cart.forEach((item, i) => {
    msg += `${i + 1}. *${item.name}* ${item.nameTelugu ? `(${item.nameTelugu})` : ''}\n`;
    msg += `   ${item.quantity} ${item.unit} × ₹${item.pricePerKg} = *₹${item.subtotal.toFixed(0)}*\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 *Total Amount to Pay: ₹${total.toFixed(0)}*\n\n`;

  if (specs.length > 0) {
    msg += `🔪 *Cutting Preferences:*\n`;
    specs.forEach(s => msg += `  ✅ ${s}\n`);
    msg += `\n`;
  }

  if (notes) {
    msg += `📝 *Customer Notes:*\n${notes}\n\n`;
  }

  msg += `🙏 Please confirm delivery time!`;

  // Save order to backend / in-memory store
  try {
    const orderData = {
      customerName: name,
      customerPhone: phone,
      deliveryAddress: address,
      coordinates: currentCoords,
      items: cart,
      specifications: specs,
      notes: notes,
      totalAmount: total
    };
    await apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  } catch (e) {
    // offline or backend fallback handled
  }

  // Open WhatsApp only — clicking this is NOT an order confirmation
  const whatsappNumber = toWaNumber(getOrderPhone());
  const waURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(waURL, '_blank');
}

function hasRequiredDeliveryLocation() {
  const addressEl = $('#customer-address');
  return !!(addressEl && addressEl.value.trim());
}

function hideBookingModal() {}

// ── Toast Notifications ───────────────────────────────
function showToast(message, type = 'info') {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// ── Loading (instant dismiss) ─────────────────────────
function hideLoading() {
  loadingOverlay.classList.add('hidden');
  setTimeout(() => {
    loadingOverlay.style.display = 'none';
  }, 300);
}

// ── Search (Debounced) ────────────────────────────────
let searchTimeout;
function handleSearch(value) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchQuery = value;
    renderProducts();
  }, 200);
}

// ── Hero Canvas Particle Animation ───────────────────
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  const emojis = ['🍗', '🐔', '✨', '🔥', '⭐'];

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = -20;
      this.size = 12 + Math.random() * 14;
      this.speed = 0.25 + Math.random() * 0.7;
      this.emoji = emojis[Math.floor(Math.random() * emojis.length)];
      this.opacity = 0.12 + Math.random() * 0.25;
      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 0.01 + Math.random() * 0.02;
    }
    update() {
      this.y += this.speed;
      this.wobble += this.wobbleSpeed;
      this.x += Math.sin(this.wobble) * 0.4;
      if (this.y > canvas.height + 20) this.reset();
    }
    draw() {
      ctx.globalAlpha = this.opacity;
      ctx.font = `${this.size}px serif`;
      ctx.fillText(this.emoji, this.x, this.y);
    }
  }

  for (let i = 0; i < 14; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    ctx.globalAlpha = 1;
    requestAnimationFrame(animate);
  }
  animate();
}

// ── Testimonials Carousel ─────────────────────────────
let testimonialIndex = 0;
let testimonialInterval;

function initTestimonialsCarousel() {
  const cards = $$('.testimonial-card');
  const dots = $$('.testimonial-dots .dot');
  if (cards.length === 0) return;

  testimonialInterval = setInterval(() => {
    testimonialIndex = (testimonialIndex + 1) % cards.length;
    showTestimonial(testimonialIndex);
  }, 5000);

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      testimonialIndex = parseInt(dot.dataset.index);
      showTestimonial(testimonialIndex);
      clearInterval(testimonialInterval);
      testimonialInterval = setInterval(() => {
        testimonialIndex = (testimonialIndex + 1) % cards.length;
        showTestimonial(testimonialIndex);
      }, 5000);
    });
  });
}

function showTestimonial(index) {
  const cards = $$('.testimonial-card');
  const dots = $$('.testimonial-dots .dot');
  cards.forEach(c => c.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  if (cards[index]) cards[index].classList.add('active');
  if (dots[index]) dots[index].classList.add('active');
}

// ── Back to Top ───────────────────────────────────────
function initBackToTop() {
  const btn = $('#back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 350) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ── Floating Sticky Navbar on Scroll (User Requirement) ──
function initFloatingNavbar() {
  const header = $('#main-header') || $('.header');
  if (!header) return;
  const spacer = $('#header-spacer');

  const updateHeaderScroll = () => {
    const shouldFloat = window.scrollY > 24;
    if (shouldFloat) {
      if (!header.classList.contains('scrolled-floating') && spacer) {
        spacer.style.height = header.offsetHeight + 'px';
      }
      header.classList.add('scrolled-floating');
    } else {
      header.classList.remove('scrolled-floating');
      if (spacer) spacer.style.height = '0px';
    }
  };

  window.addEventListener('scroll', updateHeaderScroll, { passive: true });
  updateHeaderScroll();
}

// ── BigBasket Offers Carousel Sync (User Requirement) ────
function initOffersCarousel() {
  const track = document.getElementById('offers-track');
  const dots = document.querySelectorAll('.bb-dot');
  if (!track || dots.length === 0) return;

  track.addEventListener('scroll', () => {
    const cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth + 12 : 300;
    const index = Math.round(track.scrollLeft / cardWidth);
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }, { passive: true });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.index, 10);
      const cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth + 12 : 300;
      track.scrollTo({ left: idx * cardWidth, behavior: 'smooth' });
    });
  });
}

// ── Admin Panel & Stock Availability Toggle ───────────
function openAdmin() {
  adminPanel.classList.add('active');
  document.body.style.overflow = 'hidden';
  if (adminToken) {
    adminLogin.style.display = 'none';
    adminContent.classList.add('active');
    loadAdminData();
  }
}

function closeAdmin() {
  adminPanel.classList.remove('active');
  document.body.style.overflow = '';
}

async function adminLoginHandler(e) {
  e.preventDefault();
  const pwd = $('#admin-password').value;
  try {
    const res = await apiFetch('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: pwd })
    });
    if (res.success) {
      adminToken = res.token;
      sessionStorage.setItem('jc_admin_token', adminToken);
      adminLogin.style.display = 'none';
      adminContent.classList.add('active');
      showToast('Admin logged in successfully!', 'success');
      loadAdminData();
    } else {
      showToast('Incorrect password', 'error');
    }
  } catch (e) {
    showToast('Login failed. Please verify server status.', 'error');
  }
}

async function loadAdminData() {
  await loadAdminProducts();
  await loadAdminOrders();
  await loadAdminOffers();
  loadAdminSettings();
}

async function loadAdminProducts() {
  const tbody = $('#admin-products-list');
  if (!tbody) return;

  tbody.innerHTML = allProducts.map(p => `
    <tr>
      <td><img src="${productImageSrc(p)}" alt="${p.name}" style="width:48px;height:38px;object-fit:cover;border-radius:6px;" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 48 38%22><rect fill=%22%23222%22 width=%2248%22 height=%2238%22/><text x=%2224%22 y=%2224%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2216%22>🍗</text></svg>'"></td>
      <td style="color:var(--text-primary);font-weight:700;">${p.name}</td>
      <td class="telugu-font">${p.nameTelugu || '-'}</td>
      <td><span style="background:var(--bg-surface-elevated);padding:3px 8px;border-radius:6px;font-size:0.75rem;">${p.category}</span></td>
      <td style="color:var(--primary);font-weight:800;">₹${p.pricePerKg}</td>
      <td>
        <!-- Quick One-Click Stock Toggle Button (User Requirement) -->
        <button class="stock-toggle-btn ${p.inStock ? 'in-stock' : 'out-stock'}" onclick="toggleProductStock('${p._id}')" title="Click to switch status">
          <i class="fas ${p.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i>
          <span>${p.inStock ? 'In Stock' : 'Out of Stock'}</span>
        </button>
      </td>
      <td>
        <button class="admin-action-btn edit" onclick="openEditProduct('${p._id}')" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="admin-action-btn delete" onclick="deleteProduct('${p._id}')" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </td>
    </tr>
  `).join('');
}

// Quick Stock Toggle Handler
async function toggleProductStock(id) {
  const product = allProducts.find(p => p._id === id);
  if (!product) return;

  const newStockStatus = !product.inStock;
  product.inStock = newStockStatus;
  localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(allProducts));

  // Optimistic UI updates
  renderProducts();
  renderRatesTicker();
  loadAdminProducts();

  try {
    await fetch(API_BASE + `/api/products/${id}/toggle-stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminToken
      }
    });
  } catch (err) {
    // fallback
  }

  showToast(`${product.name} is now ${newStockStatus ? 'IN STOCK' : 'OUT OF STOCK / DISABLED'}`, newStockStatus ? 'success' : 'error');
}

// ── Admin Orders with Direct House Navigation ─────────
async function loadAdminOrders() {
  const container = $('#admin-orders-list');
  if (!container) return;
  try {
    const res = await fetch(API_BASE + '/api/orders', {
      headers: { 'Authorization': adminToken }
    });
    allOrders = await res.json();
    renderAdminOrders();
  } catch (e) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:20px;">Could not load orders.</p>';
  }
}

function renderAdminOrders() {
  const container = $('#admin-orders-list');
  if (!container) return;

  let orders = Array.isArray(allOrders) ? allOrders : [];
  orders = orders.slice(0, 10);
  if (orderFilter !== 'all') {
    orders = orders.filter(o => o.status === orderFilter);
  }

  if (orders.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:24px;text-align:center;">No orders found in this filter.</p>';
    return;
  }

  container.innerHTML = orders.map(o => {
    // Generate direct navigation link
    let navUrl = '';
    if (o.coordinates && o.coordinates.lat && o.coordinates.lng) {
      navUrl = `https://www.google.com/maps/dir/?api=1&destination=${o.coordinates.lat},${o.coordinates.lng}`;
    } else if (o.deliveryAddress) {
      navUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.deliveryAddress)}`;
    }

    return `
      <div class="order-card-box">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px;">
          <div>
            <strong style="font-size:1.05rem;color:var(--text-primary);">${o.customerName || 'Customer'}</strong>
            <span style="font-size:0.8rem;color:var(--text-muted);margin-left:8px;">${new Date(o.createdAt || Date.now()).toLocaleString()}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="order-status-badge ${o.status || 'pending'}">${(o.status || 'pending').toUpperCase()}</span>
            <select class="form-input" style="width:auto;padding:4px 8px;font-size:0.78rem;" onchange="updateOrderStatus('${o._id}', this.value)">
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
        </div>

        <div style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;">
          📱 <strong>Phone:</strong> <a href="tel:${o.customerPhone}" style="color:var(--primary);text-decoration:none;">${o.customerPhone || '-'}</a>
          <br>
          📍 <strong>Address:</strong> ${o.deliveryAddress || 'No address provided'}
        </div>

        <!-- Direct Clickable Google Maps Navigation Link (User Requirement) -->
        ${navUrl ? `
          <div style="margin: 10px 0;">
            <a href="${navUrl}" target="_blank" class="nav-to-customer-btn">
              <i class="fas fa-location-arrow"></i> Navigate to Customer's House (Google Maps)
            </a>
          </div>
        ` : ''}

        <div style="background:var(--bg-surface-elevated);border-radius:8px;padding:10px;margin-top:10px;font-size:0.82rem;">
          <div style="font-weight:700;margin-bottom:4px;color:var(--text-primary);">Order Items:</div>
          ${(o.items || []).map(it => `<div>• <strong>${it.name}</strong>: ${it.quantity} ${it.unit} × ₹${it.pricePerKg} = ₹${it.subtotal}</div>`).join('')}
        </div>

        ${o.specifications && o.specifications.length > 0 ? `<div style="margin-top:8px;font-size:0.78rem;color:var(--accent-green-dark);">🔪 <strong>Preferences:</strong> ${o.specifications.join(', ')}</div>` : ''}
        ${o.notes ? `<div style="margin-top:4px;font-size:0.78rem;color:var(--text-muted);">📝 <strong>Notes:</strong> ${o.notes}</div>` : ''}

        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;padding-top:10px;border-top:1px solid var(--border-subtle);">
          <span style="font-weight:800;color:var(--primary);font-size:1.1rem;font-family:'Outfit',sans-serif;">Total: ₹${o.totalAmount || 0}</span>
          <button class="admin-action-btn delete" onclick="deleteOrder('${o._id}')" title="Delete Order"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
    `;
  }).join('');
}

async function updateOrderStatus(orderId, status) {
  try {
    await fetch(API_BASE + `/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminToken
      },
      body: JSON.stringify({ status })
    });
    const order = allOrders.find(o => o._id === orderId);
    if (order) order.status = status;
    renderAdminOrders();
    showToast(`Order status updated to ${status}!`, 'success');
  } catch (e) {
    showToast('Failed to update order status', 'error');
  }
}

async function deleteOrder(orderId) {
  if (!confirm('Are you sure you want to delete this order?')) return;
  try {
    await fetch(API_BASE + `/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: { 'Authorization': adminToken }
    });
    allOrders = allOrders.filter(o => o._id !== orderId);
    renderAdminOrders();
    showToast('Order removed', 'success');
  } catch (e) {
    showToast('Failed to delete order', 'error');
  }
}

// ── Admin Settings ────────────────────────────────────
function loadAdminSettings() {
  const toggle = $('#shop-toggle');
  if (shopSettings.shopOpen) {
    toggle.classList.add('active');
  } else {
    toggle.classList.remove('active');
  }
  $('#settings-phone').value = shopSettings.shopPhone || '';
  if ($('#settings-order-phone')) $('#settings-order-phone').value = shopSettings.orderPhone || '';
  $('#settings-address').value = shopSettings.shopAddress || '';
  $('#settings-message').value = shopSettings.shopMessage || '';
}

async function saveSettings() {
  const shopOpen = $('#shop-toggle').classList.contains('active');
  const shopPhone = $('#settings-phone').value.trim();
  const orderPhone = ($('#settings-order-phone') && $('#settings-order-phone').value.trim()) || '';
  const shopAddress = $('#settings-address').value.trim();
  const shopMessage = $('#settings-message').value.trim();

  try {
    await fetch(API_BASE + '/api/admin/settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminToken
      },
      body: JSON.stringify({ shopOpen, shopPhone, orderPhone, shopAddress, shopMessage })
    });
    shopSettings = { ...shopSettings, shopOpen, shopPhone, orderPhone, shopAddress, shopMessage };
    updateShopStatus();
    updateAnnouncement();
    updateContactUI();
    showToast('Settings saved successfully!', 'success');
  } catch (e) {
    showToast('Failed to save settings', 'error');
  }
}

// ── Admin Offers CRUD ─────────────────────────────────
async function loadAdminOffers() {
  const container = $('#admin-offers-list');
  if (!container) return;
  try {
    const res = await fetch(API_BASE + '/api/offers/all', {
      headers: { 'Authorization': adminToken }
    });
    allOffers = await res.json();
  } catch (e) {
    allOffers = [];
  }
  renderAdminOffers();
}

function renderAdminOffers() {
  const container = $('#admin-offers-list');
  if (!container) return;

  if (!Array.isArray(allOffers) || allOffers.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted);padding:16px;text-align:center;">No offers yet. Add your first deal above!</p>';
    return;
  }

  container.innerHTML = allOffers.map(o => `
    <div class="order-card-box" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
      <div style="flex:1;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="font-size:1.3rem;">${o.emoji || '🔥'}</span>
          <strong style="color:var(--text-primary);font-size:0.95rem;">${o.text || ''}</strong>
        </div>
        ${o.textTelugu ? `<div class="telugu-font" style="font-size:0.82rem;color:var(--text-muted);margin-left:36px;">${o.textTelugu}</div>` : ''}
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;margin-left:36px;">Order: ${o.displayOrder || 0} · ${o.active !== false ? '✅ Active' : '❌ Inactive'}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="admin-action-btn ${o.active !== false ? 'edit' : 'delete'}" onclick="toggleOfferStatus('${o._id}')" title="${o.active !== false ? 'Deactivate' : 'Activate'}">
          <i class="fas ${o.active !== false ? 'fa-eye-slash' : 'fa-eye'}"></i>
        </button>
        <button class="admin-action-btn delete" onclick="deleteOffer('${o._id}')" title="Delete Offer">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  `).join('');
}

async function addOffer(e) {
  e.preventDefault();
  const text = $('#offer-text-input').value.trim();
  const textTelugu = $('#offer-text-te-input').value.trim();
  const emoji = $('#offer-emoji-input').value.trim() || '🔥';
  const displayOrder = parseInt($('#offer-order-input').value) || 0;
  const templateEl = document.querySelector('input[name="offer-template"]:checked');
  const template = templateEl ? templateEl.value : 'dussehra';
  const discount = ($('#offer-discount-input') && $('#offer-discount-input').value.trim()) || '';
  const description = ($('#offer-desc-input') && $('#offer-desc-input').value.trim()) || '';
  const descriptionTelugu = ($('#offer-desc-te-input') && $('#offer-desc-te-input').value.trim()) || '';

  if (!text) {
    showToast('Please enter offer text', 'error');
    return;
  }

  const offerData = {
    text, textTelugu, emoji, displayOrder, template, discount,
    description, descriptionTelugu, active: true
  };

  try {
    const res = await fetch(API_BASE + '/api/offers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminToken
      },
      body: JSON.stringify(offerData)
    });
    const newOffer = await res.json();
    allOffers.push(newOffer);
    showToast('New offer added!', 'success');
  } catch (err) {
    // Offline fallback
    offerData._id = 'of-' + Date.now();
    allOffers.push(offerData);
    showToast('Offer added locally (offline mode)', 'info');
  }

  // Reset form
  $('#offer-text-input').value = '';
  $('#offer-text-te-input').value = '';
  $('#offer-emoji-input').value = '🔥';
  $('#offer-order-input').value = '0';
  renderAdminOffers();
}

async function toggleOfferStatus(id) {
  const offer = allOffers.find(o => o._id === id);
  if (!offer) return;

  const newStatus = offer.active === false ? true : false;
  offer.active = newStatus;
  renderAdminOffers();

  try {
    await fetch(API_BASE + `/api/offers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': adminToken
      },
      body: JSON.stringify({ active: newStatus })
    });
  } catch (err) {
    // offline fallback already handled optimistically
  }
  showToast(`Offer ${newStatus ? 'activated' : 'deactivated'}`, newStatus ? 'success' : 'info');
}

async function deleteOffer(id) {
  if (!confirm('Delete this offer?')) return;
  try {
    await fetch(API_BASE + `/api/offers/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': adminToken }
    });
  } catch (err) {}
  allOffers = allOffers.filter(o => o._id !== id);
  renderAdminOffers();
  showToast('Offer deleted', 'success');
}

// ── Admin Product CRUD ────────────────────────────────
async function addProduct(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  formData.set('inStock', form.inStock.checked ? 'true' : 'false');

  try {
    const res = await fetch(API_BASE + '/api/products', {
      method: 'POST',
      headers: { 'Authorization': adminToken },
      body: formData
    });
    if (res.ok) {
      const createdProduct = await res.json().catch(() => null);
      if (createdProduct && createdProduct._id) {
        allProducts.push(createdProduct);
        localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(allProducts));
      } else {
        await loadProducts();
      }
      showToast('New product added!', 'success');
      form.reset();
      renderProducts();
      renderRatesTicker();
      loadAdminProducts();
    } else {
      // If API fails, add locally anyway
      const newProduct = {
        _id: 'd' + Date.now(),
        name: formData.get('name') || '',
        nameTelugu: formData.get('nameTelugu') || '',
        pricePerKg: Number(formData.get('pricePerKg')) || 0,
        category: formData.get('category') || 'whole',
        unit: formData.get('unit') || 'kg',
        displayOrder: Number(formData.get('displayOrder')) || 0,
        description: formData.get('description') || '',
        descriptionTelugu: formData.get('descriptionTelugu') || '',
        inStock: form.inStock.checked,
        image: '/images/full_chicken.svg'
      };
      allProducts.push(newProduct);
      localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(allProducts));
      showToast('Product added locally!', 'success');
      form.reset();
      renderProducts();
      renderRatesTicker();
      loadAdminProducts();
    }
  } catch (e) {
    // Network error: add locally with generated ID
    const newProduct = {
      _id: 'd' + Date.now(),
      name: formData.get('name') || '',
      nameTelugu: formData.get('nameTelugu') || '',
      pricePerKg: Number(formData.get('pricePerKg')) || 0,
      category: formData.get('category') || 'whole',
      unit: formData.get('unit') || 'kg',
      displayOrder: Number(formData.get('displayOrder')) || 0,
      description: formData.get('description') || '',
      descriptionTelugu: formData.get('descriptionTelugu') || '',
      inStock: form.inStock.checked,
      image: '/images/full_chicken.svg'
    };
    allProducts.push(newProduct);
    localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(allProducts));
    showToast('Product added locally (offline mode)', 'info');
    form.reset();
    renderProducts();
    renderRatesTicker();
    loadAdminProducts();
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return;
  try {
    await fetch(API_BASE + `/api/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': adminToken }
    });
    showToast('Product deleted', 'success');
    allProducts = allProducts.filter(p => p._id !== id);
    localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(allProducts));
    renderProducts();
    renderRatesTicker();
    loadAdminProducts();
  } catch (e) {
    // Network error: delete locally
    allProducts = allProducts.filter(p => p._id !== id);
    localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(allProducts));
    renderProducts();
    renderRatesTicker();
    loadAdminProducts();
    showToast('Product deleted locally (offline mode)', 'info');
  }
}

function openEditProduct(id) {
  const product = allProducts.find(p => p._id === id);
  if (!product) return;

  $('#edit-product-id').value = product._id;
  $('#edit-name').value = product.name || '';
  $('#edit-nameTelugu').value = product.nameTelugu || '';
  $('#edit-pricePerKg').value = product.pricePerKg || 0;
  $('#edit-category').value = product.category || 'whole';
  $('#edit-unit').value = product.unit || 'kg';
  $('#edit-displayOrder').value = product.displayOrder || 0;
  $('#edit-description').value = product.description || '';
  $('#edit-descriptionTelugu').value = product.descriptionTelugu || '';
  $('#edit-inStock').checked = product.inStock !== false;

  $('#edit-product-modal').classList.add('active');
}

function closeEditProduct() {
  $('#edit-product-modal').classList.remove('active');
}

async function saveEditProduct(e) {
  e.preventDefault();
  const id = $('#edit-product-id').value;
  const formData = new FormData();

  formData.append('name', $('#edit-name').value);
  formData.append('nameTelugu', $('#edit-nameTelugu').value);
  formData.append('pricePerKg', $('#edit-pricePerKg').value);
  formData.append('category', $('#edit-category').value);
  formData.append('unit', $('#edit-unit').value);
  formData.append('displayOrder', $('#edit-displayOrder').value);
  formData.append('description', $('#edit-description').value);
  formData.append('descriptionTelugu', $('#edit-descriptionTelugu').value);
  formData.append('inStock', $('#edit-inStock').checked ? 'true' : 'false');

  const imageInput = $('#edit-image');
  if (imageInput.files.length > 0) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    const res = await fetch(API_BASE + `/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': adminToken },
      body: formData
    });
    if (res.ok) {
      const updatedProduct = await res.json();
      // Update local product array immediately
      const idx = allProducts.findIndex(p => p._id === id);
      if (idx !== -1) {
        allProducts[idx] = { ...allProducts[idx], ...updatedProduct };
      }
      localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(allProducts));
      showToast('Product updated successfully!', 'success');
      closeEditProduct();
      imageInput.value = '';
      renderProducts();
      renderRatesTicker();
      loadAdminProducts();
    } else {
      // If API fails, update locally anyway
      const idx = allProducts.findIndex(p => p._id === id);
      if (idx !== -1) {
        allProducts[idx].name = $('#edit-name').value;
        allProducts[idx].nameTelugu = $('#edit-nameTelugu').value;
        allProducts[idx].pricePerKg = Number($('#edit-pricePerKg').value);
        allProducts[idx].category = $('#edit-category').value;
        allProducts[idx].unit = $('#edit-unit').value;
        allProducts[idx].displayOrder = Number($('#edit-displayOrder').value) || 0;
        allProducts[idx].description = $('#edit-description').value;
        allProducts[idx].descriptionTelugu = $('#edit-descriptionTelugu').value;
        allProducts[idx].inStock = $('#edit-inStock').checked;
        localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(allProducts));
        showToast('Product updated locally!', 'success');
        closeEditProduct();
        imageInput.value = '';
        renderProducts();
        renderRatesTicker();
        loadAdminProducts();
      } else {
        showToast('Failed to update product', 'error');
      }
    }
  } catch (e) {
    // Network error: update locally
    const idx = allProducts.findIndex(p => p._id === id);
    if (idx !== -1) {
      allProducts[idx].name = $('#edit-name').value;
      allProducts[idx].nameTelugu = $('#edit-nameTelugu').value;
      allProducts[idx].pricePerKg = Number($('#edit-pricePerKg').value);
      allProducts[idx].category = $('#edit-category').value;
      allProducts[idx].unit = $('#edit-unit').value;
      allProducts[idx].displayOrder = Number($('#edit-displayOrder').value) || 0;
      allProducts[idx].description = $('#edit-description').value;
      allProducts[idx].descriptionTelugu = $('#edit-descriptionTelugu').value;
      allProducts[idx].inStock = $('#edit-inStock').checked;
      localStorage.setItem(CACHED_PRODUCTS_KEY, JSON.stringify(allProducts));
      showToast('Product updated locally (offline mode)', 'info');
      closeEditProduct();
      imageInput.value = '';
      renderProducts();
      renderRatesTicker();
      loadAdminProducts();
    } else {
      showToast('Server error while updating product', 'error');
    }
  }
}

// ── Event Bindings ────────────────────────────────────
function bindEvents() {
  // Theme & Language Toggles
  const themeBtn = $('#theme-toggle-btn');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);

  const langBtn = $('#lang-toggle-btn');
  if (langBtn) langBtn.addEventListener('click', toggleLanguage);

  // Cart open/close
  $('#cart-btn').addEventListener('click', openCart);
  $('#cart-close-btn').addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // Floating Cart Bar Clicks (Opens Cart Drawer)
  if ($('#floating-cart-trigger')) {
    $('#floating-cart-trigger').addEventListener('click', openCart);
  }
  if ($('#floating-view-cart-btn')) {
    $('#floating-view-cart-btn').addEventListener('click', openCart);
  }

  // Clear cart
  $('#clear-cart-btn').addEventListener('click', clearCart);

  // WhatsApp order button
  whatsappBtn.addEventListener('click', placeOrder);

  // Location detection
  $('#detect-location-btn').addEventListener('click', detectLocation);
  const addressInput = $('#customer-address');
  if (addressInput) {
    addressInput.addEventListener('input', updateCartUI);
  }

  // Search input events
  const searchInput = $('#search-input');
  if (searchInput) searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
  const searchMobile = $('#search-input-mobile');
  if (searchMobile) searchMobile.addEventListener('input', (e) => {
    handleSearch(e.target.value);
    if (searchInput) searchInput.value = e.target.value;
  });

  // Category pills
  $$('.category-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      $$('.category-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category;
      renderProducts();
    });
  });

  // Spec checkboxes visual toggle
  $$('.spec-checkbox').forEach(label => {
    label.addEventListener('click', () => {
      setTimeout(() => {
        const cb = label.querySelector('input');
        if (cb && cb.checked) {
          label.classList.add('checked');
        } else {
          label.classList.remove('checked');
        }
      }, 0);
    });
  });

  // Admin panel events
  $('#admin-toggle').addEventListener('click', openAdmin);
  $('#admin-close').addEventListener('click', closeAdmin);
  $('#admin-login-form').addEventListener('submit', adminLoginHandler);
  $('#add-product-form').addEventListener('submit', addProduct);

  // Admin offers form
  const addOfferForm = $('#add-offer-form');
  if (addOfferForm) addOfferForm.addEventListener('submit', addOffer);

  // Admin tabs
  $$('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.admin-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      $$('.admin-tab-content').forEach(c => c.style.display = 'none');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.style.display = 'block';
    });
  });

  // Order filter buttons
  $$('.order-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.order-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      orderFilter = btn.dataset.status;
      renderAdminOrders();
    });
  });

  // Shop toggle in admin
  const shopToggle = $('#shop-toggle');
  if (shopToggle) {
    shopToggle.addEventListener('click', () => {
      shopToggle.classList.toggle('active');
    });
  }

  // Save admin settings
  const saveBtn = $('#save-settings-btn');
  if (saveBtn) saveBtn.addEventListener('click', saveSettings);

  const editCloseBtn = $('#edit-modal-close');
  const editModal = $('#edit-product-modal');
  const editForm = $('#edit-product-form');
  if (editCloseBtn) editCloseBtn.addEventListener('click', closeEditProduct);
  if (editModal) editModal.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditProduct();
  });
  if (editForm) editForm.addEventListener('submit', saveEditProduct);

  // Escape key listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCart();
      closeAdmin();
      hideBookingModal();
      closeEditProduct();
    }
  });
}

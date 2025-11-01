/* ============================================
   TechStore - Main JavaScript (з Utils)
   Core functionality для всіх сторінок
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // Mobile Menu
  // ============================================
  function initMobileMenu() {
    const toggle = document.getElementById('mobileMenuToggle');
    const menu = document.getElementById('navMenu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
      toggle.classList.toggle('active');
      document.body.classList.toggle('menu-open');
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('active');
        toggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      });
    });

    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove('active');
        toggle.classList.remove('active');
        document.body.classList.remove('menu-open');
      }
    });
  }

  // ============================================
  // Update Cart Count
  // ============================================
  function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    document.querySelectorAll('#cartCount').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ============================================
  // Update Favorites Count
  // ============================================
  function updateFavoritesCount() {
    const favorites = getFavorites();
    const count = favorites.length;
    
    document.querySelectorAll('#favoritesCount').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // ============================================
  // Cart Management
  // ============================================
  function getCart() {
    return Utils.getStorage('techstore-cart', []);
  }

  function saveCart(cart) {
    Utils.setStorage('techstore-cart', cart);
    updateCartCount();
  }

  function addToCart(product, quantity = 1) {
    const cart = getCart();
    const existing = cart.find(item => item.id === product.id);

    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    const name = product.name?.[lang] || product.name?.uk || product.name || 'Продукт';
    
    const isRootPage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/');
    
    const image = Utils.fixImagePath(product.images?.[0] || product.image, isRootPage);

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: image,
        category: product.category,
        quantity: quantity
      });
    }

    saveCart(cart);
    showToast('Товар додано до кошика', `${name} (${quantity} шт.)`);
  }

  function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
  }

  function updateCartItemQuantity(productId, quantity) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        item.quantity = quantity;
        saveCart(cart);
      }
    }
  }

  function clearCart() {
    Utils.removeStorage('techstore-cart');
    updateCartCount();
  }

  // ============================================
  // Favorites Management
  // ============================================
  function getFavorites() {
    return Utils.getStorage('techstore-favorites', []);
  }

  function saveFavorites(favorites) {
    Utils.setStorage('techstore-favorites', favorites);
    updateFavoritesCount();
  }

  function toggleFavorite(product) {
    let favorites = getFavorites();
    const index = favorites.findIndex(item => item.id === product.id);

    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    const name = product.name?.[lang] || product.name?.uk || product.name || 'Продукт';
    
    const isRootPage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/');
    
    const image = Utils.fixImagePath(product.images?.[0] || product.image, isRootPage);

    if (index > -1) {
      favorites.splice(index, 1);
      saveFavorites(favorites);
      showToast('Видалено з обраного', name);
      return false;
    } else {
      favorites.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: image,
        images: product.images || [image],
        category: product.category,
        brand: product.brand,
        rating: product.rating,
        reviews: product.reviews,
        oldPrice: product.oldPrice,
        discount: product.discount,
        isNew: product.isNew,
        isHot: product.isHot,
        inStock: product.inStock
      });
      saveFavorites(favorites);
      showToast('Додано до обраного', name);
      return true;
    }
  }

  function isFavorite(productId) {
    const favorites = getFavorites();
    return favorites.some(item => item.id === productId);
  }

  function clearFavorites() {
    Utils.removeStorage('techstore-favorites');
    updateFavoritesCount();
  }

  // ============================================
  // Toast Notifications
  // ============================================
  function showToast(title, message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const titleEl = toast.querySelector('#toastTitle');
    const messageEl = toast.querySelector('#toastMessage');

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ============================================
  // Product Card Rendering
  // ============================================
  function renderProductCard(product) {
    const isFav = isFavorite(product.id);
    const currentLang = window.i18n?.getCurrentLanguage() || 'uk';
    const name = product.name?.[currentLang] || product.name?.uk || product.name || 'Продукт';
    
    const isRootPage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('/');
    
    const image = Utils.fixImagePath(product.images?.[0] || product.image, isRootPage);
    
    const productUrl = isRootPage 
      ? `./assets/html/product.html?category=${product.category}&id=${product.id}`
      : `product.html?category=${product.category}&id=${product.id}`;
    
    let badge = '';
    if (product.isNew) {
      badge = '<span class="product-badge badge-new">NEW</span>';
    } else if (product.discount || product.isSale) {
      badge = `<span class="product-badge badge-sale">-${product.discount || 15}%</span>`;
    } else if (product.isHot) {
      badge = '<span class="product-badge badge-hot">HOT</span>';
    }

    const categoryName = getCategoryName(product.category);
    const reviewsText = window.i18n?.t?.('reviews') || 'відгуків';
    const addToCartText = window.i18n?.t?.('add_to_cart') || 'Додати в кошик';
    
    return `
      <div class="product-card" data-product-id="${product.id}">
        ${badge ? `<div class="product-badges">${badge}</div>` : ''}
        
        <div class="product-image">
          <img src="${image}" alt="${name}" loading="lazy" onerror="this.src='${isRootPage ? './assets/images/placeholder.jpg' : '../images/placeholder.jpg'}'">
          <div class="product-actions">
            <button class="product-action-btn favorite-btn ${isFav ? 'active' : ''}" 
                    data-product-id="${product.id}" 
                    aria-label="Add to favorites">
              <i class="fa${isFav ? 's' : 'r'} fa-heart"></i>
            </button>
          </div>
        </div>

        <div class="product-info">
          <span class="product-category">${categoryName}</span>
          <h3 class="product-title">
            <a href="${productUrl}">${name}</a>
          </h3>

          <div class="product-rating">
            <div class="product-stars">
              ${'★'.repeat(Math.floor(product.rating || 0))}${'☆'.repeat(5 - Math.floor(product.rating || 0))}
            </div>
            <span class="product-rating-value">${product.rating || 0}</span>
            <span class="product-reviews">(${product.reviews || 0} ${reviewsText})</span>
          </div>

          <div class="product-price">
            ${product.oldPrice ? `<span class="price-old">${Utils.formatPrice(product.oldPrice)}</span>` : ''}
            <span class="price-current">${Utils.formatPrice(product.price)}</span>
          </div>

          <div class="product-footer">
            <button class="btn btn-primary btn-add-cart" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
              ${addToCartText}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================
  // Get Category Name
  // ============================================
  function getCategoryName(category) {
    const key = `category_${category}`;
    return window.i18n?.t?.(key) || category;
  }

  // ============================================
  // Load Featured Products
  // ============================================
  async function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    try {
      const productFiles = [
        { category: 'phones', id: 'iphone15pro' },
        { category: 'phones', id: 'samsung_s24ultra' },
        { category: 'phones', id: 'xiaomi14' },
        { category: 'laptops', id: 'macbookProM3Max' },
        { category: 'laptops', id: 'macbookAirM3' },
        { category: 'headphones', id: 'appleAirPodsPro2' },
        { category: 'headphones', id: 'sonyWH1000XM5' },
        { category: 'smartwatches', id: 'apple_watch9' }
      ];

      const promises = productFiles.map(async ({ category, id }) => {
        try {
          const response = await fetch(`./data/products/${category}/${id}.json`);
          if (!response.ok) return null;
          const product = await response.json();
          return { ...product, category };
        } catch {
          return null;
        }
      });

      const products = (await Promise.all(promises)).filter(p => p !== null);

      if (products.length === 0) {
        container.innerHTML = '<p style="padding: 2rem; text-align: center;">Товари завантажуються...</p>';
        return;
      }

      container.innerHTML = products.map(product => 
        renderProductCard(product)
      ).join('');

      attachProductCardListeners(container);
      
      console.log(`✓ Loaded ${products.length} featured products`);
    } catch (err) {
      console.error('❌ Error loading featured products:', err);
      container.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--danger-color);">Помилка завантаження товарів</p>';
    }
  }

  // ============================================
  // Attach Event Listeners to Product Cards
  // ============================================
  function attachProductCardListeners(container) {
    container.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = btn.dataset.productId;
        
        const productCard = btn.closest('.product-card');
        const link = productCard.querySelector('a[href*="category"]');
        if (!link) return;

        const url = new URL(link.href);
        const category = url.searchParams.get('category');

        try {
          const response = await fetch(`./data/products/${category}/${productId}.json`);
          if (!response.ok) return;
          const product = await response.json();
          addToCart({ ...product, category }, 1);
        } catch (err) {
          console.error('Error adding to cart:', err);
        }
      });
    });

    container.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const productId = btn.dataset.productId;
        
        const productCard = btn.closest('.product-card');
        const link = productCard.querySelector('a[href*="category"]');
        if (!link) return;

        const url = new URL(link.href);
        const category = url.searchParams.get('category');

        try {
          const response = await fetch(`./data/products/${category}/${productId}.json`);
          if (!response.ok) return;
          const product = await response.json();
          
          const isFav = toggleFavorite({ ...product, category });
          btn.classList.toggle('active', isFav);
          const icon = btn.querySelector('i');
          if (icon) {
            icon.classList.toggle('fas', isFav);
            icon.classList.toggle('far', !isFav);
          }
        } catch (err) {
          console.error('Error toggling favorite:', err);
        }
      });
    });
  }

  // ============================================
  // Search Functionality
  // ============================================
  function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (!searchInput || !searchBtn) return;

    searchBtn.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }

  function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput?.value.trim();
    
    if (query) {
      window.location.href = `./assets/html/catalog.html?search=${encodeURIComponent(query)}`;
    }
  }

  // ============================================
  // Smooth Scroll
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        if (href === '#' || href === '') return;
        
        e.preventDefault();
        const target = document.querySelector(href);
        
        if (target) {
          Utils.scrollToElement(target, 100);
        }
      });
    });
  }

  // ============================================
  // Scroll Animations
  // ============================================
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('[data-aos]').forEach(el => {
      observer.observe(el);
    });
  }

  // ============================================
  // Navbar Scroll Effect
  // ============================================
  function initNavbarScroll() {
    const navbar = document.querySelector('.header');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', Utils.throttle(() => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }, 100));
  }

  // ============================================
  // Active Nav Link
  // ============================================
  function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.nav-menu a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes(currentPage)) {
        link.classList.add('active');
      }
    });
  }

  // ============================================
  // Initialize Everything
  // ============================================
  function init() {
    initMobileMenu();
    initSearch();
    initSmoothScroll();
    initScrollAnimations();
    initNavbarScroll();
    highlightActiveNavLink();
    
    updateCartCount();
    updateFavoritesCount();
    
    if (document.getElementById('featuredProducts')) {
      loadFeaturedProducts();
    }

    console.log('✓ Main script initialized');
  }

  // ============================================
  // Export Functions
  // ============================================
  window.TechStore = {
    // Cart
    getCart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    
    // Favorites
    getFavorites,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    
    // UI
    showToast,
    renderProductCard,
    
    // Validation (з Utils)
    validateEmail: Utils.validateEmail,
    validatePhone: Utils.validatePhone,
    
    // Utils re-export
    formatPrice: Utils.formatPrice,
    debounce: Utils.debounce,
    fixImagePath: Utils.fixImagePath
  };

  // ============================================
  // Auto Initialize
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

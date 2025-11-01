/* ============================================
   TechStore - Product Page Logic (з Utils)
   ============================================ */

(function () {
  'use strict';

  // ============================================
  // State
  // ============================================
  let product = null;
  let currentImageIndex = 0;
  let quantity = 1;

  // ============================================
  // DOM Elements
  // ============================================
  const mainImage = document.getElementById('mainImage');
  const thumbnailImages = document.getElementById('thumbnailImages');
  const favoriteBtn = document.getElementById('favoriteBtn');
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinusBtn = document.getElementById('qtyMinus');
  const qtyPlusBtn = document.getElementById('qtyPlus');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const addToCartMainBtn = document.getElementById('addToCartMainBtn');
  const buyNowBtn = document.getElementById('buyNowBtn');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const relatedProducts = document.getElementById('relatedProducts');

  // ============================================
  // Initialize
  // ============================================
  async function init() {
    const params = Utils.getUrlParams();

    if (!params.category || !params.id) {
      console.error('❌ Missing category or id parameter');
      showError('Не вказано категорію або ID товару');
      return;
    }

    await loadProduct(params.category, params.id);
    
    if (product) {
      setupEventListeners();
      console.log(`✓ Product page initialized with Utils: ${params.category}/${params.id}`);
    }
  }

  // ============================================
  // Show Error
  // ============================================
  function showError(message) {
    console.error('⚠ Product Error:', message);
    
    const container = document.querySelector('.product-section .container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem;">
          <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
          <h2 style="margin-bottom: 1rem;">${message}</h2>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">Перевірте URL або поверніться до каталогу</p>
          <a href="catalog.html" class="btn btn-primary">
            <i class="fas fa-arrow-left"></i> Повернутися до каталогу
          </a>
        </div>
      `;
    }
  }

  // ============================================
  // Load Product JSON
  // ============================================
  async function loadProduct(category, id) {
    try {
      const response = await fetch(`../../data/products/${category}/${id}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: File not found`);
      }

      product = await response.json();
      
      if (!product) {
        throw new Error('Empty product data');
      }

      if (!product.category) {
        product.category = category;
      }

      renderProduct();
      await loadRelatedProducts(category, id);
      
    } catch (err) {
      console.error('❌ Failed to load product:', err);
      showError('Товар не знайдено');
    }
  }

  // ============================================
  // Render Product
  // ============================================
  function renderProduct() {
    updateBreadcrumbs();
    renderBadges();
    renderTitle();
    renderRating();
    renderPrice();
    renderAvailability();
    renderDescription();
    renderFeatures();
    renderGallery();
    renderSpecifications();
    updateFavoriteButton();
    updateAddToCartButtons();
    renderReviews();
  }

  // ============================================
  // Update Breadcrumbs
  // ============================================
  function updateBreadcrumbs() {
    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    if (breadcrumbCategory) {
      breadcrumbCategory.textContent = getCategoryName(product.category);
    }

    const breadcrumbProduct = document.getElementById('breadcrumbProduct');
    if (breadcrumbProduct) {
      breadcrumbProduct.textContent = product.name?.[lang] || product.name?.uk || '';
    }
  }

  // ============================================
  // Render Badges
  // ============================================
  function renderBadges() {
    const badgesContainer = document.getElementById('productBadges');
    if (!badgesContainer) return;

    let badges = '';
    if (product.isNew) badges += '<span class="badge badge-new">NEW</span>';
    if (product.discount) badges += `<span class="badge badge-sale">-${product.discount}%</span>`;
    if (product.isHot) badges += '<span class="badge badge-hot">HOT</span>';
    badgesContainer.innerHTML = badges;
  }

  // ============================================
  // Render Title
  // ============================================
  function renderTitle() {
    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    
    const titleEl = document.getElementById('productTitle');
    if (titleEl) {
      titleEl.textContent = product.name?.[lang] || product.name?.uk || 'Без назви';
    }

    const productCodeEl = document.getElementById('productCode');
    if (productCodeEl) {
      productCodeEl.innerHTML = `<strong>SKU:</strong> TS-${String(product.id).toUpperCase()}`;
    }
  }

  // ============================================
  // Render Rating
  // ============================================
  function renderRating() {
    const ratingValue = product.rating || 0;
    const reviewsCount = product.reviews || 0;
    
    const ratingValueEl = document.getElementById('ratingValue');
    if (ratingValueEl) ratingValueEl.textContent = ratingValue;
    
    const reviewsCountEl = document.getElementById('reviewsCount');
    if (reviewsCountEl) reviewsCountEl.textContent = reviewsCount;
    
    const reviewsTabCountEl = document.getElementById('reviewsTabCount');
    if (reviewsTabCountEl) reviewsTabCountEl.textContent = reviewsCount;
    
    renderStars(ratingValue);
  }

  // ============================================
  // Render Price
  // ============================================
  function renderPrice() {
    const priceCurrentEl = document.getElementById('priceCurrent');
    const priceOldEl = document.getElementById('priceOld');
    const priceDiscountEl = document.getElementById('priceDiscount');
    const discountAmountEl = document.getElementById('discountAmount');

    if (priceCurrentEl) {
      priceCurrentEl.textContent = Utils.formatPrice(product.price);
    }

    if (product.oldPrice && product.oldPrice > product.price) {
      if (priceOldEl) {
        priceOldEl.textContent = Utils.formatPrice(product.oldPrice);
        priceOldEl.style.display = 'inline';
      }
      if (priceDiscountEl) priceDiscountEl.style.display = 'flex';
      if (discountAmountEl) {
        discountAmountEl.textContent = Utils.formatPrice(product.oldPrice - product.price);
      }
    } else {
      if (priceOldEl) priceOldEl.style.display = 'none';
      if (priceDiscountEl) priceDiscountEl.style.display = 'none';
    }
  }

  // ============================================
  // Render Availability
  // ============================================
  function renderAvailability() {
    const availabilityEl = document.getElementById('productAvailability');
    if (!availabilityEl) return;

    if (product.inStock) {
      availabilityEl.classList.remove('out-of-stock');
      availabilityEl.innerHTML = '<i class="fas fa-check-circle"></i> <span>В наявності</span>';
    } else {
      availabilityEl.classList.add('out-of-stock');
      availabilityEl.innerHTML = '<i class="fas fa-times-circle"></i> <span>Немає в наявності</span>';
    }
  }

  // ============================================
  // Render Description
  // ============================================
  function renderDescription() {
    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    const description = product.description?.[lang] || product.description?.uk || '';

    const descShortEl = document.getElementById('productDescriptionShort');
    if (descShortEl) {
      descShortEl.textContent = Utils.truncate(description, 200);
    }

    const descFullEl = document.getElementById('productDescription');
    if (descFullEl) {
      descFullEl.innerHTML = `<p>${description}</p>`;
    }
  }

  // ============================================
  // Render Features
  // ============================================
  function renderFeatures() {
    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    const featuresListEl = document.getElementById('productFeaturesList');
    
    if (!featuresListEl) return;

    const features = product.features?.[lang] || product.features?.uk || [];
    
    if (features.length === 0) {
      featuresListEl.innerHTML = '<li>Немає характеристик</li>';
    } else {
      featuresListEl.innerHTML = features.map(f => `<li>${f}</li>`).join('');
    }
  }

  // ============================================
  // Render Specifications
  // ============================================
  function renderSpecifications() {
    const specsGrid = document.getElementById('specificationsGrid');
    if (!specsGrid) return;

    if (!product.specifications || Object.keys(product.specifications).length === 0) {
      specsGrid.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">Специфікації відсутні</p>';
      return;
    }

    specsGrid.innerHTML = Object.entries(product.specifications)
      .map(([key, value]) => `
        <div class="spec-row">
          <div class="spec-label">${key}</div>
          <div class="spec-value">${value}</div>
        </div>
      `).join('');
  }

  // ============================================
  // Render Stars
  // ============================================
  function renderStars(rating = 0) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    
    let html = '';
    html += '<i class="fas fa-star"></i>'.repeat(full);
    if (half) html += '<i class="fas fa-star-half-alt"></i>';
    html += '<i class="far fa-star"></i>'.repeat(empty);

    const starsContainers = document.querySelectorAll('#productStars, .rating-stars');
    starsContainers.forEach(container => {
      container.innerHTML = html;
    });
  }

  // ============================================
  // Render Gallery
  // ============================================
  function renderGallery() {
    if (!product.images || product.images.length === 0) {
      const mainImg = mainImage?.querySelector('img');
      if (mainImg) {
        mainImg.src = '../images/placeholder.jpg';
        mainImg.alt = 'No image';
      }
      return;
    }

    const mainImg = mainImage?.querySelector('img');
    if (mainImg) {
      const imagePath = Utils.fixImagePath(product.images[0], false);
      mainImg.src = imagePath;
      mainImg.alt = product.name?.uk || 'Product';
      
      mainImg.onload = function() {
        console.log('✅ Main image loaded successfully');
      };
      
      mainImg.onerror = function() {
        console.error('❌ Failed to load main image, using placeholder');
        this.src = '../images/placeholder.jpg';
      };
    }

    if (thumbnailImages) {
      thumbnailImages.innerHTML = product.images
        .map((img, i) => {
          const thumbPath = Utils.fixImagePath(img, false);
          return `
            <div class="thumbnail-item ${i === 0 ? 'active' : ''}" 
                 data-index="${i}" 
                 style="cursor: pointer;">
              <img src="${thumbPath}" 
                   alt="Thumbnail ${i + 1}" 
                   onerror="this.src='../images/placeholder.jpg'">
            </div>
          `;
        })
        .join('');
      
      attachThumbnailListeners();
    }
  }

  // ============================================
  // Attach Thumbnail Listeners
  // ============================================
  function attachThumbnailListeners() {
    if (!thumbnailImages) return;

    thumbnailImages.querySelectorAll('.thumbnail-item').forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        changeMainImage(index);
      });
    });
  }

  // ============================================
  // Change Main Image
  // ============================================
  function changeMainImage(index) {
    if (!product || !product.images || !product.images[index]) {
      console.error('❌ Invalid image index:', index);
      return;
    }
    
    currentImageIndex = index;
    const img = mainImage?.querySelector('img');
    
    if (!img) return;

    img.style.transition = 'opacity 0.3s ease';
    img.style.opacity = '0';
    
    setTimeout(() => {
      const imagePath = Utils.fixImagePath(product.images[index], false);
      img.src = imagePath;
      
      img.onload = function() {
        this.style.opacity = '1';
      };
      
      img.onerror = function() {
        console.error('❌ Failed to load image, using placeholder');
        this.src = '../images/placeholder.jpg';
        this.style.opacity = '1';
      };
    }, 150);

    if (thumbnailImages) {
      thumbnailImages.querySelectorAll('.thumbnail-item').forEach((t, i) => {
        t.classList.toggle('active', i === index);
      });
    }
  }

  // ============================================
  // Render Reviews
  // ============================================
  function renderReviews() {
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;

    const reviews = generateFakeReviews(product.reviews || 0);
    
    if (reviews.length === 0) {
      reviewsList.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">Поки що немає відгуків</p>';
      return;
    }

    reviewsList.innerHTML = reviews.map(r => `
      <div class="review-item">
        <div class="review-header">
          <div>
            <div class="review-author">${r.author}</div>
            <div class="review-date">${Utils.formatDate(r.date)}</div>
          </div>
          <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        </div>
        <div class="review-text">${r.text}</div>
      </div>
    `).join('');

    const ratingBigEl = document.getElementById('ratingBig');
    if (ratingBigEl) ratingBigEl.textContent = product.rating || 0;

    const totalReviewsEl = document.getElementById('totalReviews');
    if (totalReviewsEl) totalReviewsEl.textContent = product.reviews || 0;
  }

  // ============================================
  // Generate Fake Reviews
  // ============================================
  function generateFakeReviews(count) {
    if (count === 0) return [];
    
    const names = ['Олександр К.', 'Марія С.', 'Іван П.', 'Юлія Т.', 'Андрій В.'];
    const texts = [
      'Чудовий товар! Повністю задоволений покупкою.',
      'Відмінна якість, швидка доставка. Рекомендую!',
      'Все працює ідеально. Дякую магазину!',
      'Гарне співвідношення ціни та якості.',
      'Задоволений покупкою на всі 100%!'
    ];
    
    const reviews = [];
    const displayCount = Utils.clamp(count, 0, 5);
    
    for (let i = 0; i < displayCount; i++) {
      reviews.push({
        author: names[i % names.length],
        date: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000),
        rating: Utils.randomInt(4, 5),
        text: texts[i % texts.length]
      });
    }
    
    return reviews;
  }

  // ============================================
  // Update Favorite Button
  // ============================================
  function updateFavoriteButton() {
    if (!favoriteBtn) return;
    
    const isFav = window.TechStore?.isFavorite?.(product.id) || false;
    favoriteBtn.classList.toggle('active', isFav);
    
    const icon = favoriteBtn.querySelector('i');
    if (icon) {
      icon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
    }
  }

  // ============================================
  // Update Add To Cart Buttons
  // ============================================
  function updateAddToCartButtons() {
    const buttons = [addToCartBtn, addToCartMainBtn, buyNowBtn];
    
    buttons.forEach(btn => {
      if (!btn) return;
      
      if (!product.inStock) {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
      } else {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      }
    });
  }

  // ============================================
  // Load Related Products
  // ============================================
  async function loadRelatedProducts(category, currentId) {
    if (!relatedProducts) return;

    try {
      const productFiles = [
        { category: 'phones', id: 'iphone15pro' },
        { category: 'phones', id: 'iphone15' },
        { category: 'phones', id: 'samsung_s24ultra' },
        { category: 'phones', id: 'samsung_a55' },
        { category: 'phones', id: 'xiaomi14' },
        { category: 'laptops', id: 'macbookAirM3' },
        { category: 'laptops', id: 'macbookProM3Max' },
        { category: 'headphones', id: 'appleAirPodsPro2' },
        { category: 'headphones', id: 'sonyWH1000XM5' },
        { category: 'smartwatches', id: 'apple_watch9' },
        { category: 'smartwatches', id: 'galaxyWatch6' },
        { category: 'accessories', id: 'magsafeCharger' }
      ];

      const relatedFiles = productFiles.filter(p => 
        p.category === category && p.id !== currentId
      );

      if (relatedFiles.length === 0) {
        relatedProducts.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">Немає схожих товарів</p>';
        return;
      }

      const promises = relatedFiles.map(async ({ category, id }) => {
        try {
          const response = await fetch(`../../data/products/${category}/${id}.json`);
          if (!response.ok) return null;
          const product = await response.json();
          return { ...product, category };
        } catch {
          return null;
        }
      });

      const products = (await Promise.all(promises)).filter(p => p !== null);

      if (products.length === 0) {
        relatedProducts.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-secondary);">Немає схожих товарів</p>';
        return;
      }

      const shuffled = Utils.shuffle(products);
      relatedProducts.innerHTML = shuffled.slice(0, 4).map(p => renderRelatedProductCard(p)).join('');
      attachRelatedProductListeners();

    } catch (err) {
      console.error('❌ Error loading related products:', err);
    }
  }

  // ============================================
  // Render Related Product Card
  // ============================================
  function renderRelatedProductCard(product) {
    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    const name = product.name?.[lang] || product.name?.uk || 'Продукт';
    const image = Utils.fixImagePath(product.images?.[0], false);
    const isFavorite = window.TechStore?.isFavorite?.(product.id) || false;

    return `
      <div class="product-card" data-product-id="${product.id}">
        ${product.isNew ? '<span class="badge badge-new">NEW</span>' : ''}
        ${product.discount ? `<span class="badge badge-sale">-${product.discount}%</span>` : ''}
        ${product.isHot ? '<span class="badge badge-hot">HOT</span>' : ''}
        
        <a href="product.html?category=${product.category}&id=${product.id}" class="product-image">
          <img src="${image}" alt="${name}" loading="lazy" onerror="this.src='../images/placeholder.jpg'">
        </a>
        
        <div class="product-info">
          <div class="product-category">${getCategoryName(product.category)}</div>
          <a href="product.html?category=${product.category}&id=${product.id}" class="product-title">${name}</a>
          
          <div class="product-rating">
            <div class="product-stars">${renderStarsHTML(product.rating || 0)}</div>
            <span class="product-rating-value">${product.rating || 0}</span>
            <span class="product-reviews">(${product.reviews || 0})</span>
          </div>
          
          <div class="product-price">
            ${product.oldPrice ? `<span class="price-old">${Utils.formatPrice(product.oldPrice)}</span>` : ''}
            <span class="price-current">${Utils.formatPrice(product.price)}</span>
          </div>
          
          <div class="product-footer">
            <button class="btn btn-primary btn-add-cart" data-product-id="${product.id}">
              <i class="fas fa-shopping-cart"></i>
            </button>
            <button class="product-action-btn favorite-btn ${isFavorite ? 'active' : ''}" 
                    data-product-id="${product.id}">
              <i class="fa${isFavorite ? 's' : 'r'} fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // ============================================
  // Attach Related Product Listeners
  // ============================================
  function attachRelatedProductListeners() {
    relatedProducts.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = btn.dataset.productId;
        handleAddRelatedToCart(productId);
      });
    });

    relatedProducts.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = btn.dataset.productId;
        handleToggleRelatedFavorite(btn, productId);
      });
    });
  }

  // ============================================
  // Handle Add Related to Cart
  // ============================================
  async function handleAddRelatedToCart(productId) {
    try {
      const productCard = relatedProducts.querySelector(`[data-product-id="${productId}"]`);
      if (!productCard) return;

      const link = productCard.querySelector('a[href*="category"]');
      if (!link) return;

      const url = new URL(link.href);
      const category = url.searchParams.get('category');

      const response = await fetch(`../../data/products/${category}/${productId}.json`);
      if (!response.ok) return;

      const product = await response.json();
      
      if (window.TechStore?.addToCart) {
        window.TechStore.addToCart(product, 1);
      }
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
    }
  }

  // ============================================
  // Handle Toggle Related Favorite
  // ============================================
  async function handleToggleRelatedFavorite(btn, productId) {
    try {
      const productCard = relatedProducts.querySelector(`[data-product-id="${productId}"]`);
      if (!productCard) return;

      const link = productCard.querySelector('a[href*="category"]');
      if (!link) return;

      const url = new URL(link.href);
      const category = url.searchParams.get('category');

      const response = await fetch(`../../data/products/${category}/${productId}.json`);
      if (!response.ok) return;

      const product = await response.json();
      
      if (window.TechStore?.toggleFavorite) {
        const isFav = window.TechStore.toggleFavorite(product);
        btn.classList.toggle('active', isFav);
        const icon = btn.querySelector('i');
        if (icon) {
          icon.className = isFav ? 'fas fa-heart' : 'far fa-heart';
        }
      }
    } catch (err) {
      console.error('❌ Error toggling favorite:', err);
    }
  }

  // ============================================
  // Event Listeners
  // ============================================
  function setupEventListeners() {
    if (qtyMinusBtn) {
      qtyMinusBtn.addEventListener('click', () => {
        if (quantity > 1) {
          quantity--;
          updateQuantity();
        }
      });
    }

    if (qtyPlusBtn) {
      qtyPlusBtn.addEventListener('click', () => {
        if (quantity < 99) {
          quantity++;
          updateQuantity();
        }
      });
    }

    if (qtyInput) {
      qtyInput.addEventListener('change', (e) => {
        let value = parseInt(e.target.value);
        value = Utils.clamp(value, 1, 99);
        quantity = value;
        updateQuantity();
      });
    }

    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', handleAddToCart);
    }

    if (addToCartMainBtn) {
      addToCartMainBtn.addEventListener('click', handleAddToCart);
    }

    if (buyNowBtn) {
      buyNowBtn.addEventListener('click', handleBuyNow);
    }

    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', handleToggleFavorite);
    }

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
      });
    });
  }

  // ============================================
  // Update Quantity
  // ============================================
  function updateQuantity() {
    if (qtyInput) {
      qtyInput.value = quantity;
    }
  }

  // ============================================
  // Handle Add to Cart
  // ============================================
  function handleAddToCart() {
    if (!product.inStock) {
      if (window.TechStore?.showToast) {
        window.TechStore.showToast('Помилка', 'Товару немає в наявності');
      }
      return;
    }

    if (window.TechStore?.addToCart) {
      window.TechStore.addToCart(product, quantity);
    }
  }

  // ============================================
  // Handle Buy Now
  // ============================================
  function handleBuyNow() {
    if (!product.inStock) {
      if (window.TechStore?.showToast) {
        window.TechStore.showToast('Помилка', 'Товару немає в наявності');
      }
      return;
    }

    if (window.TechStore?.addToCart) {
      window.TechStore.addToCart(product, quantity);
      window.location.href = 'cart.html';
    }
  }

  // ============================================
  // Handle Toggle Favorite
  // ============================================
  function handleToggleFavorite() {
    if (!window.TechStore?.toggleFavorite) return;
    
    const isFav = window.TechStore.toggleFavorite(product);
    updateFavoriteButton();
    
    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    const productName = product.name?.[lang] || product.name?.uk || 'Товар';
    
    if (isFav) {
      window.TechStore.showToast('Додано до обраного', productName);
    } else {
      window.TechStore.showToast('Видалено з обраного', productName);
    }
  }

  // ============================================
  // Switch Tab
  // ============================================
  function switchTab(tabName) {
    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === tabName);
    });
  }

  // ============================================
  // Helper Functions
  // ============================================
  function getCategoryName(category) {
    const categoryMap = {
      'phones': 'smartphones',
      'laptops': 'laptops',
      'headphones': 'headphones',
      'smartwatches': 'smartwatches',
      'watches': 'smartwatches',
      'accessories': 'accessories'
    };
    
    const mappedCategory = categoryMap[category] || category;
    const key = `category_${mappedCategory}`;
    return window.i18n?.t?.(key) || category;
  }

  function renderStarsHTML(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    
    let html = '';
    html += '<i class="fas fa-star"></i>'.repeat(full);
    if (half) html += '<i class="fas fa-star-half-alt"></i>';
    html += '<i class="far fa-star"></i>'.repeat(empty);
    
    return html;
  }

  // ============================================
  // Initialize on DOM Ready
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

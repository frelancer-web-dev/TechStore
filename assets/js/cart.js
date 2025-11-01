/* ============================================
   TechStore - Cart Logic (з Utils)
   Управління кошиком з підтримкою JSON-файлів
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const FREE_DELIVERY_THRESHOLD = 1000;
  const DELIVERY_COST = 100;

  // ============================================
  // State
  // ============================================
  let cart = [];
  let appliedPromo = null;
  let allProducts = {};

  // ============================================
  // DOM Elements
  // ============================================
  const emptyCart = document.getElementById('emptyCart');
  const cartContent = document.getElementById('cartContent');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartItemsCount = document.getElementById('cartItemsCount');
  const subtotalEl = document.getElementById('subtotal');
  const deliveryPriceEl = document.getElementById('deliveryPrice');
  const discountAmountEl = document.getElementById('discountAmount');
  const totalPriceEl = document.getElementById('totalPrice');
  const promoInput = document.getElementById('promoInput');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const promoMessage = document.getElementById('promoMessage');
  const deliveryProgressFill = document.getElementById('deliveryProgressFill');
  const deliveryRemainingEl = document.getElementById('deliveryRemaining');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');

  // ============================================
  // Initialize
  // ============================================
  async function init() {
    loadCart();
    await loadCartProducts();
    renderCart();
    setupEventListeners();
    
    console.log('✓ Cart initialized with Utils');
  }

  // ============================================
  // Load Cart
  // ============================================
  function loadCart() {
    cart = window.TechStore.getCart();
  }

  // ============================================
  // Load Cart Products from JSON
  // ============================================
  async function loadCartProducts() {
    const promises = cart.map(async (item) => {
      if (allProducts[item.id]) return;

      try {
        const categories = ['phones', 'laptops', 'headphones', 'smartwatches', 'accessories'];
        
        for (const category of categories) {
          try {
            const response = await fetch(`../../data/products/${category}/${item.id}.json`);
            if (response.ok) {
              const product = await response.json();
              allProducts[item.id] = { ...product, category };
              return;
            }
          } catch (err) {
            // Продовжуємо пошук
          }
        }
        
        console.warn(`⚠ Product ${item.id} not found in any category`);
      } catch (err) {
        console.error(`❌ Error loading product ${item.id}:`, err);
      }
    });

    await Promise.all(promises);
  }

  // ============================================
  // Get Product By ID
  // ============================================
  function getProductById(id) {
    return allProducts[id] || null;
  }

  // ============================================
  // Setup Event Listeners
  // ============================================
  function setupEventListeners() {
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', handleClearCart);
    }

    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', handleApplyPromo);
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', handleCheckout);
    }
  }

  // ============================================
  // Render Cart
  // ============================================
  function renderCart() {
    if (cart.length === 0) {
      showEmptyCart();
    } else {
      showCartContent();
      renderCartItems();
      updateSummary();
      updateDeliveryProgress();
    }
  }

  // ============================================
  // Show Empty Cart
  // ============================================
  function showEmptyCart() {
    if (emptyCart) emptyCart.style.display = 'flex';
    if (cartContent) cartContent.style.display = 'none';
  }

  // ============================================
  // Show Cart Content
  // ============================================
  function showCartContent() {
    if (emptyCart) emptyCart.style.display = 'none';
    if (cartContent) cartContent.style.display = 'block';
  }

  // ============================================
  // Render Cart Items
  // ============================================
  function renderCartItems() {
    if (!cartItemsList) return;

    if (cartItemsCount) {
      cartItemsCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';

    cartItemsList.innerHTML = cart.map(item => {
      const product = getProductById(item.id);
      if (!product) {
        console.warn(`Product ${item.id} not found in cache`);
        return '';
      }

      const name = product.name?.[lang] || product.name?.uk || product.name || 'Продукт';
      const image = Utils.fixImagePath(product.images?.[0] || product.image || item.image, false);

      return `
        <div class="cart-item" data-product-id="${item.id}">
          <div class="cart-item-image">
            <img src="${image}" alt="${name}" onerror="this.src='../images/placeholder.jpg'">
          </div>

          <div class="cart-item-details">
            <h3 class="cart-item-name">
              <a href="product.html?category=${product.category}&id=${product.id}">${name}</a>
            </h3>
            <p class="cart-item-category">${getCategoryName(product.category)}</p>
            
            ${product.inStock 
              ? '<span class="cart-item-status in-stock"><i class="fas fa-check"></i> В наявності</span>'
              : '<span class="cart-item-status out-of-stock"><i class="fas fa-times"></i> Немає в наявності</span>'
            }
          </div>

          <div class="cart-item-price-section">
            <div class="cart-item-price">
              <span class="price-current">${Utils.formatPrice(product.price)}</span>
              ${product.oldPrice 
                ? `<span class="price-old">${Utils.formatPrice(product.oldPrice)}</span>`
                : ''
              }
            </div>

            <div class="cart-item-actions">
              <div class="cart-quantity">
                <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">
                  <i class="fas fa-minus"></i>
                </button>
                <input type="number" 
                       class="qty-value" 
                       value="${item.quantity}" 
                       min="1" 
                       max="99"
                       onchange="updateQuantity('${item.id}', this.value)">
                <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                  <i class="fas fa-plus"></i>
                </button>
              </div>

              <button class="btn btn-outline btn-remove" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>

            <div class="cart-item-total">
              <span>Разом:</span>
              <strong>${Utils.formatPrice(product.price * item.quantity)}</strong>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================
  // Update Quantity (Global)
  // ============================================
  window.updateQuantity = async function(productId, quantity) {
    quantity = parseInt(quantity);
    
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    window.TechStore.updateCartItemQuantity(productId, quantity);
    loadCart();
    await loadCartProducts();
    renderCart();
  };

  // ============================================
  // Remove from Cart (Global)
  // ============================================
  window.removeFromCart = async function(productId) {
    const modal = document.getElementById('confirmModal');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const overlay = document.getElementById('modalOverlay');
    const confirmText = document.getElementById('confirmText');

    if (!modal) {
      window.TechStore.removeFromCart(productId);
      loadCart();
      await loadCartProducts();
      renderCart();
      return;
    }

    const product = getProductById(productId);
    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    const name = product?.name?.[lang] || product?.name?.uk || product?.name || 'товар';
    
    confirmText.textContent = `Видалити "${name}" з кошика?`;
    modal.classList.add('show');

    const handleConfirm = async () => {
      window.TechStore.removeFromCart(productId);
      loadCart();
      await loadCartProducts();
      renderCart();
      modal.classList.remove('show');
      cleanup();
    };

    const handleCancel = () => {
      modal.classList.remove('show');
      cleanup();
    };

    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      overlay.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    overlay.addEventListener('click', handleCancel);
  };

  // ============================================
  // Calculate Totals
  // ============================================
  function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => {
      const product = getProductById(item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const deliveryPrice = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_COST;
    
    let discount = 0;
    if (appliedPromo) {
      discount = Math.round(subtotal * appliedPromo.discount / 100);
    }

    const total = subtotal + deliveryPrice - discount;

    return { subtotal, deliveryPrice, discount, total };
  }

  // ============================================
  // Update Summary
  // ============================================
  function updateSummary() {
    const { subtotal, deliveryPrice, discount, total } = calculateTotals();

    if (subtotalEl) {
      subtotalEl.textContent = Utils.formatPrice(subtotal);
    }

    if (deliveryPriceEl) {
      deliveryPriceEl.textContent = deliveryPrice === 0 
        ? 'Безкоштовно' 
        : Utils.formatPrice(deliveryPrice);
    }

    if (discountAmountEl) {
      discountAmountEl.textContent = Utils.formatPrice(discount);
    }

    if (totalPriceEl) {
      totalPriceEl.textContent = Utils.formatPrice(total);
    }
  }

  // ============================================
  // Update Delivery Progress
  // ============================================
  function updateDeliveryProgress() {
    const { subtotal } = calculateTotals();
    
    if (subtotal >= FREE_DELIVERY_THRESHOLD) {
      if (deliveryProgressFill) deliveryProgressFill.style.width = '100%';
      if (deliveryRemainingEl && deliveryRemainingEl.closest('.delivery-text')) {
        deliveryRemainingEl.closest('.delivery-text').innerHTML = `
          <i class="fas fa-check-circle"></i>
          <span>Ви отримали безкоштовну доставку!</span>
        `;
      }
    } else {
      const remaining = FREE_DELIVERY_THRESHOLD - subtotal;
      const progress = (subtotal / FREE_DELIVERY_THRESHOLD) * 100;
      
      if (deliveryProgressFill) deliveryProgressFill.style.width = `${progress}%`;
      if (deliveryRemainingEl) {
        deliveryRemainingEl.textContent = Utils.formatPrice(remaining);
      }
    }
  }

  // ============================================
  // Handle Apply Promo
  // ============================================
  function handleApplyPromo() {
    const code = promoInput?.value.trim().toUpperCase();
    if (!code) return;

    const promo = validatePromoCode(code);

    if (promo) {
      appliedPromo = promo;
      showPromoMessage('success', `Промокод застосовано! Знижка ${promo.discount}%`);
      promoInput.disabled = true;
      applyPromoBtn.textContent = 'Застосовано';
      applyPromoBtn.disabled = true;
      updateSummary();
    } else {
      showPromoMessage('error', 'Невірний промокод');
      appliedPromo = null;
    }
  }

  // ============================================
  // Validate Promo Code
  // ============================================
  function validatePromoCode(code) {
    const promoCodes = [
      { code: 'TECH2024', discount: 10 },
      { code: 'NEWUSER', discount: 15 },
      { code: 'SUMMER2024', discount: 20 }
    ];
    
    return promoCodes.find(promo => promo.code === code) || null;
  }

  // ============================================
  // Show Promo Message
  // ============================================
  function showPromoMessage(type, message) {
    if (!promoMessage) return;

    promoMessage.textContent = message;
    promoMessage.className = `promo-message ${type}`;
    promoMessage.style.display = 'block';

    setTimeout(() => {
      if (type === 'error') {
        promoMessage.style.display = 'none';
      }
    }, 3000);
  }

  // ============================================
  // Handle Clear Cart
  // ============================================
  function handleClearCart() {
    const modal = document.getElementById('confirmModal');
    const confirmBtn = document.getElementById('confirmBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const overlay = document.getElementById('modalOverlay');
    const confirmText = document.getElementById('confirmText');

    if (!modal) {
      if (confirm('Очистити кошик?')) {
        window.TechStore.clearCart();
        loadCart();
        renderCart();
      }
      return;
    }

    confirmText.textContent = 'Ви впевнені, що хочете очистити кошик?';
    modal.classList.add('show');

    const handleConfirm = () => {
      window.TechStore.clearCart();
      loadCart();
      renderCart();
      modal.classList.remove('show');
      cleanup();
    };

    const handleCancel = () => {
      modal.classList.remove('show');
      cleanup();
    };

    const cleanup = () => {
      confirmBtn.removeEventListener('click', handleConfirm);
      cancelBtn.removeEventListener('click', handleCancel);
      overlay.removeEventListener('click', handleCancel);
    };

    confirmBtn.addEventListener('click', handleConfirm);
    cancelBtn.addEventListener('click', handleCancel);
    overlay.addEventListener('click', handleCancel);
  }

  // ============================================
  // Handle Checkout
  // ============================================
  function handleCheckout() {
    if (cart.length === 0) {
      window.TechStore.showToast('Помилка', 'Кошик порожній');
      return;
    }

    if (appliedPromo) {
      Utils.setStorage('appliedPromo', appliedPromo);
    }

    window.location.href = 'checkout.html';
  }

  // ============================================
  // Get Category Name
  // ============================================
  function getCategoryName(category) {
    const key = `category_${category}`;
    return window.i18n?.t?.(key) || category;
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

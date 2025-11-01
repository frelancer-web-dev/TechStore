/* ============================================
   TechStore - Checkout Logic (з Utils)
   Оформлення замовлення з валідацією форми
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const FREE_DELIVERY_THRESHOLD = 1000;
  const DELIVERY_PRICES = {
    courier: 100,
    novaposhta: 80,
    pickup: 0
  };

  // ============================================
  // State
  // ============================================
  let cart = [];
  let appliedPromo = null;
  let selectedDelivery = 'courier';
  let selectedPayment = 'card';
  let allProducts = {};

  // ============================================
  // DOM Elements
  // ============================================
  const checkoutForm = document.getElementById('checkoutForm');
  const summaryItems = document.getElementById('summaryItems');
  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryDelivery = document.getElementById('summaryDelivery');
  const summaryDiscount = document.getElementById('summaryDiscount');
  const summaryTotal = document.getElementById('summaryTotal');
  const discountRow = document.getElementById('discountRow');
  const addressFields = document.getElementById('addressFields');
  const promoInput = document.getElementById('promoInput');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  const promoMessage = document.getElementById('promoMessage');
  const loadingOverlay = document.getElementById('loadingOverlay');

  // ============================================
  // Initialize
  // ============================================
  async function init() {
    loadCart();
    loadAppliedPromo();
    
    if (cart.length === 0) {
      redirectToCart();
      return;
    }

    await loadCheckoutProducts();
    
    renderSummary();
    setupEventListeners();
    setupFormValidation();
    
    console.log('✓ Checkout initialized with Utils');
  }

  // ============================================
  // Load Cart
  // ============================================
  function loadCart() {
    cart = window.TechStore.getCart();
  }

  // ============================================
  // Load Checkout Products from JSON
  // ============================================
  async function loadCheckoutProducts() {
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
  // Load Applied Promo
  // ============================================
  function loadAppliedPromo() {
    appliedPromo = Utils.getStorage('appliedPromo', null);
    
    if (appliedPromo) {
      if (promoInput) {
        promoInput.value = appliedPromo.code;
        promoInput.disabled = true;
      }
      if (applyPromoBtn) {
        applyPromoBtn.textContent = 'Застосовано';
        applyPromoBtn.disabled = true;
      }
      if (promoMessage) {
        promoMessage.textContent = `Промокод застосовано! Знижка ${appliedPromo.discount}%`;
        promoMessage.className = 'promo-message success';
        promoMessage.style.display = 'block';
      }
    }
  }

  // ============================================
  // Redirect to Cart
  // ============================================
  function redirectToCart() {
    window.TechStore.showToast('Увага', 'Кошик порожній');
    setTimeout(() => {
      window.location.href = 'cart.html';
    }, 1000);
  }

  // ============================================
  // Setup Event Listeners
  // ============================================
  function setupEventListeners() {
    document.querySelectorAll('input[name="delivery"]').forEach(radio => {
      radio.addEventListener('change', handleDeliveryChange);
    });

    document.querySelectorAll('input[name="payment"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        selectedPayment = e.target.value;
      });
    });

    if (applyPromoBtn) {
      applyPromoBtn.addEventListener('click', handleApplyPromo);
    }

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', handleFormSubmit);
    }

    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', formatPhoneNumber);
    }
  }

  // ============================================
  // Handle Delivery Change
  // ============================================
  function handleDeliveryChange(e) {
    selectedDelivery = e.target.value;
    
    if (addressFields) {
      if (selectedDelivery === 'pickup') {
        addressFields.style.display = 'none';
        addressFields.querySelectorAll('input').forEach(input => {
          input.removeAttribute('required');
        });
      } else {
        addressFields.style.display = 'block';
        addressFields.querySelectorAll('input').forEach(input => {
          input.setAttribute('required', 'required');
        });
      }
    }

    updateSummary();
  }

  // ============================================
  // Calculate Totals
  // ============================================
  function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => {
      const product = getProductById(item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    let deliveryPrice = DELIVERY_PRICES[selectedDelivery] || 0;
    
    if (subtotal >= FREE_DELIVERY_THRESHOLD && selectedDelivery !== 'pickup') {
      deliveryPrice = 0;
    }

    let discount = 0;
    if (appliedPromo) {
      discount = Math.round(subtotal * appliedPromo.discount / 100);
    }

    const total = subtotal + deliveryPrice - discount;

    return { subtotal, deliveryPrice, discount, total };
  }

  // ============================================
  // Render Summary
  // ============================================
  function renderSummary() {
    if (summaryItems) {
      const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
      
      summaryItems.innerHTML = cart.map(item => {
        const product = getProductById(item.id);
        if (!product) return '';

        const name = product.name?.[lang] || product.name?.uk || product.name || 'Продукт';
        const image = Utils.fixImagePath(product.images?.[0] || product.image, false);

        return `
          <div class="summary-item">
            <div class="summary-item-image">
              <img src="${image}" alt="${name}" onerror="this.src='../images/placeholder.jpg'">
            </div>
            <div class="summary-item-info">
              <div class="summary-item-name">${name}</div>
              <div class="summary-item-quantity">Кількість: ${item.quantity}</div>
            </div>
            <div class="summary-item-price">
              ${Utils.formatPrice(product.price * item.quantity)}
            </div>
          </div>
        `;
      }).join('');
    }

    updateSummary();
  }

  // ============================================
  // Update Summary
  // ============================================
  function updateSummary() {
    const { subtotal, deliveryPrice, discount, total } = calculateTotals();

    if (summarySubtotal) {
      summarySubtotal.textContent = Utils.formatPrice(subtotal);
    }

    if (summaryDelivery) {
      summaryDelivery.textContent = deliveryPrice === 0 
        ? 'Безкоштовно' 
        : Utils.formatPrice(deliveryPrice);
    }

    if (summaryDiscount) {
      summaryDiscount.textContent = `-${Utils.formatPrice(discount)}`;
    }

    if (discountRow) {
      discountRow.style.display = discount > 0 ? 'flex' : 'none';
    }

    if (summaryTotal) {
      summaryTotal.textContent = Utils.formatPrice(total);
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
      Utils.setStorage('appliedPromo', promo);
      
      showPromoMessage('success', `Промокод застосовано! Знижка ${promo.discount}%`);
      
      if (promoInput) promoInput.disabled = true;
      if (applyPromoBtn) {
        applyPromoBtn.textContent = 'Застосовано';
        applyPromoBtn.disabled = true;
      }
      
      updateSummary();
    } else {
      showPromoMessage('error', 'Невірний промокод');
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

    if (type === 'error') {
      setTimeout(() => {
        promoMessage.style.display = 'none';
      }, 3000);
    }
  }

  // ============================================
  // Setup Form Validation
  // ============================================
  function setupFormValidation() {
    if (!checkoutForm) return;

    const inputs = checkoutForm.querySelectorAll('input[required], textarea[required]');
    
    inputs.forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => clearError(input));
    });
  }

  // ============================================
  // Validate Field
  // ============================================
  function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required') && !value) {
      isValid = false;
      errorMessage = 'Це поле обов\'язкове';
    }
    else if (field.type === 'email' && !Utils.validateEmail(value)) {
      isValid = false;
      errorMessage = 'Невірний формат email';
    }
    else if (field.type === 'tel' && !Utils.validatePhone(value)) {
      isValid = false;
      errorMessage = 'Невірний формат телефону';
    }
    else if (field.type === 'checkbox' && field.name === 'terms' && !field.checked) {
      isValid = false;
      errorMessage = 'Необхідно погодитись з умовами';
    }

    if (!isValid) {
      showFieldError(field, errorMessage);
    } else {
      clearError(field);
    }

    return isValid;
  }

  // ============================================
  // Show Field Error
  // ============================================
  function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorId = `${field.name}Error`;
    const errorEl = document.getElementById(errorId);
    
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    }
  }

  // ============================================
  // Clear Error
  // ============================================
  function clearError(field) {
    field.classList.remove('error');
    
    const errorId = `${field.name}Error`;
    const errorEl = document.getElementById(errorId);
    
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  // ============================================
  // Format Phone Number
  // ============================================
  function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.startsWith('380')) {
      value = value.substring(3);
    }

    let formatted = '+380';
    
    if (value.length > 0) {
      formatted += ' (' + value.substring(0, 2);
    }
    if (value.length >= 3) {
      formatted += ') ' + value.substring(2, 5);
    }
    if (value.length >= 6) {
      formatted += '-' + value.substring(5, 7);
    }
    if (value.length >= 8) {
      formatted += '-' + value.substring(7, 9);
    }

    e.target.value = formatted;
  }

  // ============================================
  // Handle Form Submit
  // ============================================
  async function handleFormSubmit(e) {
    e.preventDefault();

    const inputs = checkoutForm.querySelectorAll('input[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });

    if (!isValid) {
      window.TechStore.showToast('Помилка', 'Заповніть всі обов\'язкові поля');
      
      const firstError = checkoutForm.querySelector('.error');
      if (firstError) {
        Utils.scrollToElement(firstError, 100);
        firstError.focus();
      }
      
      return;
    }

    if (loadingOverlay) {
      loadingOverlay.classList.add('show');
    }

    const formData = new FormData(checkoutForm);
    const lang = window.i18n?.getCurrentLanguage?.() || 'uk';
    
    const orderData = {
      customer: {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        email: formData.get('email')
      },
      delivery: {
        method: selectedDelivery,
        city: formData.get('city') || '',
        address: formData.get('address') || ''
      },
      payment: {
        method: selectedPayment
      },
      items: cart.map(item => {
        const product = getProductById(item.id);
        const name = product?.name?.[lang] || product?.name?.uk || product?.name || 'Продукт';
        return {
          id: item.id,
          name: name,
          price: product ? product.price : 0,
          quantity: item.quantity
        };
      }),
      comment: formData.get('comment') || '',
      callMe: formData.get('callMe') === 'on',
      newsletter: formData.get('newsletter') === 'on',
      totals: calculateTotals(),
      promoCode: appliedPromo ? appliedPromo.code : null,
      timestamp: new Date().toISOString()
    };

    try {
      await simulateOrderSubmission(orderData);
      
      Utils.setStorage('lastOrder', {
        orderNumber: generateOrderNumber(),
        items: orderData.items,
        total: orderData.totals.total
      });

      window.TechStore.clearCart();
      Utils.removeStorage('appliedPromo');

      window.location.href = 'order-success.html';
      
    } catch (error) {
      console.error('Order submission error:', error);
      
      if (loadingOverlay) {
        loadingOverlay.classList.remove('show');
      }
      
      window.TechStore.showToast('Помилка', 'Не вдалося оформити замовлення. Спробуйте ще раз.');
    }
  }

  // ============================================
  // Simulate Order Submission
  // ============================================
  function simulateOrderSubmission(orderData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Order submitted:', orderData);
        
        if (Math.random() > 0.05) {
          resolve({ success: true, orderId: generateOrderNumber() });
        } else {
          reject(new Error('Network error'));
        }
      }, 2000);
    });
  }

  // ============================================
  // Generate Order Number
  // ============================================
  function generateOrderNumber() {
    return Utils.randomInt(10000, 99999);
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

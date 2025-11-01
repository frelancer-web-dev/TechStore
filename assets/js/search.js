/* ============================================
   TechStore - Search Logic
   Пошук товарів з автодоповненням та історією
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const SEARCH_HISTORY_KEY = 'techstore-search-history';
  const MAX_HISTORY_ITEMS = 10;
  const MAX_SUGGESTIONS = 8;
  const DEBOUNCE_DELAY = 300;

  // ============================================
  // State
  // ============================================
  let searchHistory = [];
  let allProducts = [];
  let searchTimeout = null;

  // ============================================
  // DOM Elements
  // ============================================
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  let searchDropdown = null;

  // ============================================
  // Initialize
  // ============================================
  function init() {
    loadSearchHistory();
    allProducts = getAllProducts();
    setupEventListeners();
    createSearchDropdown();
    
    console.log('✓ Search initialized');
  }

  // ============================================
  // Create Search Dropdown
  // ============================================
  function createSearchDropdown() {
    if (!searchInput) return;

    // Create dropdown element
    searchDropdown = document.createElement('div');
    searchDropdown.className = 'search-dropdown';
    searchDropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--bg-primary);
      border: 2px solid var(--border-color);
      border-top: none;
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      max-height: 400px;
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      display: none;
      z-index: 1000;
    `;

    // Insert after search bar
    const searchBar = searchInput.closest('.search-bar');
    if (searchBar) {
      searchBar.style.position = 'relative';
      searchBar.appendChild(searchDropdown);
    }
  }

  // ============================================
  // Setup Event Listeners
  // ============================================
  function setupEventListeners() {
    if (!searchInput) return;

    // Input with debounce
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value.trim();

      if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
          showSuggestions(query);
        }, DEBOUNCE_DELAY);
      } else {
        hideDropdown();
      }
    });

    // Focus - show history
    searchInput.addEventListener('focus', () => {
      if (!searchInput.value && searchHistory.length > 0) {
        showHistory();
      }
    });

    // Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performSearch(searchInput.value);
      }
    });

    // Search button
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value);
      });
    }

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown?.contains(e.target)) {
        hideDropdown();
      }
    });
  }

  // ============================================
  // Show Suggestions
  // ============================================
  function showSuggestions(query) {
    if (!searchDropdown) return;

    const results = searchProducts(query).slice(0, MAX_SUGGESTIONS);

    if (results.length === 0) {
      showNoResults(query);
      return;
    }

    const html = `
      <div class="search-results">
        <div class="search-header">
          <i class="fas fa-search"></i>
          <span>Результати пошуку</span>
        </div>
        ${results.map(product => `
          <a href="./assets/html/product.html?id=${product.id}" class="search-result-item">
            <div class="search-result-image">
              <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="search-result-info">
              <div class="search-result-name">${highlightQuery(product.name, query)}</div>
              <div class="search-result-category">${product.category}</div>
            </div>
            <div class="search-result-price">${formatPrice(product.price)}</div>
          </a>
        `).join('')}
        ${results.length === MAX_SUGGESTIONS ? `
          <div class="search-footer">
            <button onclick="performSearch('${query}')" class="search-view-all">
              <i class="fas fa-arrow-right"></i>
              Показати всі результати
            </button>
          </div>
        ` : ''}
      </div>
    `;

    searchDropdown.innerHTML = html;
    showDropdown();
    addSearchResultsStyles();
  }

  // ============================================
  // Show No Results
  // ============================================
  function showNoResults(query) {
    if (!searchDropdown) return;

    searchDropdown.innerHTML = `
      <div class="search-no-results">
        <i class="fas fa-search"></i>
        <p>Нічого не знайдено за запитом "<strong>${escapeHtml(query)}</strong>"</p>
        <small>Спробуйте інший запит</small>
      </div>
    `;

    showDropdown();
    addSearchResultsStyles();
  }

  // ============================================
  // Show History
  // ============================================
  function showHistory() {
    if (!searchDropdown || searchHistory.length === 0) return;

    const html = `
      <div class="search-history">
        <div class="search-header">
          <i class="fas fa-clock"></i>
          <span>Історія пошуку</span>
          <button onclick="clearSearchHistory()" class="btn-clear-history">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        ${searchHistory.map((item, index) => `
          <div class="search-history-item">
            <button onclick="performSearch('${item}')" class="history-query">
              <i class="fas fa-history"></i>
              <span>${escapeHtml(item)}</span>
            </button>
            <button onclick="removeFromHistory(${index})" class="btn-remove-history">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `).join('')}
      </div>
    `;

    searchDropdown.innerHTML = html;
    showDropdown();
    addSearchResultsStyles();
  }

  // ============================================
  // Perform Search
  // ============================================
  window.performSearch = function(query) {
    query = query.trim();
    
    if (!query) {
      hideDropdown();
      return;
    }

    // Add to history
    addToSearchHistory(query);

    // Redirect to catalog with search query
    const url = window.location.pathname.includes('catalog.html')
      ? `catalog.html?search=${encodeURIComponent(query)}`
      : `./assets/html/catalog.html?search=${encodeURIComponent(query)}`;

    window.location.href = url;
  };

  // ============================================
  // Load Search History
  // ============================================
  function loadSearchHistory() {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      searchHistory = stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading search history:', error);
      searchHistory = [];
    }
  }

  // ============================================
  // Add to Search History
  // ============================================
  function addToSearchHistory(query) {
    // Remove if already exists
    searchHistory = searchHistory.filter(item => 
      item.toLowerCase() !== query.toLowerCase()
    );

    // Add to beginning
    searchHistory.unshift(query);

    // Limit history size
    if (searchHistory.length > MAX_HISTORY_ITEMS) {
      searchHistory = searchHistory.slice(0, MAX_HISTORY_ITEMS);
    }

    // Save to localStorage
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  // ============================================
  // Clear Search History (Global)
  // ============================================
  window.clearSearchHistory = function() {
    searchHistory = [];
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    hideDropdown();
    window.TechStore?.showToast('Успішно', 'Історію пошуку очищено');
  };

  // ============================================
  // Remove from History (Global)
  // ============================================
  window.removeFromHistory = function(index) {
    searchHistory.splice(index, 1);
    
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
    } catch (error) {
      console.error('Error updating search history:', error);
    }

    if (searchHistory.length === 0) {
      hideDropdown();
    } else {
      showHistory();
    }
  };

  // ============================================
  // Highlight Query in Text
  // ============================================
  function highlightQuery(text, query) {
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // ============================================
  // Escape RegExp
  // ============================================
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // ============================================
  // Escape HTML
  // ============================================
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ============================================
  // Format Price
  // ============================================
  function formatPrice(price) {
    return `${price.toLocaleString('uk-UA')} ₴`;
  }

  // ============================================
  // Show/Hide Dropdown
  // ============================================
  function showDropdown() {
    if (searchDropdown) {
      searchDropdown.style.display = 'block';
    }
  }

  function hideDropdown() {
    if (searchDropdown) {
      searchDropdown.style.display = 'none';
    }
  }

  // ============================================
  // Add Search Results Styles
  // ============================================
  function addSearchResultsStyles() {
    if (document.getElementById('search-results-styles')) return;

    const style = document.createElement('style');
    style.id = 'search-results-styles';
    style.textContent = `
      .search-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: var(--bg-secondary);
        font-size: var(--font-size-sm);
        font-weight: 600;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-color);
      }

      .search-footer {
        padding: 0.75rem 1rem;
        border-top: 1px solid var(--border-color);
        background: var(--bg-secondary);
      }

      .search-view-all {
        width: 100%;
        padding: 0.5rem;
        background: transparent;
        border: none;
        color: var(--primary-color);
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: var(--transition-fast);
      }

      .search-view-all:hover {
        background: var(--bg-primary);
      }

      .search-result-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1rem;
        text-decoration: none;
        color: inherit;
        transition: var(--transition-fast);
        border-bottom: 1px solid var(--border-color);
      }

      .search-result-item:hover {
        background: var(--bg-secondary);
      }

      .search-result-image {
        width: 50px;
        height: 50px;
        flex-shrink: 0;
        border-radius: var(--radius-sm);
        overflow: hidden;
        background: var(--bg-secondary);
      }

      .search-result-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .search-result-info {
        flex: 1;
        min-width: 0;
      }

      .search-result-name {
        font-weight: 600;
        font-size: var(--font-size-sm);
        margin-bottom: 0.25rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .search-result-name mark {
        background: rgba(255, 107, 53, 0.2);
        color: var(--primary-color);
        padding: 0 2px;
        border-radius: 2px;
      }

      .search-result-category {
        font-size: var(--font-size-xs);
        color: var(--text-secondary);
        text-transform: capitalize;
      }

      .search-result-price {
        font-weight: 700;
        color: var(--primary-color);
        white-space: nowrap;
      }

      .search-no-results {
        padding: 2rem;
        text-align: center;
        color: var(--text-secondary);
      }

      .search-no-results i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.3;
      }

      .search-no-results p {
        margin-bottom: 0.5rem;
      }

      .search-history-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid var(--border-color);
      }

      .history-query {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        background: transparent;
        border: none;
        text-align: left;
        cursor: pointer;
        color: inherit;
        font-size: var(--font-size-sm);
        transition: var(--transition-fast);
        border-radius: var(--radius-sm);
      }

      .history-query:hover {
        background: var(--bg-secondary);
      }

      .btn-remove-history,
      .btn-clear-history {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        border-radius: var(--radius-sm);
        transition: var(--transition-fast);
      }

      .btn-remove-history:hover,
      .btn-clear-history:hover {
        background: var(--danger-color);
        color: white;
      }

      .btn-clear-history {
        margin-left: auto;
      }

      .search-dropdown::-webkit-scrollbar {
        width: 6px;
      }

      .search-dropdown::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: var(--radius-full);
      }
    `;

    document.head.appendChild(style);
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

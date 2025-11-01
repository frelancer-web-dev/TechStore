# 🛒 TechStore - Electronics E-commerce Store

Modern, full-featured electronics e-commerce store with responsive design and multi-language support.

## 🚀 Features

- ✅ **Full e-commerce functionality** - catalog, filters, cart, checkout
- 🌍 **3 languages** - Ukrainian, English, Russian (i18n via JSON)
- 🎨 **Dark/Light theme** - with automatic system preference detection
- 📱 **Fully responsive** - Mobile-first approach
- 🔍 **Smart search** - with autocomplete and history
- ⭐ **Favorites** - save favorite products
- 📦 **JSON-based products** - easy to add/edit products
- 🎯 **SEO-optimized** - meta tags, structured data ready
- ♿ **Accessibility** - ARIA-labels, keyboard navigation
- 🚫 **Vanilla JS** - no frameworks, pure JavaScript

## 📁 Project Structure

```
TechStore/
├── index.html              # Home page
├── 404.html               # Error page
├── favicon.png            # Site icon
├── assets/
│   ├── html/             # HTML pages
│   │   ├── catalog.html
│   │   ├── product.html
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── order-success.html
│   │   ├── favorites.html
│   │   ├── about.html
│   │   └── contacts.html
│   ├── css/              # Styles (modular)
│   │   ├── styles.css         # Base variables and reset
│   │   ├── main.css           # Header, footer, hero
│   │   ├── components.css     # Toast, modals, pagination
│   │   ├── product.css        # Product cards
│   │   ├── catalog.css        # Filters, sorting
│   │   ├── cart.css           # Cart and checkout
│   │   ├── about-contacts.css # About, contacts
│   │   ├── favorites.css      # Favorites
│   │   └── theme.css          # Dark theme
│   ├── js/               # JavaScript (modular)
│   │   ├── utils.js           # Utilities (must load first)
│   │   ├── i18n.js            # Internationalization
│   │   ├── theme.js           # Theme switcher
│   │   ├── main.js            # Main logic
│   │   ├── catalog.js         # Catalog
│   │   ├── product.js         # Product page
│   │   ├── cart.js            # Cart
│   │   ├── checkout.js        # Checkout
│   │   ├── favorites.js       # Favorites
│   │   └── search.js          # Search
│   └── images/           # Product images
└── data/
    ├── products/         # Product JSON files (by category)
    │   ├── phones/
    │   ├── laptops/
    │   ├── headphones/
    │   ├── smartwatches/
    │   └── accessories/
    └── translations/     # JSON translations
        ├── uk.json
        ├── en.json
        └── ru.json
```

## 🛠️ Technologies

- **HTML5** - semantic markup
- **CSS3** - CSS Grid, Flexbox, CSS Variables
- **JavaScript (ES6+)** - modular architecture
- **LocalStorage** - data persistence
- **Font Awesome 6.5.1** - icons
- **Google Fonts** - Inter

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/techstore.git
cd techstore
```

### 2. Start Local Server

**Option 1: Live Server (VS Code)**
- Install "Live Server" extension
- Right-click on `index.html` → Open with Live Server

**Option 2: Python**
```bash
# Python 3
python -m http.server 8000
```

**Option 3: Node.js (http-server)**
```bash
npm install -g http-server
http-server -p 8000
```

**Option 4: npm scripts**
```bash
npm install
npm start
```

### 3. Open in Browser

```
http://localhost:8000
```

## 📦 Adding a New Product

1. Create JSON file in the appropriate category (`data/products/{category}/{id}.json`):

```json
{
  "id": "new_product",
  "name": {
    "uk": "Назва товару",
    "en": "Product Name",
    "ru": "Название товара"
  },
  "price": 15999,
  "oldPrice": 18999,
  "images": ["images/products/product.jpg"],
  "category": "phones",
  "brand": "Apple",
  "rating": 4.8,
  "reviews": 156,
  "inStock": true,
  "isNew": true,
  "discount": 15,
  "description": {
    "uk": "Опис товару...",
    "en": "Product description...",
    "ru": "Описание товара..."
  },
  "features": {
    "uk": ["Характеристика 1", "Характеристика 2"],
    "en": ["Feature 1", "Feature 2"],
    "ru": ["Характеристика 1", "Характеристика 2"]
  },
  "specifications": {
    "Display": "6.7 inches",
    "Processor": "A17 Pro",
    "Camera": "48 MP"
  }
}
```

2. Add product to the array in `catalog.js` and `main.js`:

```javascript
const productFiles = [
  // ...
  { category: 'phones', id: 'new_product' }
];
```

## 🌍 Adding New Translation

Add translation keys to `data/translations/{lang}.json` files:

```json
{
  "new_key": "Translation",
  "another_key": "Another translation"
}
```

Usage in HTML:
```html
<span data-i18n="new_key">Translation</span>
<input data-i18n-placeholder="search_placeholder">
```

## 🎨 Design Customization

All colors and styles are centralized in `assets/css/styles.css`:

```css
:root {
  --primary-color: #FF6B35;
  --secondary-color: #F7931E;
  --text-primary: #1a1a1a;
  --bg-primary: #ffffff;
  /* ... other variables */
}
```

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ IE 11 (not supported)

## 🐛 Known Limitations

- No backend - all data stored in LocalStorage
- No real payment processing - simulation only
- Email confirmation - simulation only
- Search works only with loaded products

## 📄 License

MIT License - use freely for personal and commercial projects.

## 👨‍💻 Author

**TechStore Team**
- Email: info@techstore.ua
- GitHub: [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for Inter typeface
- All contributors and testers

---

**⚠️ This is a demo project for portfolio. Not a real e-commerce store.**

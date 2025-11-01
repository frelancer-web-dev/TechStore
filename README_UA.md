# 🛒 TechStore - Інтернет-магазин електроніки

Сучасний, повнофункціональний інтернет-магазин електроніки з адаптивним дизайном та багатомовною підтримкою.

## 🚀 Особливості

- ✅ **Повний функціонал e-commerce** - каталог, фільтри, кошик, оформлення замовлення
- 🌍 **3 мови** - українська, англійська, російська (i18n через JSON)
- 🎨 **Темна/Світла тема** - з автоматичним визначенням системних налаштувань
- 📱 **Повністю адаптивний** - Mobile-first підхід
- 🔍 **Розумний пошук** - з автодоповненням та історією
- ⭐ **Обране** - збереження улюблених товарів
- 📦 **JSON-based продукти** - легке додавання/редагування товарів
- 🎯 **SEO-оптимізований** - meta-теги, structured data ready
- ♿ **Accessibility** - ARIA-labels, keyboard navigation
- 🚫 **Vanilla JS** - без фреймворків, чистий JavaScript

## 📁 Структура проекту

```
TechStore/
├── index.html              # Головна сторінка
├── 404.html               # Сторінка помилки
├── favicon.png            # Іконка сайту
├── assets/
│   ├── html/             # HTML сторінки
│   │   ├── catalog.html
│   │   ├── product.html
│   │   ├── cart.html
│   │   ├── checkout.html
│   │   ├── order-success.html
│   │   ├── favorites.html
│   │   ├── about.html
│   │   └── contacts.html
│   ├── css/              # Стилі (модульні)
│   │   ├── styles.css         # Базові змінні та reset
│   │   ├── main.css           # Header, footer, hero
│   │   ├── components.css     # Toast, модалки, пагінація
│   │   ├── product.css        # Картки товарів
│   │   ├── catalog.css        # Фільтри, сортування
│   │   ├── cart.css           # Кошик та checkout
│   │   ├── about-contacts.css # Про нас, контакти
│   │   ├── favorites.css      # Обране
│   │   └── theme.css          # Темна тема
│   ├── js/               # JavaScript (модульний)
│   │   ├── utils.js           # Утиліти (обов'язково першим)
│   │   ├── i18n.js            # Інтернаціоналізація
│   │   ├── theme.js           # Перемикач теми
│   │   ├── main.js            # Основна логіка
│   │   ├── catalog.js         # Каталог
│   │   ├── product.js         # Сторінка товару
│   │   ├── cart.js            # Кошик
│   │   ├── checkout.js        # Оформлення
│   │   ├── favorites.js       # Обране
│   │   └── search.js          # Пошук
│   └── images/           # Зображення товарів
└── data/
    ├── products/         # JSON файли товарів (по категоріях)
    │   ├── phones/
    │   ├── laptops/
    │   ├── headphones/
    │   ├── smartwatches/
    │   └── accessories/
    └── translations/     # JSON переклади
        ├── uk.json
        ├── en.json
        └── ru.json
```

## 🛠️ Технології

- **HTML5** - семантична верстка
- **CSS3** - CSS Grid, Flexbox, CSS Variables
- **JavaScript (ES6+)** - модульна архітектура
- **LocalStorage** - збереження даних
- **Font Awesome 6.5.1** - іконки
- **Google Fonts** - Inter

## 🚀 Швидкий старт

### 1. Клонування репозиторію

```bash
git clone https://github.com/yourusername/techstore.git
cd techstore
```

### 2. Запуск локального сервера

**Варіант 1: Live Server (VS Code)**
- Встановіть розширення "Live Server"
- Правий клік на `index.html` → Open with Live Server

**Варіант 2: Python**
```bash
# Python 3
python -m http.server 8000
```

**Варіант 3: Node.js (http-server)**
```bash
npm install -g http-server
http-server -p 8000
```

**Варіант 4: npm scripts**
```bash
npm install
npm start
```

### 3. Відкрити в браузері

```
http://localhost:8000
```

## 📦 Додавання нового товару

1. Створіть JSON файл у відповідній категорії (`data/products/{category}/{id}.json`):

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
    "Екран": "6.7 дюймів",
    "Процесор": "A17 Pro",
    "Камера": "48 MP"
  }
}
```

2. Додайте товар до масиву у `catalog.js` та `main.js`:

```javascript
const productFiles = [
  // ...
  { category: 'phones', id: 'new_product' }
];
```

## 🌍 Додавання нового перекладу

Додайте переклад ключів у файли `data/translations/{lang}.json`:

```json
{
  "new_key": "Переклад",
  "another_key": "Інший переклад"
}
```

Використання в HTML:
```html
<span data-i18n="new_key">Переклад</span>
<input data-i18n-placeholder="search_placeholder">
```

## 🎨 Налаштування дизайну

Всі кольори та стилі централізовані у `assets/css/styles.css`:

```css
:root {
  --primary-color: #FF6B35;
  --secondary-color: #F7931E;
  --text-primary: #1a1a1a;
  --bg-primary: #ffffff;
  /* ... інші змінні */
}
```

## 📱 Браузерна підтримка

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ❌ IE 11 (не підтримується)

## 🐛 Відомі обмеження

- Немає backend - всі дані зберігаються в LocalStorage
- Немає реальної оплати - симуляція
- Email підтвердження - симуляція
- Пошук працює тільки з завантаженими продуктами

## 📄 Ліцензія

MIT License - використовуйте вільно для особистих та комерційних проектів.

## Author

**Mykola And Jarvis**
- Frontend Developer & Designer
- Portfolio: This project
- GitHub: frelancer-web-dev

## 🙏 Подяки

- Font Awesome за іконки
- Google Fonts за шрифт Inter
- Всім контриб'юторам та тестувальникам

---

**⚠️ Це демонстраційний проект для портфоліо. Не є реальним інтернет-магазином.**

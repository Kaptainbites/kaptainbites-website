const WHATSAPP_NUMBER = "917760172150";
const MAX_SEARCH_PRODUCTS = 4;
const MAX_SEARCH_KEYWORDS = 6;
const PRODUCT_CATALOG = Array.isArray(window.KAPTAINBITES_PRODUCTS) ? window.KAPTAINBITES_PRODUCTS : [];
const PRODUCTS_PAGE_URL = "products.html";

const productQuantities = new Map(PRODUCT_CATALOG.map((product) => [product.id, 1]));
const cartApi = window.KAPTAINBITES_CART || null;

function scrollToSection(target, smooth = true) {
if (!target) {
return;
}

const header = document.querySelector(".site-header");
const headerOffset = header ? header.getBoundingClientRect().height + 18 : 18;
const targetTop = target.getBoundingClientRect().top + window.scrollY - headerOffset;

window.scrollTo({
top: Math.max(targetTop, 0),
behavior: smooth ? "smooth" : "auto"
});
}

function setupMobileNavigation() {
const header = document.querySelector(".site-header");
const menuToggle = header?.querySelector(".site-header__menu-toggle");
const nav = header?.querySelector(".site-nav");

if (!header || !menuToggle || !nav) {
return;
}

function closeNav() {
header.classList.remove("is-nav-open");
menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", () => {
const isOpen = header.classList.toggle("is-nav-open");
menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.querySelectorAll("a").forEach((link) => {
link.addEventListener("click", closeNav);
});

document.addEventListener("click", (event) => {
if (header.contains(event.target)) {
return;
}

closeNav();
});

window.addEventListener("resize", closeNav);
}

function buildOrderMessage(product, quantity) {
const total = quantity * product.price;

return `Hi, I want to order:

Product: ${product.name}
Quantity: ${quantity}
Price per pack: Rs.${product.price}
Total: Rs.${total}

Please share payment details.`;
}

function flashButtonFeedback(button, label) {
if (!button) {
return;
}

const originalLabel = button.dataset.originalLabel || button.textContent;
button.dataset.originalLabel = originalLabel;
button.textContent = label;
button.disabled = true;

window.setTimeout(() => {
button.textContent = originalLabel;
button.disabled = false;
}, 1200);
}

function getProductById(productId) {
return PRODUCT_CATALOG.find((product) => product.id === productId);
}

function openProductPage(product) {
if (!product || !product.pageUrl) {
return;
}

window.location.href = product.pageUrl;
}

function openProductsPage(query = "") {
const normalizedQuery = query.trim();
const targetUrl = normalizedQuery
? `${PRODUCTS_PAGE_URL}?q=${encodeURIComponent(normalizedQuery)}`
: PRODUCTS_PAGE_URL;

window.location.href = targetUrl;
}

function normalizeSearchQuery(query = "") {
return query.trim().toLowerCase();
}

function matchesSearch(product, query) {
if (!query) {
return true;
}

const searchableText = [
product.line,
product.name,
product.description,
product.notes.join(" "),
product.searchTerms.join(" ")
].join(" ").toLowerCase();

return searchableText.includes(query);
}

function getFilteredProducts(query = "") {
const normalizedQuery = normalizeSearchQuery(query);
return PRODUCT_CATALOG.filter((product) => matchesSearch(product, normalizedQuery));
}

function buildSearchKeywords(query, matches) {
const normalizedQuery = normalizeSearchQuery(query);
const keywordPool = new Set();

matches.forEach((product) => {
product.searchTerms.forEach((term) => keywordPool.add(term));
});

if (!keywordPool.size) {
PRODUCT_CATALOG.forEach((product) => {
product.searchTerms.forEach((term) => keywordPool.add(term));
});
}

const filteredKeywords = Array.from(keywordPool).filter((term) => {
if (!normalizedQuery) {
return true;
}

return term.includes(normalizedQuery) || normalizedQuery.includes(term);
});

return filteredKeywords.slice(0, MAX_SEARCH_KEYWORDS);
}

function buildSearchProductResult(product, isActive) {
const oldPrice = Math.round(product.price * 1.25);

return `
<button
type="button"
class="search-panel__product${isActive ? " is-active" : ""}"
data-product-id="${product.id}"
role="option"
aria-selected="${isActive}"
>
<img src="${product.image}" class="search-panel__product-image" alt="${product.alt}">
<span class="search-panel__product-copy">
<span class="search-panel__product-name">${product.name}</span>
<span class="search-panel__product-price">Rs.${product.price}.00 <s>Rs.${oldPrice}.00</s></span>
</span>
</button>`;
}

function buildProductCard(product) {
const quantity = productQuantities.get(product.id) || 1;

return `
<article class="product-card product-card--${product.theme}" data-product-id="${product.id}">
<a class="product-card__visual" href="${product.pageUrl}" aria-label="${product.name}">
<span class="product-card__badge">${product.badge}</span>
<img src="${product.image}" class="product-card__image" alt="${product.alt}">
</a>

<div class="product-card__body">
<div class="product-card__header">
<h3><a class="product-card__title-link" href="${product.pageUrl}">${product.name}</a></h3>
<p class="product-card__price">&#8377;${product.price} <span>/ pack</span></p>
</div>

<div class="product-card__purchase">
<div class="product-card__controls">
<div class="quantity-control quantity-control--catalog" aria-label="Select quantity for ${product.name}">
<button type="button" class="qty-btn" data-action="decrease">-</button>
<span class="qty-value" data-qty>${quantity}</span>
<button type="button" class="qty-btn" data-action="increase">+</button>
</div>
<button type="button" class="product-card__quick cart-btn">Add to Cart</button>
</div>
<button type="button" class="product-card__quick product-card__quick--whatsapp order-btn">Order on WhatsApp</button>
</div>
</div>
</article>`;
}

function updateCatalogCounts(visibleCount, query) {
const productCount = document.getElementById("product-count");

if (!productCount) {
return;
}

productCount.textContent = query
? `${visibleCount} found`
: `${visibleCount} ${visibleCount === 1 ? "snack" : "snacks"} available`;
}

function renderProductCatalog(query = "") {
const normalizedQuery = normalizeSearchQuery(query);
const grid = document.getElementById("products-grid");
const emptyState = document.getElementById("catalog-empty");

if (!grid) {
return;
}

const filteredProducts = getFilteredProducts(normalizedQuery);

grid.innerHTML = filteredProducts.map(buildProductCard).join("");
updateCatalogCounts(filteredProducts.length, normalizedQuery);

if (emptyState) {
emptyState.hidden = filteredProducts.length !== 0;
}
}

function setupCatalogInteractions() {
const grid = document.getElementById("products-grid");
const searchInput = document.getElementById("product-search");
const searchForm = document.querySelector(".site-search");
const searchClear = document.querySelector(".site-search__clear");
const searchDropdown = document.getElementById("search-dropdown");
const searchKeywords = document.getElementById("search-keywords");
const searchViewAll = document.getElementById("search-view-all");
const suggestionsList = document.getElementById("search-suggestions-list");
let activeSuggestionIndex = -1;

function hideSuggestions() {
if (searchDropdown) {
searchDropdown.hidden = true;
}

if (suggestionsList) {
suggestionsList.innerHTML = "";
}

if (searchKeywords) {
searchKeywords.innerHTML = "";
}

if (searchInput) {
searchInput.setAttribute("aria-expanded", "false");
}

activeSuggestionIndex = -1;
}

function updateClearButton() {
if (!searchClear || !searchInput) {
return;
}

searchClear.hidden = searchInput.value.trim().length === 0;
}

function renderSuggestions(query) {
if (!searchInput || !searchDropdown || !suggestionsList || !searchKeywords) {
return;
}

const normalizedQuery = normalizeSearchQuery(query);
updateClearButton();

if (!normalizedQuery) {
hideSuggestions();
return;
}

const matches = getFilteredProducts(normalizedQuery).slice(0, MAX_SEARCH_PRODUCTS);
const keywords = buildSearchKeywords(normalizedQuery, matches);

searchKeywords.innerHTML = keywords.length
? keywords.map((keyword) => `<button type="button" class="search-panel__keyword" data-keyword="${keyword}">${keyword}</button>`).join("")
: `<span class="site-search__empty">No suggestions yet.</span>`;

if (!matches.length) {
suggestionsList.innerHTML = `<p class="site-search__empty">No matching products found.</p>`;
activeSuggestionIndex = -1;
} else {
if (activeSuggestionIndex >= matches.length) {
activeSuggestionIndex = matches.length - 1;
}

suggestionsList.innerHTML = matches.map((product, index) => buildSearchProductResult(product, index === activeSuggestionIndex)).join("");
}

searchDropdown.hidden = false;
searchInput.setAttribute("aria-expanded", "true");
}

function focusMatchingCard(productId) {
const card = document.querySelector(`[data-product-id="${productId}"]`);

if (!card) {
return;
}

card.classList.add("product-card--focus");
window.setTimeout(() => {
card.classList.remove("product-card--focus");
}, 1400);
}

function selectSuggestion(productId) {
const product = getProductById(productId);
if (!product) {
return;
}

openProductPage(product);
}

function showCatalogResults(query) {
if (!grid) {
openProductsPage(query);
return;
}

renderProductCatalog(query);
hideSuggestions();
scrollToSection(document.getElementById("products"));
}

if (searchInput) {
searchInput.addEventListener("input", () => {
renderProductCatalog(searchInput.value);
activeSuggestionIndex = -1;
renderSuggestions(searchInput.value);
});

searchInput.addEventListener("focus", () => {
if (searchInput.value.trim()) {
renderSuggestions(searchInput.value);
}
});

searchInput.addEventListener("keydown", (event) => {
if (!suggestionsList) {
return;
}

const suggestionButtons = Array.from(suggestionsList.querySelectorAll(".search-panel__product"));

if (event.key === "Escape") {
hideSuggestions();
return;
}

if (event.key === "ArrowDown" && suggestionButtons.length) {
event.preventDefault();
activeSuggestionIndex = (activeSuggestionIndex + 1 + suggestionButtons.length) % suggestionButtons.length;
renderSuggestions(searchInput.value);
return;
}

if (event.key === "ArrowUp" && suggestionButtons.length) {
event.preventDefault();
activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestionButtons.length) % suggestionButtons.length;
renderSuggestions(searchInput.value);
return;
}

if (event.key === "Enter" && searchInput.value.trim()) {
event.preventDefault();

if (suggestionButtons.length) {
const selectedButton = activeSuggestionIndex >= 0 ? suggestionButtons[activeSuggestionIndex] : suggestionButtons[0];
selectSuggestion(selectedButton.dataset.productId);
return;
}

showCatalogResults(searchInput.value);
}
});
}

if (searchForm) {
searchForm.addEventListener("submit", (event) => {
event.preventDefault();

if (searchInput && searchInput.value.trim()) {
showCatalogResults(searchInput.value);
}
});
}

if (searchClear) {
searchClear.addEventListener("click", () => {
if (!searchInput) {
return;
}

searchInput.value = "";
renderProductCatalog();
updateClearButton();
hideSuggestions();
searchInput.focus();
});
}

if (suggestionsList) {
suggestionsList.addEventListener("click", (event) => {
const button = event.target.closest(".search-panel__product");

if (!button) {
return;
}

selectSuggestion(button.dataset.productId);
});
}

if (searchKeywords) {
searchKeywords.addEventListener("click", (event) => {
const keywordButton = event.target.closest(".search-panel__keyword");

if (!keywordButton || !searchInput) {
return;
}

searchInput.value = keywordButton.dataset.keyword;

if (!grid) {
openProductsPage(searchInput.value);
return;
}

renderProductCatalog(searchInput.value);
renderSuggestions(searchInput.value);
});
}

if (searchViewAll) {
searchViewAll.addEventListener("click", () => {
if (!searchInput) {
return;
}

showCatalogResults(searchInput.value);
});
}

document.querySelectorAll("[data-page-link]").forEach((link) => {
link.addEventListener("click", (event) => {
hideSuggestions();

const href = link.getAttribute("href");
if (!href || !href.startsWith("#")) {
return;
}

const target = document.querySelector(href);
if (!target) {
return;
}

event.preventDefault();
scrollToSection(target);
});
});

document.addEventListener("click", (event) => {
if (searchForm && searchForm.contains(event.target)) {
return;
}

if (searchDropdown && searchDropdown.contains(event.target)) {
return;
}

hideSuggestions();
});

if (!grid) {
return;
}

grid.addEventListener("click", (event) => {
const button = event.target.closest("button");

if (!button) {
return;
}

const card = button.closest(".product-card");

if (!card) {
return;
}

const productId = card.dataset.productId;
const product = getProductById(productId);

if (!product) {
return;
}

if (button.classList.contains("qty-btn")) {
const action = button.dataset.action;
const currentQuantity = productQuantities.get(productId) || 1;
let nextQuantity = currentQuantity;

if (action === "increase") {
nextQuantity += 1;
}

if (action === "decrease" && currentQuantity > 1) {
nextQuantity -= 1;
}

productQuantities.set(productId, nextQuantity);
card.querySelector("[data-qty]").textContent = String(nextQuantity);
return;
}

if (button.classList.contains("order-btn")) {
const quantity = productQuantities.get(productId) || 1;
const message = buildOrderMessage(product, quantity);
const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
window.open(url, "_blank", "noopener");
return;
}

if (button.classList.contains("cart-btn") && cartApi) {
const quantity = productQuantities.get(productId) || 1;
cartApi.addCartItem(productId, quantity);
flashButtonFeedback(button, "Added");
}
});
}

function setupRevealAnimation() {
const revealItems = document.querySelectorAll(".reveal");

if (!("IntersectionObserver" in window)) {
revealItems.forEach((item) => item.classList.add("is-visible"));
return;
}

const observer = new IntersectionObserver((entries, currentObserver) => {
entries.forEach((entry) => {
if (!entry.isIntersecting) {
return;
}

entry.target.classList.add("is-visible");
currentObserver.unobserve(entry.target);
});
}, {
threshold: 0.18
});

revealItems.forEach((item, index) => {
item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
observer.observe(item);
});
}

document.addEventListener("DOMContentLoaded", () => {
const initialQuery = new URLSearchParams(window.location.search).get("q");
const searchInput = document.getElementById("product-search");
const searchClear = document.querySelector(".site-search__clear");

if (initialQuery && searchInput) {
searchInput.value = initialQuery;
if (searchClear) {
searchClear.hidden = false;
}
}

setupMobileNavigation();
renderProductCatalog(initialQuery || "");
setupCatalogInteractions();
setupRevealAnimation();

if (window.location.hash) {
const target = document.querySelector(window.location.hash);
if (target) {
window.setTimeout(() => {
scrollToSection(target, false);
}, 60);
}
}
});

const WHATSAPP_NUMBER = "917760172150";
const MAX_SEARCH_PRODUCTS = 4;
const MAX_SEARCH_KEYWORDS = 6;
const PRODUCT_CATALOG = Array.isArray(window.KAPTAINBITES_PRODUCTS) ? window.KAPTAINBITES_PRODUCTS : [];

const productQuantities = new Map(PRODUCT_CATALOG.map((product) => [product.id, 1]));

function buildOrderMessage(product, quantity) {
const total = quantity * product.price;

return `Hi, I want to order:

Product: ${product.name}
Quantity: ${quantity}
Price per pack: Rs.${product.price}
Total: Rs.${total}

Please share payment details.`;
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
const noteItems = product.notes.map((note) => `<li>${note}</li>`).join("");

return `
<article class="product-card product-card--${product.theme}" data-product-id="${product.id}">
<div class="product-card__visual">
<span class="product-card__badge">${product.badge}</span>
<img src="${product.image}" class="product-card__image" alt="${product.alt}">
</div>

<div class="product-card__body">
<div class="product-card__header">
<div>
<p class="product-card__eyebrow">${product.line}</p>
<h3>${product.name}</h3>
</div>
<p class="product-card__price">&#8377;${product.price} <span>/ pack</span></p>
</div>

<p class="product-card__copy">${product.description}</p>

<ul class="product-card__notes">
${noteItems}
</ul>

<a class="product-card__detail-link" href="${product.pageUrl}">View Product Details</a>

<div class="product-order">
<div class="quantity-control" aria-label="Select quantity for ${product.name}">
<button type="button" class="qty-btn" data-action="decrease">-</button>
<span class="qty-value" data-qty>${quantity}</span>
<button type="button" class="qty-btn" data-action="increase">+</button>
</div>

<button type="button" class="btn btn-primary order-btn">Order on WhatsApp</button>
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
: `${visibleCount} ${visibleCount === 1 ? "product" : "products"} available`;
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

renderProductCatalog(searchInput.value);
hideSuggestions();
document.getElementById("products")?.scrollIntoView({
behavior: "smooth",
block: "start"
});
}
});
}

if (searchForm) {
searchForm.addEventListener("submit", (event) => {
event.preventDefault();

if (searchInput && searchInput.value.trim()) {
renderProductCatalog(searchInput.value);
hideSuggestions();
document.getElementById("products")?.scrollIntoView({
behavior: "smooth",
block: "start"
});
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
renderProductCatalog(searchInput.value);
renderSuggestions(searchInput.value);
});
}

if (searchViewAll) {
searchViewAll.addEventListener("click", () => {
if (!searchInput) {
return;
}

renderProductCatalog(searchInput.value);
hideSuggestions();
document.getElementById("products")?.scrollIntoView({
behavior: "smooth",
block: "start"
});
});
}

document.querySelectorAll("[data-page-link]").forEach((link) => {
link.addEventListener("click", () => {
hideSuggestions();
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
renderProductCatalog();
setupCatalogInteractions();
setupRevealAnimation();
});

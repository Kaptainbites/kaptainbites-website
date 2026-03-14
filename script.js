const WHATSAPP_NUMBER = "917760172150";

const PRODUCT_CATALOG = [
{
id: "spice-crew-cashew",
line: "Spice Crew",
name: "Spice Crew Cashew",
price: 60,
badge: "Spice fan favourite",
theme: "spice",
image: "images/hero.png",
alt: "Spice Crew Cashew by KaptainBites",
description: "Bold roasted cashews with a masala-forward kick, built for evening cravings and customers who want stronger flavour payoff.",
notes: [
"Signature spicy seasoning",
"Premium crunchy cashews",
"Great with chai-time snacking"
],
searchTerms: ["spice", "spicy", "cashew", "masala", "dry fruit"]
},
{
id: "mint-mond-cashew",
line: "Mint Mond",
name: "Mint Mond Cashew",
price: 60,
badge: "Fresh finish pick",
theme: "mint",
image: "images/hero.png",
alt: "Mint Mond Cashew by KaptainBites",
description: "Refreshing mint-led cashews with balanced masala notes for customers who like a brighter, cleaner finish in every bite.",
notes: [
"Cooling mint flavour",
"Balanced masala profile",
"Easy everyday premium snack"
],
searchTerms: ["mint", "fresh", "cashew", "masala", "dry fruit"]
}
];

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
const liveProductCount = document.getElementById("live-product-count");
const totalCount = PRODUCT_CATALOG.length;
const totalLabel = `${totalCount}`;

if (productCount) {
productCount.textContent = query
? `${visibleCount} ${visibleCount === 1 ? "flavour" : "flavours"} found`
: `${visibleCount} signature ${visibleCount === 1 ? "flavour" : "flavours"}`;
}

if (liveProductCount) {
liveProductCount.textContent = totalLabel;
}
}

function renderProductCatalog(query = "") {
const normalizedQuery = query.trim().toLowerCase();
const grid = document.getElementById("products-grid");
const emptyState = document.getElementById("catalog-empty");

if (!grid) {
return;
}

const filteredProducts = PRODUCT_CATALOG.filter((product) => matchesSearch(product, normalizedQuery));

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

if (searchInput) {
searchInput.addEventListener("input", () => {
renderProductCatalog(searchInput.value);
});
}

if (searchForm) {
searchForm.addEventListener("submit", (event) => {
event.preventDefault();
});
}

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
card.querySelector("[data-qty]").textContent = nextQuantity;
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

const WHATSAPP_NUMBER = "917760172150";
const cartApi = window.KAPTAINBITES_CART || null;

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

function getCatalog() {
return Array.isArray(window.KAPTAINBITES_PRODUCTS) ? window.KAPTAINBITES_PRODUCTS : [];
}

function getProductImagePath(imagePath) {
return `../${imagePath}`;
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

function openWhatsApp(message) {
const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
window.open(url, "_blank", "noopener");
}

function buildRelatedProductCard(product) {
return `
<a class="related-product-card" href="./${product.slug}.html">
<span class="related-product-card__media">
<img src="${getProductImagePath(product.image)}" alt="${product.alt}">
</span>
<span class="related-product-card__copy">
<span class="related-product-card__eyebrow">Snack</span>
<span class="related-product-card__title">${product.name}</span>
</span>
</a>`;
}

function renderProductDetail() {
const productId = document.body.dataset.productId;
const catalog = getCatalog();
const product = catalog.find((item) => item.id === productId);
const container = document.getElementById("product-detail");

if (!container) {
return;
}

if (!product) {
container.innerHTML = `
<article class="product-detail-card">
<h1>Product not found</h1>
<p>This product page could not be loaded.</p>
<a class="btn btn-primary" href="../products.html">Back to Products</a>
</article>`;
return;
}

document.title = `${product.name} | KaptainBites`;
const notes = product.notes.map((note) => `<li>${note}</li>`).join("");
const relatedProducts = catalog.filter((item) => item.id !== product.id).slice(0, 3);

container.innerHTML = `
<article class="product-detail-card product-card--${product.theme}">
<div class="product-detail__media">
<img src="${getProductImagePath(product.image)}" alt="${product.alt}">
</div>

<div class="product-detail__content">
<p class="product-detail__line">${product.line}</p>
<h1>${product.name}</h1>
<p class="product-detail__price">&#8377;${product.price} <span>/ pack</span></p>
<p class="product-detail__description">${product.description}</p>

<ul class="product-detail__notes">
${notes}
</ul>

<div class="product-detail__order">
<div class="quantity-control" aria-label="Select quantity for ${product.name}">
<button type="button" class="qty-btn" data-action="decrease">-</button>
<span class="qty-value" data-qty>1</span>
<button type="button" class="qty-btn" data-action="increase">+</button>
</div>
<div class="product-detail__order-actions">
<button type="button" class="btn btn-secondary product-detail__cart-btn">Add to Cart</button>
<button type="button" class="btn btn-primary product-detail__order-btn">Order on WhatsApp</button>
</div>
</div>

<a class="product-detail__back" href="../products.html">Back to Products</a>
</div>
</article>
`;

if (relatedProducts.length) {
container.insertAdjacentHTML("beforeend", `
<section class="related-products">
<h2>More Snacks</h2>
<div class="related-products__grid">
${relatedProducts.map(buildRelatedProductCard).join("")}
</div>
</section>
`);
}

let quantity = 1;
const quantityNode = container.querySelector("[data-qty]");
const orderButton = container.querySelector(".product-detail__order-btn");
const cartButton = container.querySelector(".product-detail__cart-btn");

container.addEventListener("click", (event) => {
const button = event.target.closest("button");

if (!button) {
return;
}

if (button.classList.contains("qty-btn")) {
if (button.dataset.action === "increase") {
quantity += 1;
}

if (button.dataset.action === "decrease" && quantity > 1) {
quantity -= 1;
}

if (quantityNode) {
quantityNode.textContent = String(quantity);
}
}
});

if (orderButton) {
orderButton.addEventListener("click", () => {
openWhatsApp(buildOrderMessage(product, quantity));
});
}

if (cartButton && cartApi) {
cartButton.addEventListener("click", () => {
cartApi.addCartItem(product.id, quantity);
flashButtonFeedback(cartButton, "Added");
});
}
}

document.addEventListener("DOMContentLoaded", () => {
setupMobileNavigation();
renderProductDetail();
});

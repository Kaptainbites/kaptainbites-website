const CART_WHATSAPP_NUMBER = "917760172150";

function getCartCatalog() {
return Array.isArray(window.KAPTAINBITES_PRODUCTS) ? window.KAPTAINBITES_PRODUCTS : [];
}

function buildCartImagePath(imagePath) {
return imagePath;
}

function openCartWhatsApp(message) {
const url = `https://wa.me/${CART_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
window.open(url, "_blank", "noopener");
}

function renderCartPage() {
const container = document.getElementById("cart-shell");
const cartApi = window.KAPTAINBITES_CART;
const catalog = getCartCatalog();

if (!container || !cartApi) {
return;
}

const cartItems = cartApi.getCartItems(catalog);
const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
const grandTotal = cartItems.reduce((total, item) => total + item.lineTotal, 0);

if (!cartItems.length) {
container.innerHTML = `
<section class="cart-empty">
<h2>Your cart is empty</h2>
<p>Add products and come back here before checkout.</p>
<a class="btn btn-primary" href="products.html">Explore Products</a>
</section>`;
return;
}

container.innerHTML = `
<section class="cart-list">
<h2>Items</h2>
${cartItems.map((item) => `
<article class="cart-item" data-product-id="${item.product.id}">
<img class="cart-item__image" src="${buildCartImagePath(item.product.image)}" alt="${item.product.alt}">

<div class="cart-item__content">
<h3 class="cart-item__title">${item.product.name}</h3>
<p class="cart-item__meta">&#8377;${item.product.price} per pack</p>
<a class="cart-item__link" href="${item.product.pageUrl}">View Product Details</a>
</div>

<div class="cart-item__controls">
<div class="quantity-control" aria-label="Update quantity for ${item.product.name}">
<button type="button" class="qty-btn" data-action="decrease">-</button>
<span class="qty-value" data-qty>${item.quantity}</span>
<button type="button" class="qty-btn" data-action="increase">+</button>
</div>
<strong class="cart-item__line-total">&#8377;${item.lineTotal}</strong>
<button type="button" class="cart-item__remove">Remove</button>
</div>
</article>
`).join("")}
</section>

<aside class="cart-summary">
<h2>Order Summary</h2>
<div class="cart-summary__row">
<span>Items</span>
<strong>${itemCount}</strong>
</div>
<div class="cart-summary__row">
<span>Subtotal</span>
<strong>&#8377;${grandTotal}</strong>
</div>
<div class="cart-summary__row cart-summary__row--total">
<span>Total</span>
<strong>&#8377;${grandTotal}</strong>
</div>
<p>Checkout directly on WhatsApp.</p>
<div class="cart-summary__actions">
<button type="button" class="btn btn-primary" id="cart-checkout">Checkout on WhatsApp</button>
<button type="button" class="btn btn-secondary" id="cart-clear">Clear Cart</button>
<a class="btn btn-secondary" href="products.html">Continue Shopping</a>
</div>
</aside>
`;

container.querySelectorAll(".cart-item").forEach((cartItem) => {
const productId = cartItem.dataset.productId;

cartItem.addEventListener("click", (event) => {
const button = event.target.closest("button");
if (!button) {
return;
}

const currentQuantity = cartApi.getCart()[productId] || 1;

if (button.classList.contains("qty-btn")) {
const nextQuantity = button.dataset.action === "increase"
? currentQuantity + 1
: currentQuantity - 1;

cartApi.setCartItem(productId, nextQuantity);
renderCartPage();
return;
}

if (button.classList.contains("cart-item__remove")) {
cartApi.setCartItem(productId, 0);
renderCartPage();
}
});
});

document.getElementById("cart-checkout")?.addEventListener("click", () => {
openCartWhatsApp(cartApi.buildCartOrderMessage(catalog));
});

document.getElementById("cart-clear")?.addEventListener("click", () => {
cartApi.clearCart();
renderCartPage();
});
}

document.addEventListener("DOMContentLoaded", () => {
renderCartPage();
window.addEventListener("kaptainbites:cart-updated", renderCartPage);
});

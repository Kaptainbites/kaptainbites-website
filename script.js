const WHATSAPP_NUMBER = "917760172150";

function buildOrderMessage(productName, quantity, price) {
const total = quantity * price;

return `Hi, I want to order:

Product: ${productName}
Quantity: ${quantity}
Price per pack: Rs.${price}
Total: Rs.${total}

Please share payment details.`;
}

function setupProductCards() {
const productCards = document.querySelectorAll(".product-card");

productCards.forEach((card) => {
const qtyValue = card.querySelector("[data-qty]");
const orderButton = card.querySelector(".order-btn");
const productName = card.dataset.product;
const price = Number(card.dataset.price || 0);
let quantity = 1;

card.querySelectorAll(".qty-btn").forEach((button) => {
button.addEventListener("click", () => {
const action = button.dataset.action;

if (action === "increase") {
quantity += 1;
}

if (action === "decrease" && quantity > 1) {
quantity -= 1;
}

qtyValue.textContent = quantity;
});
});

orderButton.addEventListener("click", () => {
const message = buildOrderMessage(productName, quantity, price);
const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
window.open(url, "_blank", "noopener");
});
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
setupProductCards();
setupRevealAnimation();
});

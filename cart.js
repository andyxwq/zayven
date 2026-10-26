// ZAYVEN Cart — client-side only (localStorage)
// Payment integration (Stripe / Snipcart) will be added later

const SHIPPING_COST = 2.99;
const CART_KEY = 'zayven_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function addToCart(id, name, price) {
  const cart = getCart();
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, price: parseFloat(price), qty: 1 });
  }
  saveCart(cart);
  openCart();
}

function removeFromCart(id) {
  let cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
}

function updateQty(id, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
  } else {
    saveCart(cart);
  }
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getSubtotal() {
  return getCart().reduce((sum, item) => sum + item.price * item.qty, 0);
}

function formatPrice(num) {
  return '£' + num.toFixed(2);
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const itemsContainer = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const shippingEl = document.getElementById('cartShipping');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const cart = getCart();
  const count = getCartCount();
  const subtotal = getSubtotal();
  const shipping = count > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  // Badge
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // Items
  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="cart-empty">
          <p>Your cart is empty</p>
          <p class="cart-empty-sub">Add some essentials to get started.</p>
        </div>`;
    } else {
      itemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p class="cart-item-price">${formatPrice(item.price)}</p>
          </div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button class="qty-btn" data-action="minus" data-id="${item.id}">−</button>
              <span class="qty-value">${item.qty}</span>
              <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
            </div>
            <button class="remove-btn" data-id="${item.id}" aria-label="Remove">×</button>
          </div>
        </div>
      `).join('');
    }
  }

  // Totals
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (shippingEl) shippingEl.textContent = count > 0 ? formatPrice(SHIPPING_COST) : '—';
  if (totalEl) totalEl.textContent = formatPrice(total);

  // Checkout button state
  if (checkoutBtn) {
    checkoutBtn.disabled = count === 0;
  }
}

function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = card.dataset.price;
      addToCart(id, name, price);
    });
  });

  // Cart open / close
  document.getElementById('cartBtn')?.addEventListener('click', openCart);
  document.getElementById('cartClose')?.addEventListener('click', closeCart);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);

  // Quantity & remove (event delegation)
  document.getElementById('cartItems')?.addEventListener('click', (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('remove-btn')) {
      removeFromCart(id);
    } else if (e.target.dataset.action === 'plus') {
      updateQty(id, 1);
    } else if (e.target.dataset.action === 'minus') {
      updateQty(id, -1);
    }
  });

  // Escape key closes cart
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });
});

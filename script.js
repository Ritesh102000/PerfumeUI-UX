const products = [
  {
    id: "rouge-royal", name: "Rouge Royal", family: "floral", familyLabel: "Floral · Extrait", price: 285,
    notes: ["Damask Rose", "Saffron", "Amber"], intensity: "Opulent", format: "100 ml", bottle: "bottle-ruby", number: "01", glow: "rgba(144, 15, 40, .62)", newest: 8,
    description: "A dark rose illuminated by saffron and held in the lasting warmth of amber. Sensual, architectural and unapologetically present."
  },
  {
    id: "ambre-velours", name: "Ambre Velours", family: "amber", familyLabel: "Amber · Extrait", price: 260,
    notes: ["Amber", "Vanilla", "Labdanum"], intensity: "Opulent", format: "100 ml", bottle: "bottle-amber", number: "02", glow: "rgba(181, 101, 30, .55)", newest: 6,
    description: "Golden amber draped in smoked vanilla and labdanum. Warm on the skin, with a slow, velvet-like diffusion."
  },
  {
    id: "iris-secret", name: "Iris Secret", family: "floral", familyLabel: "Floral · Extrait", price: 245,
    notes: ["Iris", "Violet", "Suede"], intensity: "Intimate", format: "50 ml", bottle: "bottle-iris", number: "03", glow: "rgba(102, 79, 129, .48)", newest: 5,
    description: "Powdered iris and violet rest against a whisper of suede. Quietly magnetic and composed for close encounters."
  },
  {
    id: "oud-souverain", name: "Oud Souverain", family: "woody", familyLabel: "Woody · Extrait", price: 310,
    notes: ["Oud", "Incense", "Cedar"], intensity: "Opulent", format: "100 ml", bottle: "bottle-oud", number: "04", glow: "rgba(102, 57, 25, .55)", newest: 7,
    description: "A precise architecture of smoked oud, cathedral incense and dry cedar. Deeply textured, never heavy."
  },
  {
    id: "or-lunaire", name: "Or Lunaire", family: "fresh", familyLabel: "Fresh · Extrait", price: 235,
    notes: ["Bergamot", "Neroli", "White Musk"], intensity: "Radiant", format: "50 ml", bottle: "bottle-ivory", number: "05", glow: "rgba(216, 187, 132, .52)", newest: 4,
    description: "Bergamot and neroli flash over a clean veil of white musk. Light with the presence and polish of precious metal."
  },
  {
    id: "bois-nocturne", name: "Bois Nocturne", family: "woody", familyLabel: "Woody · Extrait", price: 270,
    notes: ["Cedar", "Oud", "Black Tea"], intensity: "Radiant", format: "100 ml", bottle: "bottle-black", number: "06", glow: "rgba(60, 48, 43, .56)", newest: 2,
    description: "Cedar, black tea and a polished oud accord. A tailored, shadowed wood scent with a beautiful dry finish."
  },
  {
    id: "eau-de-soie", name: "Eau de Soie", family: "fresh", familyLabel: "Fresh · Extrait", price: 225,
    notes: ["Fig Leaf", "Iris", "Musk"], intensity: "Intimate", format: "50 ml", bottle: "bottle-fresh", number: "07", glow: "rgba(45, 113, 106, .46)", newest: 3,
    description: "Green fig leaf, cool iris and sheer musk glide across the skin. Silken, luminous and effortless."
  },
  {
    id: "rose-incendie", name: "Rose Incendie", family: "amber", familyLabel: "Amber · Extrait", price: 295,
    notes: ["Rose", "Amber", "Pink Pepper"], intensity: "Radiant", format: "100 ml", bottle: "bottle-rose", number: "08", glow: "rgba(174, 69, 89, .54)", newest: 1,
    description: "Rose set alight with pink pepper and molten amber. Bright at first contact, then deep and smoldering."
  }
];

const discoveryProduct = {
  id: "discovery", name: "Discovery Wardrobe", family: "set", familyLabel: "Eight 2 ml extraits", price: 65,
  notes: ["Eight scents", "2 ml each", "Redeemable"], intensity: "Discovery", format: "8 × 2 ml", bottle: "bottle-ruby", number: "00", glow: "rgba(144, 15, 40, .62)", newest: 9,
  description: "The complete AURÈVE wardrobe in miniature, presented in a lacquered red case."
};

const getProduct = id => id === "discovery" ? discoveryProduct : products.find(product => product.id === id);
const currency = value => `€${value}`;

const bottleMarkup = product => `
  <div class="perfume-bottle ${product.bottle}" aria-hidden="true">
    <i></i><b>AURÈVE</b><small>PARIS</small>
  </div>`;

const productCard = product => `
  <article class="product-card reveal" id="${product.id}" data-id="${product.id}">
    <div class="product-art" data-number="${product.number}" style="--art-glow:${product.glow}">
      <button class="wishlist-btn" data-wishlist="${product.id}" aria-label="Add ${product.name} to wishlist">♡</button>
      ${bottleMarkup(product)}
    </div>
    <div class="product-info">
      <span class="product-family">${product.familyLabel}</span>
      <h3 class="product-name">${product.name}</h3>
      <span class="product-price">${currency(product.price)}</span>
      <span class="product-notes">${product.notes.join(" · ")}</span>
      <div class="product-actions">
        <button class="add-button" data-add="${product.id}">Add to bag</button>
        <button class="quick-button" data-quick="${product.id}">Quick view ↗</button>
      </div>
    </div>
  </article>`;

let cart = JSON.parse(localStorage.getItem("aureve-cart") || "[]");
let wishlist = JSON.parse(localStorage.getItem("aureve-wishlist") || "[]");
let activeFamily = "all";
let activeQuickProduct = null;

function saveState() {
  localStorage.setItem("aureve-cart", JSON.stringify(cart));
  localStorage.setItem("aureve-wishlist", JSON.stringify(wishlist));
}

function initLoader() {
  const loader = document.querySelector(".page-loader");
  if (!loader) return;
  window.addEventListener("load", () => setTimeout(() => loader.classList.add("loaded"), 450));
  setTimeout(() => loader.classList.add("loaded"), 1800);
}

function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach(element => element.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }), { threshold: .12 });
  elements.forEach(element => observer.observe(element));
}

function renderFeatured() {
  const grid = document.querySelector("#featured-grid");
  if (!grid) return;
  grid.innerHTML = products.slice(0, 3).map(productCard).join("");
}

function checkedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
}

function renderShop() {
  const grid = document.querySelector("#product-grid");
  if (!grid) return;
  const intensity = checkedValues("intensity");
  const notes = checkedValues("note");
  const formats = checkedValues("format");
  const query = (document.querySelector("#site-search")?.value || "").toLowerCase().trim();
  let filtered = products.filter(product => {
    const familyMatch = activeFamily === "all" || product.family === activeFamily;
    const intensityMatch = !intensity.length || intensity.includes(product.intensity);
    const noteMatch = !notes.length || product.notes.some(note => notes.includes(note));
    const formatMatch = !formats.length || formats.includes(product.format);
    const searchMatch = !query || `${product.name} ${product.family} ${product.notes.join(" ")}`.toLowerCase().includes(query);
    return familyMatch && intensityMatch && noteMatch && formatMatch && searchMatch;
  });
  const sort = document.querySelector("#sort-select")?.value || "featured";
  if (sort === "price-low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "price-high") filtered.sort((a, b) => b.price - a.price);
  if (sort === "newest") filtered.sort((a, b) => b.newest - a.newest);
  grid.innerHTML = filtered.length ? filtered.map(productCard).join("") : `<div class="empty-results"><div><h3>No scent found.</h3><p>Clear the filters and return to the full collection.</p><button class="line-link clear-inline">Clear filters <span>↗</span></button></div></div>`;
  document.querySelector(".result-count").textContent = `${filtered.length} fragrance${filtered.length === 1 ? "" : "s"}`;
  applyWishlistState();
  initReveal();
}

function applyWishlistState() {
  document.querySelectorAll("[data-wishlist]").forEach(button => {
    const selected = wishlist.includes(button.dataset.wishlist);
    button.classList.toggle("active", selected);
    button.textContent = selected ? "♥" : "♡";
    button.setAttribute("aria-label", `${selected ? "Remove" : "Add"} ${getProduct(button.dataset.wishlist)?.name || "product"} ${selected ? "from" : "to"} wishlist`);
  });
}

function showToast(message) {
  const toast = document.querySelector(".toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function setOverlay(panel, open) {
  const backdrop = document.querySelector(".backdrop");
  [document.querySelector(".cart-drawer"), document.querySelector(".search-panel"), document.querySelector(".quick-view")].forEach(item => {
    if (item && item !== panel) {
      item.classList.remove("open");
      item.setAttribute("aria-hidden", "true");
    }
  });
  panel?.classList.toggle("open", open);
  panel?.setAttribute("aria-hidden", String(!open));
  backdrop?.classList.toggle("open", open);
  document.body.classList.toggle("no-scroll", open);
}

function openCart() {
  renderCart();
  setOverlay(document.querySelector(".cart-drawer"), true);
}

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, qty: 1 });
  saveState();
  renderCart();
  showToast(`${product.name} added to your bag`);
}

function updateQuantity(id, change) {
  const item = cart.find(entry => entry.id === id);
  if (!item) return;
  item.qty += change;
  if (item.qty <= 0) cart = cart.filter(entry => entry.id !== id);
  saveState();
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + (getProduct(item.id)?.price || 0) * item.qty, 0);
  document.querySelectorAll(".bag-count").forEach(element => element.textContent = count);
  const items = document.querySelector(".cart-items");
  if (!items) return;
  items.innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    if (!product) return "";
    return `<div class="cart-item">
      <div class="cart-thumb">${bottleMarkup(product)}</div>
      <div><h3>${product.name}</h3><p>${product.format} · ${product.familyLabel}</p><div class="qty"><button data-qty="-1" data-id="${item.id}" aria-label="Decrease quantity">−</button><span>${item.qty}</span><button data-qty="1" data-id="${item.id}" aria-label="Increase quantity">+</button></div></div>
      <div><strong>${currency(product.price * item.qty)}</strong><button class="cart-remove" data-remove="${item.id}">Remove</button></div>
    </div>`;
  }).join("");
  document.querySelector(".cart-empty")?.classList.toggle("hidden", cart.length > 0);
  document.querySelector(".cart-summary")?.classList.toggle("visible", cart.length > 0);
  const totalEl = document.querySelector(".cart-total");
  if (totalEl) totalEl.textContent = currency(total);
}

function openQuick(id) {
  const product = getProduct(id);
  const panel = document.querySelector(".quick-view");
  if (!product || !panel) return;
  activeQuickProduct = product;
  panel.querySelector(".quick-visual").innerHTML = bottleMarkup(product);
  panel.querySelector(".quick-family").textContent = product.familyLabel;
  panel.querySelector(".quick-name").textContent = product.name;
  panel.querySelector(".quick-description").textContent = product.description;
  panel.querySelector(".quick-price").textContent = currency(product.price);
  panel.querySelector(".quick-notes").innerHTML = product.notes.map((note, index) => `<span>${["Top", "Heart", "Base"][index]}<b>${note}</b></span>`).join("");
  setOverlay(panel, true);
}

function clearFilters() {
  document.querySelectorAll(".filters input").forEach(input => input.checked = false);
  activeFamily = "all";
  document.querySelectorAll(".category-pill").forEach(button => button.classList.toggle("active", button.dataset.family === "all"));
  const search = document.querySelector("#site-search");
  if (search) search.value = "";
  renderShop();
}

function initPanels() {
  const menu = document.querySelector(".menu-overlay");
  const menuButton = document.querySelector(".menu-trigger");
  menuButton?.addEventListener("click", () => {
    const open = !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuButton.classList.toggle("open", open);
    menuButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("no-scroll", open);
  });
  document.querySelectorAll(".menu-links a").forEach(link => link.addEventListener("click", () => {
    menu?.classList.remove("open");
    menuButton?.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }));
  document.querySelector(".search-trigger")?.addEventListener("click", () => setOverlay(document.querySelector(".search-panel"), true));
  document.querySelector(".search-close")?.addEventListener("click", () => setOverlay(document.querySelector(".search-panel"), false));
  document.querySelectorAll(".bag-trigger").forEach(button => button.addEventListener("click", openCart));
  document.querySelector(".cart-close")?.addEventListener("click", () => setOverlay(document.querySelector(".cart-drawer"), false));
  document.querySelector(".quick-close")?.addEventListener("click", () => setOverlay(document.querySelector(".quick-view"), false));
  document.querySelector(".backdrop")?.addEventListener("click", () => {
    setOverlay(document.querySelector(".cart-drawer.open, .search-panel.open, .quick-view.open"), false);
    document.querySelector(".filters")?.classList.remove("open");
  });
  document.querySelector(".cart-shop-link")?.addEventListener("click", () => setOverlay(document.querySelector(".cart-drawer"), false));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setOverlay(document.querySelector(".cart-drawer.open, .search-panel.open, .quick-view.open"), false);
      menu?.classList.remove("open");
      menuButton?.classList.remove("open");
      document.body.classList.remove("no-scroll");
    }
  });
}

function initShopControls() {
  document.querySelectorAll(".category-pill").forEach(button => button.addEventListener("click", () => {
    activeFamily = button.dataset.family;
    document.querySelectorAll(".category-pill").forEach(item => item.classList.toggle("active", item === button));
    renderShop();
  }));
  document.querySelectorAll(".filters input").forEach(input => input.addEventListener("change", renderShop));
  document.querySelector("#sort-select")?.addEventListener("change", renderShop);
  document.querySelector(".clear-filters")?.addEventListener("click", clearFilters);
  document.querySelector(".filter-mobile")?.addEventListener("click", () => {
    document.querySelector(".filters")?.classList.add("open");
    document.querySelector(".backdrop")?.classList.add("open");
  });
  document.querySelector("#site-search")?.addEventListener("input", renderShop);
  document.querySelectorAll("[data-search]").forEach(button => button.addEventListener("click", () => {
    const input = document.querySelector("#site-search");
    input.value = button.dataset.search;
    renderShop();
    setOverlay(document.querySelector(".search-panel"), false);
    document.querySelector("#shop-grid")?.scrollIntoView();
  }));
}

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const quickButton = event.target.closest("[data-quick]");
  const wishlistButton = event.target.closest("[data-wishlist]");
  const qtyButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");
  if (addButton) addToCart(addButton.dataset.add);
  if (quickButton) openQuick(quickButton.dataset.quick);
  if (wishlistButton) {
    const id = wishlistButton.dataset.wishlist;
    wishlist = wishlist.includes(id) ? wishlist.filter(item => item !== id) : [...wishlist, id];
    saveState(); applyWishlistState();
    showToast(wishlist.includes(id) ? "Saved to your private list" : "Removed from your private list");
  }
  if (qtyButton) updateQuantity(qtyButton.dataset.id, Number(qtyButton.dataset.qty));
  if (removeButton) { cart = cart.filter(item => item.id !== removeButton.dataset.remove); saveState(); renderCart(); }
  if (event.target.closest(".quick-add") && activeQuickProduct) { addToCart(activeQuickProduct.id); setOverlay(document.querySelector(".quick-view"), false); setTimeout(openCart, 280); }
  if (event.target.closest(".clear-inline")) clearFilters();
});

document.querySelectorAll(".newsletter-form").forEach(form => form.addEventListener("submit", event => {
  event.preventDefault();
  form.reset();
  showToast("Welcome to the private circle");
}));

document.querySelectorAll(".checkout-button").forEach(button => {
  if (button.classList.contains("quick-add")) return;
  button.addEventListener("click", () => showToast("Concept checkout — no payment will be taken"));
});

document.querySelectorAll(".size-options button").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".size-options button").forEach(item => item.classList.toggle("active", item === button));
}));

initLoader();
renderFeatured();
renderShop();
renderCart();
applyWishlistState();
initPanels();
initShopControls();
initReveal();

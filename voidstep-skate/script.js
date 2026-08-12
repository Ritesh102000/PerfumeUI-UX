const $ = (selector, scope = document) => scope?.querySelector(selector) || null;
const $$ = (selector, scope = document) => scope ? [...scope.querySelectorAll(selector)] : [];

const slides = $$(".hero-slide");
const pagination = $(".hero-pagination");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeSlide = 0;
let slideTimer;

function showSlide(index, restart = true) {
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === activeSlide));
  $$("button", pagination).forEach((button, buttonIndex) => {
    button.classList.toggle("active", buttonIndex === activeSlide);
    button.setAttribute("aria-current", buttonIndex === activeSlide ? "true" : "false");
  });
  if (restart && !reduceMotion) startCarousel();
}

function startCarousel() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide(activeSlide + 1, false), 6200);
}

if (slides.length && pagination) {
  slides.forEach((_, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", `Go to slide ${index + 1}`);
    button.addEventListener("click", () => showSlide(index));
    pagination.append(button);
  });
  showSlide(0, false);
  if (!reduceMotion) startCarousel();
}

$(".hero-prev")?.addEventListener("click", () => showSlide(activeSlide - 1));
$(".hero-next")?.addEventListener("click", () => showSlide(activeSlide + 1));
$(".hero-carousel")?.addEventListener("mouseenter", () => clearInterval(slideTimer));
$(".hero-carousel")?.addEventListener("mouseleave", () => !reduceMotion && startCarousel());

document.addEventListener("visibilitychange", () => {
  if (document.hidden) clearInterval(slideTimer);
  else if (!reduceMotion && slides.length) startCarousel();
});

function initDragScroller(element) {
  if (!element) return;
  let down = false;
  let startX = 0;
  let startScroll = 0;
  element.addEventListener("pointerdown", event => {
    if (event.target.closest("button, a")) return;
    down = true;
    startX = event.clientX;
    startScroll = element.scrollLeft;
    element.classList.add("dragging");
    element.setPointerCapture(event.pointerId);
  });
  element.addEventListener("pointermove", event => {
    if (!down) return;
    element.scrollLeft = startScroll - (event.clientX - startX) * 1.2;
  });
  const finish = () => { down = false; element.classList.remove("dragging"); };
  element.addEventListener("pointerup", finish);
  element.addEventListener("pointercancel", finish);
}

const productTrack = $(".product-track");
const hardwareTrack = $(".hardware-track");
initDragScroller(productTrack);
initDragScroller(hardwareTrack);
$(".product-prev")?.addEventListener("click", () => productTrack?.scrollBy({ left: -360, behavior: "smooth" }));
$(".product-next")?.addEventListener("click", () => productTrack?.scrollBy({ left: 360, behavior: "smooth" }));

const backdrop = $(".void-backdrop");
const mobileMenu = $(".mobile-menu");
const cartDrawer = $(".cart-drawer");
const videoModal = $(".video-modal");
const menuTrigger = $(".mobile-menu-trigger");

function syncBackdrop() {
  const open = [mobileMenu, cartDrawer, videoModal].some(panel => panel?.classList.contains("open"));
  backdrop?.classList.toggle("open", open);
  document.body.classList.toggle("locked", open);
}

function closePanels() {
  [mobileMenu, cartDrawer, videoModal].forEach(panel => {
    panel?.classList.remove("open");
    panel?.setAttribute("aria-hidden", "true");
  });
  menuTrigger?.setAttribute("aria-expanded", "false");
  syncBackdrop();
}

function openPanel(panel) {
  closePanels();
  panel?.classList.add("open");
  panel?.setAttribute("aria-hidden", "false");
  syncBackdrop();
}

menuTrigger?.addEventListener("click", () => {
  openPanel(mobileMenu);
  menuTrigger.setAttribute("aria-expanded", "true");
});
$(".mobile-menu-close")?.addEventListener("click", closePanels);
$(".cart-trigger")?.addEventListener("click", () => { renderCart(); openPanel(cartDrawer); });
$(".cart-close")?.addEventListener("click", closePanels);
backdrop?.addEventListener("click", closePanels);
$$('.mobile-menu a').forEach(link => link.addEventListener("click", closePanels));

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closePanels();
  if (event.key === "ArrowRight" && document.activeElement?.closest(".hero-carousel")) showSlide(activeSlide + 1);
  if (event.key === "ArrowLeft" && document.activeElement?.closest(".hero-carousel")) showSlide(activeSlide - 1);
});

$$('.nav-group > button').forEach(button => {
  button.addEventListener("click", event => {
    event.stopPropagation();
    const group = button.closest(".nav-group");
    $$(".nav-group").forEach(item => {
      if (item !== group) item.classList.remove("open");
      $("button", item)?.setAttribute("aria-expanded", item === group && !group.classList.contains("open") ? "true" : "false");
    });
    const open = !group.classList.contains("open");
    group.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
  });
});
document.addEventListener("click", event => {
  if (!event.target.closest(".nav-group")) {
    $$(".nav-group").forEach(group => group.classList.remove("open"));
    $$('.nav-group > button').forEach(button => button.setAttribute("aria-expanded", "false"));
  }
});

const itemPrices = {
  "static-bloom": 5200,
  "night-audit": 5600,
  "curb-ritual": 5400,
  "split-signal": 4900,
  "pink-noise": 5300,
  "wrong-way": 5900,
  "rough-cut": 3200,
  "low-signal": 5800,
  "one-tool": 1450,
  "Rough Cut 54s": 3200,
  "Low Signal Trucks": 5800,
  "Noise Sheet Grip": 950,
  "One Tool Kit": 1450
};
let cart = JSON.parse(localStorage.getItem("voidstep-skate-cart") || "[]");

function saveCart() {
  localStorage.setItem("voidstep-skate-cart", JSON.stringify(cart));
}

function money(value) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function addCartItem(id, name) {
  const existing = cart.find(item => item.id === id);
  if (existing) existing.quantity += 1;
  else cart.push({ id, name, quantity: 1, price: itemPrices[id] || itemPrices[name] || 1990 });
  saveCart();
  renderCart();
  toast(`${name} added to cart`);
}

function removeCartItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if ($(".cart-count")) $(".cart-count").textContent = count;
  if (!$(".cart-lines")) return;
  $(".cart-lines").innerHTML = cart.map(item => `
    <div class="cart-line">
      <div class="mini-mark">//</div>
      <div><h3>${item.name}</h3><p>Quantity ${item.quantity}</p><button data-remove="${item.id}">Remove</button></div>
      <strong>${money(item.price * item.quantity)}</strong>
    </div>`).join("");
  $(".cart-empty")?.classList.toggle("hidden", cart.length > 0);
  $(".cart-summary")?.classList.toggle("visible", cart.length > 0);
  if ($(".cart-total")) $(".cart-total").textContent = money(total);
}

$$('.void-product .quick-add').forEach(button => button.addEventListener("click", () => {
  const product = button.closest(".void-product");
  addCartItem(product.dataset.id, product.dataset.name);
}));

$$('.hardware-track article > button').forEach((button, index) => button.addEventListener("click", () => {
  const product = button.closest("article");
  const name = $("h3", product).textContent;
  addCartItem(`hardware-${index}`, name);
}));

$$('[data-shop-add]').forEach(button => button.addEventListener("click", () => {
  addCartItem(button.dataset.shopAdd, button.dataset.name);
}));

$("[data-product-add]")?.addEventListener("click", event => {
  const button = event.currentTarget;
  const size = $('input[name="size"]:checked')?.value;
  const baseName = button.dataset.name.replace(/\s8\.25$/, "");
  addCartItem(button.dataset.productAdd, size ? `${baseName} ${size}` : button.dataset.name);
});

$(".cart-lines")?.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");
  if (button) removeCartItem(button.dataset.remove);
});
renderCart();

// Collection filters and sorting.
const shopGrid = $(".shop-grid");
const shopCards = $$(".shop-card");
shopCards.forEach((card, index) => card.dataset.order = index);

function filterShop(category) {
  $$('[data-shop-filter]').forEach(button => button.classList.toggle("active", button.dataset.shopFilter === category));
  shopCards.forEach(card => card.classList.toggle("hidden", category !== "all" && card.dataset.category !== category));
  $(".shop-empty")?.toggleAttribute("hidden", shopCards.some(card => !card.classList.contains("hidden")));
}

$$('[data-shop-filter]').forEach(button => button.addEventListener("click", () => filterShop(button.dataset.shopFilter)));
$(".shop-sort")?.addEventListener("change", event => {
  if (!shopGrid) return;
  const mode = event.target.value;
  [...shopCards].sort((a, b) => mode === "low" ? Number(a.dataset.price) - Number(b.dataset.price) : mode === "high" ? Number(b.dataset.price) - Number(a.dataset.price) : Number(a.dataset.order) - Number(b.dataset.order)).forEach(card => shopGrid.append(card));
});

// Bad Ideas media archive, modal and filters.
function openVideo(title) {
  if (!videoModal) return;
  closePanels();
  if ($(".fake-video-title")) $(".fake-video-title").textContent = title;
  videoModal.classList.add("open");
  videoModal.setAttribute("aria-hidden", "false");
  syncBackdrop();
}

$$('[data-video-title]').forEach(card => card.addEventListener("click", () => openVideo(card.dataset.videoTitle)));
$(".video-close")?.addEventListener("click", closePanels);
$$('[data-idea-filter]').forEach(button => button.addEventListener("click", () => {
  const category = button.dataset.ideaFilter;
  $$('[data-idea-filter]').forEach(item => item.classList.toggle("active", item === button));
  $$(".idea-card").forEach(card => card.classList.toggle("hidden", category !== "all" && card.dataset.category !== category));
}));

const memeStageImage = $(".meme-stage img");
const memeTop = $(".meme-top");
const memeBottom = $(".meme-bottom");
const memeTopInput = $(".meme-top-input");
const memeBottomInput = $(".meme-bottom-input");
const memePhrases = [
  ["ONE MORE TRY", "A DOCUMENTARY IN 47 PARTS"],
  ["WHEN THE SPOT IS PERFECT", "BUT SECURITY HAS FEELINGS"],
  ["NEW DECK ENERGY", "OLD TRICK SELECTION"],
  ["CALL IT A LINE", "SO THE FALL LOOKS INTENTIONAL"],
  ["THE GROUP CHAT SAID 7", "EVERYONE ARRIVED AT 9:40"]
];

function updateMeme() {
  if (memeTop && memeTopInput) memeTop.textContent = memeTopInput.value || " ";
  if (memeBottom && memeBottomInput) memeBottom.textContent = memeBottomInput.value || " ";
}
memeTopInput?.addEventListener("input", updateMeme);
memeBottomInput?.addEventListener("input", updateMeme);
$$('[data-meme-img]').forEach(button => button.addEventListener("click", () => {
  $$('[data-meme-img]').forEach(item => item.classList.toggle("active", item === button));
  if (memeStageImage) memeStageImage.src = button.dataset.memeImg;
}));
$(".meme-randomize")?.addEventListener("click", () => {
  const [top, bottom] = memePhrases[Math.floor(Math.random() * memePhrases.length)];
  memeTopInput.value = top;
  memeBottomInput.value = bottom;
  updateMeme();
});
$(".meme-copy")?.addEventListener("click", async () => {
  const caption = `${memeTopInput?.value || ""} / ${memeBottomInput?.value || ""}`;
  try { await navigator.clipboard.writeText(caption); toast("Caption copied. Reputation not included."); }
  catch { toast(caption); }
});
$(".idea-submit")?.addEventListener("click", () => toast("Bad idea received. Standards remain low."));

// Mission and community prototype actions.
$(".return-form")?.addEventListener("submit", event => {
  event.preventDefault();
  const selected = $('input[name="damage"]:checked')?.value;
  const result = $(".return-result");
  if (result) result.textContent = selected === "lost" ? "Result: technically difficult to return. Check under the bed again." : "Result: eligible for a fictional ₹600 credit. No printer required.";
});
$(".rebuild-start")?.addEventListener("click", () => toast("Return portal opened in a more expensive prototype"));
$$('.session-list button').forEach(button => button.addEventListener("click", () => {
  button.textContent = button.textContent === "Saved" ? "Save spot" : "Saved";
  toast(button.textContent === "Saved" ? "Spot saved to this browser" : "Spot removed");
}));
$(".crew-form")?.addEventListener("submit", event => {
  event.preventDefault(); event.currentTarget.reset(); toast("Field Unit application misplaced successfully");
});

function toast(message) {
  const element = $(".void-toast");
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => element.classList.remove("show"), 2200);
}

$(".account-button")?.addEventListener("click", () => toast("Account experience is ready to connect"));
$(".shop-all")?.addEventListener("click", () => {
  productTrack.scrollTo({ left: productTrack.scrollWidth, behavior: "smooth" });
  toast("Drag the deck rail to see the full drop");
});
$(".rebuild-more")?.addEventListener("click", () => {
  $(".rebuild-facts").setAttribute("aria-hidden", "false");
  toast("Return a broken deck and get credit for your next one");
});
$(".cart-summary > button")?.addEventListener("click", () => toast("Showcase checkout only — no payment connected"));

$(".void-newsletter")?.addEventListener("submit", event => {
  event.preventDefault();
  event.currentTarget.reset();
  toast("You are on the after-dark list");
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
$$('.reveal').forEach(element => revealObserver.observe(element));

const header = $(".void-header");
const rebuildSection = $(".rebuild-section");
let ticking = false;
function updateScrollEffects() {
  const scrollY = window.scrollY;
  header?.classList.toggle("sticky", scrollY > 620);
  if (rebuildSection && !reduceMotion) {
    const rect = rebuildSection.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < innerHeight) {
      const progress = (innerHeight - rect.top) / (innerHeight + rect.height);
      rebuildSection.style.setProperty("--rebuild-shift", `${(progress - .5) * 70}px`);
    }
  }
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(updateScrollEffects); ticking = true; }
}, { passive: true });
updateScrollEffects();

window.addEventListener("load", () => {
  setTimeout(() => $(".loading-screen")?.classList.add("done"), 430);
});
setTimeout(() => $(".loading-screen")?.classList.add("done"), 1800);

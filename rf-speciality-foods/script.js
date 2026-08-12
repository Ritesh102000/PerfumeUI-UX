const $ = (selector, scope = document) => scope?.querySelector(selector) || null;
const $$ = (selector, scope = document) => scope ? [...scope.querySelectorAll(selector)] : [];

const mobileNav = $(".mobile-nav");
const inquiryDrawer = $(".inquiry-drawer");
const backdrop = $(".backdrop");

function syncPanels() {
  const open = [mobileNav, inquiryDrawer].some(panel => panel?.classList.contains("open"));
  backdrop?.classList.toggle("open", open);
  document.body.classList.toggle("locked", open);
}

function closePanels() {
  [mobileNav, inquiryDrawer].forEach(panel => {
    panel?.classList.remove("open");
    panel?.setAttribute("aria-hidden", "true");
  });
  $(".menu-trigger")?.setAttribute("aria-expanded", "false");
  syncPanels();
}

$(".menu-trigger")?.addEventListener("click", event => {
  closePanels();
  mobileNav?.classList.add("open");
  mobileNav?.setAttribute("aria-hidden", "false");
  event.currentTarget.setAttribute("aria-expanded", "true");
  syncPanels();
});
$(".mobile-close")?.addEventListener("click", closePanels);
$(".drawer-close")?.addEventListener("click", closePanels);
backdrop?.addEventListener("click", closePanels);
document.addEventListener("keydown", event => event.key === "Escape" && closePanels());

$$('[data-inquiry]').forEach(button => button.addEventListener("click", event => {
  event.preventDefault();
  closePanels();
  inquiryDrawer?.classList.add("open");
  inquiryDrawer?.setAttribute("aria-hidden", "false");
  syncPanels();
  setTimeout(() => $(".inquiry-form input")?.focus(), 300);
}));

let toastTimer;
function toast(message) {
  const element = $(".toast");
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 2600);
}

$(".inquiry-form")?.addEventListener("submit", event => {
  event.preventDefault();
  event.currentTarget.reset();
  closePanels();
  toast("Sample request noted — demo only");
});

$$('.newsletter-form').forEach(form => form.addEventListener("submit", event => {
  event.preventDefault();
  event.currentTarget.reset();
  toast("Thank you — catalogue request noted");
}));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("visible"));
}, { threshold: .12 });
$$('.reveal').forEach(element => observer.observe(element));

const header = $(".site-header");
let lastScroll = 0;
window.addEventListener("scroll", () => {
  const current = window.scrollY;
  header?.classList.toggle("sticky", current > 240 && current < lastScroll);
  lastScroll = current;
}, { passive: true });

const quoteSlides = $$(".quote-slide");
const quoteDots = $$(".quote-dots button");
function showQuote(index) {
  quoteSlides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === index));
  quoteDots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === index));
}
quoteDots.forEach((dot, index) => dot.addEventListener("click", () => showQuote(index)));
if (quoteSlides.length) showQuote(0);

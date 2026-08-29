import {useEffect, useMemo, useRef, useState, type FormEvent, type MouseEvent, type ReactNode} from "react";
import {
  ArrowLeft, ArrowRight, ChevronDown, CircleHelp, Clock3, Grid2X2, Heart, Instagram, List,
  Mail, MapPin, Menu, Minus, PackageSearch, Phone, Play, Plus, Search, ShieldCheck,
  ShoppingBag, SlidersHorizontal, Sparkles, Trash2, UserRound, Volume2, X,
} from "lucide-react";
import {
  catalogueCollections, contact, faqs, featuredCollections, megaMenu, products as productFixtures,
  reels as reelFixtures, servicePromises, siteClaims, story, type Product, type ProductAttributeKey, type Reel,
} from "./data";
import {createShopifyCheckout, loadProducts, loadPromotions, loadReels, type Promotion} from "./commerce";
import {loadWidgets, widgetsFor} from "./widgets";

const BASE = "/modesi-jewellery";
const currencyRates = {INR: 1, USD: 0.0115, EUR: 0.0098, GBP: 0.0085, CAD: 0.0156} as const;
type Currency = keyof typeof currencyRates;
type CartLine = {product: Product; quantity: number};

function pathFor(path = "") {
  const [pathname, query] = path.replace(/^\//, "").split("?");
  const cleanPath = pathname ? `/${pathname.replace(/\/$/, "")}/` : "/";
  return `${BASE}${cleanPath}${query ? `?${query}` : ""}`;
}
function routeFromLocation() { return window.location.pathname.replace(new RegExp(`^${BASE}/?`), "").replace(/\/$/, "") || "home"; }
function handleize(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[–—]/g, "-").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
function widgetPageForRoute(route: string) { return route.startsWith("products/") ? "product" : ["shop", "new-arrivals", "best-sellers"].includes(route) ? "shop" : route === "home" ? "home" : "all"; }

function Link({to, children, className, onNavigate, ariaLabel}: {to: string; children: ReactNode; className?: string; onNavigate?: () => void; ariaLabel?: string}) {
  const external = /^https?:\/\//i.test(to);
  const href = external ? to : pathFor(to === "home" ? "" : to);
  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (external || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.scrollTo({top: 0, behavior: "smooth"});
    onNavigate?.();
  }
  return <a href={href} className={className} onClick={onClick} aria-label={ariaLabel}>{children}</a>;
}

function money(value: number, currency: Currency) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {style: "currency", currency, maximumFractionDigits: currency === "INR" ? 0 : 2}).format(value * currencyRates[currency]);
}

function Eyebrow({children, light = false}: {children: ReactNode; light?: boolean}) { return <p className={`eyebrow${light ? " light" : ""}`}>{children}</p>; }

function SectionTitle({index, title, accent, copy, light = false}: {index: string; title: string; accent?: string; copy?: string; light?: boolean}) {
  return <header className={`section-title${light ? " section-title-light" : ""}`}><Eyebrow light={light}>{index}</Eyebrow><h2>{title}{accent && <> <em>{accent}</em></>}</h2>{copy && <p>{copy}</p>}</header>;
}

function Header({page, cartCount, wishlistCount, onCart, onSearch}: {page: string; cartCount: number; wishlistCount: number; onCart: () => void; onSearch: () => void}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const announcement = widgetsFor(page, "announcement").find((widget) => widget.component === "announcement");
  const announcements = announcement ? [announcement.settings.primary, announcement.settings.secondary, announcement.settings.tertiary].filter((value): value is string => typeof value === "string" && Boolean(value)) : [];
  return <>
    {announcements.length > 0 && <div className="announcement">{announcements.map((message) => <span key={message}>{message}</span>)}</div>}
    <header className="site-header">
      <button className="icon-button mobile-only" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu/></button>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <button onClick={() => setShopOpen((open) => !open)} aria-expanded={shopOpen}>Shop <ChevronDown/></button>
        <Link to="new-arrivals">New arrivals</Link><Link to="best-sellers">Bestseller</Link>
      </nav>
      <Link to="home" className="brand-mark"><img src={`${BASE}/assets/modesi-logo.png`} alt="Modesi Jewellery"/><span>modern · desi</span></Link>
      <nav className="utility-nav" aria-label="Store tools">
        <button aria-label="Search" onClick={onSearch}><Search/></button>
        <Link to="wishlist" className="utility-link" aria-label={`Wishlist with ${wishlistCount} items`}><Heart/><b>{wishlistCount}</b></Link>
        <button aria-label={`Cart with ${cartCount} items`} onClick={onCart}><ShoppingBag/><b>{cartCount}</b></button>
      </nav>
    </header>
    {shopOpen && <div className="mega-menu"><div className="mega-intro"><Eyebrow>Shop Modesi</Eyebrow><h2>Choose your<br/><em>way in.</em></h2><Link to="shop" onNavigate={() => setShopOpen(false)}>View all 47 collections <ArrowRight/></Link></div>{megaMenu.map((group) => <div key={group.title}><h3>{group.title}</h3>{group.links.map((item) => <Link key={item} to={`shop?collection=${encodeURIComponent(item)}`} onNavigate={() => setShopOpen(false)}>{item}</Link>)}</div>)}</div>}
    {mobileOpen && <div className="menu-sheet"><button aria-label="Close menu" onClick={() => setMobileOpen(false)}><X/></button><Link to="home" onNavigate={() => setMobileOpen(false)}>Home</Link><Link to="shop" onNavigate={() => setMobileOpen(false)}>Shop all</Link><Link to="new-arrivals" onNavigate={() => setMobileOpen(false)}>New arrivals</Link><Link to="best-sellers" onNavigate={() => setMobileOpen(false)}>Bestseller</Link><Link to="modesi-story" onNavigate={() => setMobileOpen(false)}>Modesi story</Link><Link to="contact" onNavigate={() => setMobileOpen(false)}>Contact</Link></div>}
  </>;
}

function ProductCard({product, currency, wishlisted, onWishlist, onAdd, layout = "grid"}: {product: Product; currency: Currency; wishlisted: boolean; onWishlist: () => void; onAdd: () => void; layout?: "grid" | "list"}) {
  return <article className={`product-card ${layout}`}>
    <Link to={`products/${product.handle}`} className="product-image"><img src={product.image} alt={product.title}/>{product.compareAt && <span>Sale</span>}</Link>
    <button className={`wish-button${wishlisted ? " active" : ""}`} aria-label={`${wishlisted ? "Remove" : "Add"} ${product.title} ${wishlisted ? "from" : "to"} wishlist`} onClick={onWishlist}><Heart/></button>
    <div className="product-info"><p>{product.category} · {product.tags.slice(0, 2).join(" · ")}</p><Link to={`products/${product.handle}`}><h3>{product.title}</h3></Link><div><strong>{money(product.price, currency)}</strong>{product.compareAt && <s>{money(product.compareAt, currency)}</s>}<button onClick={onAdd}>Add to bag</button></div>{layout === "list" && <span>{product.attributes.material} · {product.attributes.finish} · {product.attributes.occasion}</span>}</div>
  </article>;
}

function ProductRail(props: {products: Product[]; currency: Currency; wishlist: string[]; onWishlist: (handle: string) => void; onAdd: (product: Product) => void}) {
  return <div className="product-row">{props.products.map((product) => <ProductCard key={product.id} product={product} currency={props.currency} wishlisted={props.wishlist.includes(product.handle)} onWishlist={() => props.onWishlist(product.handle)} onAdd={() => props.onAdd(product)}/>)}</div>;
}

function promotionTarget(value: string) {
  const original = value.trim();
  let target = original;
  if (/^https:\/\//i.test(original)) {
    try {
      const url = new URL(original);
      const merchantHosts = new Set(["modesijewellery.com", "www.modesijewellery.com", "revenuedesk-dev.myshopify.com"]);
      if (!merchantHosts.has(url.hostname.toLowerCase())) return "";
      target = `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return "";
    }
  }
  target = target.replace(/^\/+/, "").replace(/^modesi-jewellery\/?/, "");
  if (!target) return "shop";
  const collectionMatch = target.match(/^collections\/([^?#/]+)(.*)$/i);
  if (collectionMatch) return collectionMatch[1] === "all" ? "shop" : `shop?collection=${encodeURIComponent(collectionMatch[1])}${collectionMatch[2].replace(/^\?/, "&")}`;
  if (target.startsWith("pages/contact")) target = target.replace(/^pages\/contact/, "contact");
  return target;
}

function OfferCarousel({offers}: {offers: Promotion[]}) {
  const [active, setActive] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [failedImages, setFailedImages] = useState<string[]>([]);
  const multiple = offers.length > 1;

  useEffect(() => {
    if (!offers.length) return;
    setActive((current) => current % offers.length);
  }, [offers.length]);
  if (!offers.length) return null;
  const activeIndex = active % offers.length;
  const offer = offers[activeIndex];
  const showImage = Boolean(offer.image) && !failedImages.includes(offer.image || "");
  const offerTarget = promotionTarget(offer.linkUrl);
  const offerLabel = [offer.title, offer.message, offer.linkLabel].filter(Boolean).join(". ") || "View current Modesi offer";
  function select(next: number) {
    const index = (next + offers.length) % offers.length;
    setActive(index);
    setAnnouncement(`Showing offer ${index + 1} of ${offers.length}: ${offers[index].title}`);
  }

  return <section
    className="offer-carousel"
    role="region"
    aria-roledescription={multiple ? "carousel" : undefined}
    aria-label={multiple ? "Current Modesi offers" : "Current Modesi offer"}
  >
    <article className="offer-slide offer-artwork-only" role={multiple ? "group" : undefined} aria-roledescription={multiple ? "slide" : undefined} aria-label={multiple ? `Offer ${activeIndex + 1} of ${offers.length}` : undefined}>
      {offerTarget ? <Link to={offerTarget} className="offer-artwork-link" ariaLabel={offerLabel}>
        <div className={`offer-visual${offer.image?.includes("/assets/products/") ? " product-offer" : ""}${showImage ? "" : " no-image"}`}>
          {showImage ? <img src={offer.image} alt={offer.imageAlt} onError={() => offer.image && setFailedImages((current) => current.includes(offer.image!) ? current : [...current, offer.image!])}/> : <div className="offer-brand-panel" aria-hidden="true"><b>M</b><small>MODESI</small></div>}
        </div>
      </Link> : <div className="offer-artwork-link">
        <div className={`offer-visual${offer.image?.includes("/assets/products/") ? " product-offer" : ""}${showImage ? "" : " no-image"}`}>
          {showImage ? <img src={offer.image} alt={offer.imageAlt} onError={() => offer.image && setFailedImages((current) => current.includes(offer.image!) ? current : [...current, offer.image!])}/> : <div className="offer-brand-panel" aria-hidden="true"><b>M</b><small>MODESI</small></div>}
        </div>
      </div>}
      {multiple && <div className="offer-navigation">
        <div className="offer-controls">
          <button type="button" onClick={() => select(activeIndex - 1)} aria-label="Previous offer"><ArrowLeft/></button>
          <span>{String(activeIndex + 1).padStart(2, "0")} / {String(offers.length).padStart(2, "0")}</span>
          <button type="button" onClick={() => select(activeIndex + 1)} aria-label="Next offer"><ArrowRight/></button>
        </div>
        <div className="offer-dots" role="group" aria-label="Choose an offer">{offers.map((item, index) => <button type="button" key={item.id} className={index === activeIndex ? "active" : ""} onClick={() => select(index)} aria-label={`Show offer ${index + 1}`} aria-current={index === activeIndex ? "true" : undefined}/>)}</div>
      </div>}
    </article>
    <p className="visually-hidden" aria-live="polite">{announcement}</p>
  </section>;
}

function ReelStreamCard({reel, index, paused, reducedMotion, onPlay}: {reel: Reel; index: number; paused: boolean; reducedMotion: boolean; onPlay: (reel: Reel) => void}) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [nearby, setNearby] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const source = reel.preview || "";

  useEffect(() => {
    setReady(false);
    setFailed(false);
  }, [source]);
  useEffect(() => {
    const card = cardRef.current;
    const root = card?.closest<HTMLElement>(".reel-stream") || null;
    if (!card || !("IntersectionObserver" in window)) {
      setNearby(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setNearby(entry.isIntersecting), {root, rootMargin: "10% 0px", threshold: .15});
    observer.observe(card);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!nearby) setReady(false);
  }, [nearby]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !source) return;
    video.muted = true;
    video.defaultMuted = true;
    if (paused || reducedMotion) {
      video.pause();
      return;
    }
    void video.play().catch(() => undefined);
  }, [nearby, paused, reducedMotion, source]);

  return <button
    ref={cardRef}
    type="button"
    className="reel-stream-card"
    onClick={() => onPlay(reel)}
    aria-label={`Watch ${reel.title}`}
    aria-hidden={nearby ? undefined : "true"}
    tabIndex={nearby ? 0 : -1}
  >
      {reel.poster ? <img src={reel.poster} alt=""/> : <div className="reel-preview-fallback" aria-hidden="true"><b>M</b></div>}
      {!reducedMotion && nearby && source && !failed && <video
        key={source}
        ref={videoRef}
        className={ready ? "ready" : ""}
        src={source}
        muted
        playsInline
        autoPlay={!paused}
        loop
        preload="metadata"
        aria-hidden="true"
        onCanPlay={(event) => {
          event.currentTarget.muted = true;
          event.currentTarget.defaultMuted = true;
          if (!paused) void event.currentTarget.play().catch(() => undefined);
        }}
        onPlaying={() => setReady(true)}
        onTimeUpdate={(event) => {
          if (event.currentTarget.currentTime < 2.95) return;
          event.currentTarget.currentTime = 0;
          if (!paused) void event.currentTarget.play().catch(() => undefined);
        }}
        onError={() => setFailed(true)}
      />}
      <span><b>REEL {String(index + 1).padStart(2, "0")}</b><i><Play/> View</i></span>
  </button>;
}

function ReelStream({reels, side, paused, reducedMotion, onPlay}: {reels: Reel[]; side: "left" | "right"; paused: boolean; reducedMotion: boolean; onPlay: (reel: Reel) => void}) {
  if (!reels.length) return null;
  const split = Math.min(3, reels.length);
  const ordered = side === "right" ? [...reels.slice(split), ...reels.slice(0, split)] : reels;
  const group = (duplicate: boolean) => <div className="reel-stream-group">
    {ordered.map((reel, index) => <ReelStreamCard key={`${duplicate ? "copy" : "source"}-${reel.id}`} reel={reel} index={(index + (side === "right" ? split : 0)) % reels.length} paused={paused} reducedMotion={reducedMotion} onPlay={onPlay}/>) }
  </div>;
  return <aside className={`reel-stream reel-stream-${side}${paused ? " is-paused" : ""}`} aria-label={`${side === "left" ? "Left" : "Right"} Modesi reel stream`}>
    <div className="reel-stream-track">
      {group(false)}
      {!reducedMotion && group(true)}
    </div>
  </aside>;
}

function OfferMediaStage({offers, reels, modalOpen, onPlay}: {offers: Promotion[]; reels: Reel[]; modalOpen: boolean; onPlay: (reel: Reel) => void}) {
  const stageRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    const node = stageRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {rootMargin: "100px 0px", threshold: .05});
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  if (!offers.length) return null;
  const paused = modalOpen || !inView || !pageVisible || reducedMotion;
  return <section
    ref={stageRef}
    className={`offer-media-stage${reels.length ? "" : " no-reels"}`}
    aria-labelledby="offer-media-title"
  >
    <h2 id="offer-media-title" className="visually-hidden">Current Modesi offers with reel previews</h2>
    <OfferCarousel offers={offers}/>
    <ReelStream reels={reels} side="left" paused={paused} reducedMotion={reducedMotion} onPlay={onPlay}/>
    <ReelStream reels={reels} side="right" paused={paused} reducedMotion={reducedMotion} onPlay={onPlay}/>
  </section>;
}

function PromiseMarquee() {
  return <section className="promise-marquee" aria-label="Modesi shopping promises" tabIndex={0}>
    <div className="promise-track">{[...servicePromises, ...servicePromises].map((promise, index) => {
      const duplicate = index >= servicePromises.length;
      return <article key={`${promise.title}-${index}`} aria-hidden={duplicate ? "true" : undefined}>
        <span>{String((index % servicePromises.length) + 1).padStart(2, "0")}</span>
        <div><h3>{promise.title}</h3><p>{promise.copy}</p></div>
      </article>;
    })}</div>
  </section>;
}

function HomePage({products, reels, promotions, reelModalOpen, currency, wishlist, onWishlist, onAdd, onPlay}: {products: Product[]; reels: Reel[]; promotions: Promotion[] | null; reelModalOpen: boolean; currency: Currency; wishlist: string[]; onWishlist: (handle: string) => void; onAdd: (product: Product) => void; onPlay: (reel: Reel) => void}) {
  const best = products.filter((product) => product.bestseller);
  const newest = products.filter((product) => product.isNew);
  return <>
    <section className="hero hero-artwork"><h1 className="visually-hidden">Modesi contemporary Indian jewellery</h1><Link to="shop" className="hero-artwork-link"><picture><source media="(max-width: 700px)" srcSet={`${BASE}/assets/editorial/hero-mobile.webp`}/><img src={`${BASE}/assets/editorial/hero-desktop.webp`} alt="Modesi jewellery campaign featuring modern Indian styling"/></picture><span className="visually-hidden">Shop the current Modesi collection</span></Link></section>
    <section className="identity-line" aria-label="Modesi brand statements"><span>Where Modern Meets Desi</span><strong>Heritage is everyday.</strong><span>Boldly Desi. Beautifully Modern.</span><strong>Made for languages, cities and styles.</strong></section>
    {promotions && <OfferMediaStage offers={promotions} reels={reels} modalOpen={reelModalOpen} onPlay={onPlay}/>}
    <PromiseMarquee/>
    <section className="product-feature"><SectionTitle index="01 · OUR BESTSELLER" title="Most loved by" accent="our customers." copy="Timeless design and quiet elegance, made to complement your individuality and everyday style."/><ProductRail products={best} currency={currency} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd}/><Link to="best-sellers" className="text-link">View bestseller collection <ArrowRight/></Link></section>
    <section className="product-feature new-arrivals-panel"><SectionTitle index="02 · NEW ARRIVALS" title="Be the first" accent="to shine." copy="Refined, wearable pieces for everyday moments and meaningful ones."/><ProductRail products={newest} currency={currency} wishlist={wishlist} onWishlist={onWishlist} onAdd={onAdd}/><Link to="new-arrivals" className="text-link">View new arrivals <ArrowRight/></Link></section>
    <section className="collection-section"><SectionTitle index="03 · OUR COLLECTION" title="Crafted with elegance," accent="designed for you."/><div className="collection-run">{featuredCollections.map((collection, index) => <Link key={collection.handle} to={`shop?collection=${collection.handle}`}><img src={collection.image} alt={`${collection.title} collection`}/><span>{String(index + 1).padStart(2, "0")}</span><h3>{collection.title}</h3><b>Explore <ArrowRight/></b></Link>)}</div></section>
    <section className="story-teaser"><div className="story-image"><img src={`${BASE}/assets/editorial/about-heritage.png`} alt="Modesi brand story visual"/></div><div><Eyebrow>04 · MODESI STORY</Eyebrow><h2>You do not have to choose between <em>modern</em> and <em>desi.</em></h2><p>{story.intro}</p><Link to="modesi-story">Read the brand story <ArrowRight/></Link></div></section>
    <section className="claim-ticker">{siteClaims.map((claim, index) => <div key={claim}><span>{String(index + 1).padStart(2, "0")}</span><strong>{claim}</strong></div>)}</section>
  </>;
}

const filterLabels: {key: ProductAttributeKey; label: string}[] = [
  {key: "material", label: "Base metal"}, {key: "finish", label: "Plating & finish"}, {key: "stone", label: "Stone"},
  {key: "colour", label: "Colour"}, {key: "style", label: "Style"}, {key: "occasion", label: "Occasion"},
  {key: "size", label: "Size"}, {key: "closure", label: "Closure"},
];

function ShopPage({title = "Shop all", intro = "All current Modesi pieces", products, currency, wishlist, onWishlist, onAdd}: {title?: string; intro?: string; products: Product[]; currency: Currency; wishlist: string[]; onWishlist: (handle: string) => void; onAdd: (product: Product) => void}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [sort, setSort] = useState("featured");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [maxPrice, setMaxPrice] = useState(1000);
  const requestedCollection = handleize(new URLSearchParams(window.location.search).get("collection")?.replace(/\/$/, "") || "");
  function toggle(key: string, value: string) { setSelected((current) => ({...current, [key]: current[key]?.includes(value) ? current[key].filter((item) => item !== value) : [...(current[key] || []), value]})); }
  const filtered = useMemo(() => {
    const matches = products.filter((product) => {
      if (requestedCollection) {
        const categoryHandle = product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const collectionMatches = product.collectionHandles.some((handle) => handle === requestedCollection || handle === `modesi-${requestedCollection}`);
        if (!collectionMatches && categoryHandle !== requestedCollection) return false;
      }
      if (product.price > maxPrice) return false;
      if (selected.availability?.length && !selected.availability.includes(product.availability)) return false;
      if (selected.category?.length && !selected.category.includes(product.category)) return false;
      return filterLabels.every(({key}) => !selected[key]?.length || selected[key].includes(product.attributes[key]));
    });
    return [...matches].sort((a, b) => sort === "price-asc" ? a.price - b.price : sort === "price-desc" ? b.price - a.price : sort === "alpha" ? a.title.localeCompare(b.title) : sort === "newest" ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : 0);
  }, [products, selected, maxPrice, sort, requestedCollection]);
  const values = (key: ProductAttributeKey) => [...new Set(products.map((product) => product.attributes[key]))];
  const categories = [...new Set(products.map((product) => product.category))];
  return <div className="shop-page"><section className="page-hero shop-hero"><Eyebrow>MODESI CATALOGUE</Eyebrow><h1>{requestedCollection ? requestedCollection.replace(/-/g, " ") : title}</h1><p>{intro}. Use live product data now; richer axes are ready for Shopify Search & Discovery metafields.</p><div><span>{products.length} current products</span><span>47 catalogue collections</span><span>9 detailed filter axes</span></div></section>
    <div className="shop-toolbar"><button onClick={() => setFiltersOpen((open) => !open)}><SlidersHorizontal/> Filters</button><span>Showing {filtered.length} of {products.length}</span><label>Sort <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="newest">New to old</option><option value="alpha">A–Z</option><option value="price-asc">Lowest price</option><option value="price-desc">Highest price</option></select></label><div><button className={layout === "grid" ? "active" : ""} onClick={() => setLayout("grid")} aria-label="Grid view"><Grid2X2/></button><button className={layout === "list" ? "active" : ""} onClick={() => setLayout("list")} aria-label="List view"><List/></button></div></div>
    <div className={`shop-layout${filtersOpen ? " filters-open" : ""}`}>
      <aside className="filter-panel"><div className="filter-head"><strong>Refine</strong><button onClick={() => {setSelected({}); setMaxPrice(1000);}}>Clear all</button></div>
        <details open><summary>Availability <ChevronDown/></summary>{["in-stock", "out-of-stock"].map((value) => <label key={value}><input type="checkbox" checked={selected.availability?.includes(value) || false} onChange={() => toggle("availability", value)}/><span>{value === "in-stock" ? "In stock" : "Out of stock"}</span><b>{products.filter((product) => product.availability === value).length}</b></label>)}</details>
        <details open><summary>Price <ChevronDown/></summary><input type="range" min="0" max="1000" step="50" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))}/><p>₹0 — ₹{maxPrice}</p></details>
        <details><summary>Jewellery type <ChevronDown/></summary>{categories.map((value) => <label key={value}><input type="checkbox" checked={selected.category?.includes(value) || false} onChange={() => toggle("category", value)}/><span>{value}</span><b>{products.filter((product) => product.category === value).length}</b></label>)}</details>
        {filterLabels.map(({key, label}) => <details key={key}><summary>{label} <ChevronDown/></summary>{values(key).map((value) => <label key={value}><input type="checkbox" checked={selected[key]?.includes(value) || false} onChange={() => toggle(key, value)}/><span>{value}</span><b>{products.filter((product) => product.attributes[key] === value).length}</b></label>)}</details>)}
      </aside>
      <main className={`catalogue-grid ${layout}`}>{filtered.length ? filtered.map((product) => <ProductCard key={product.id} product={product} currency={currency} wishlisted={wishlist.includes(product.handle)} onWishlist={() => onWishlist(product.handle)} onAdd={() => onAdd(product)} layout={layout}/>) : <div className="empty-state"><PackageSearch/><h2>No pieces match all filters</h2><p>Remove one or more filters to widen the selection.</p><button onClick={() => setSelected({})}>Clear filters</button></div>}</main>
    </div>
    <section className="all-collections"><Eyebrow>FULL SHOP TAXONOMY</Eyebrow><h2>Every collection currently in Shopify.</h2><div>{catalogueCollections.map((collection) => <Link key={collection} to={`shop?collection=${encodeURIComponent(collection)}`}>{collection}<ArrowRight/></Link>)}</div></section>
  </div>;
}

function ProductPage({product, related, currency, wishlisted, onWishlist, onAdd}: {product: Product; related: Product[]; currency: Currency; wishlisted: boolean; onWishlist: () => void; onAdd: (product: Product, quantity?: number) => void}) {
  const [quantity, setQuantity] = useState(1);
  const [enquiry, setEnquiry] = useState(false);
  const saving = product.compareAt ? product.compareAt - product.price : 0;
  return <div className="product-page"><nav className="breadcrumbs"><Link to="home">Home</Link><span>/</span><Link to="shop">Products</Link><span>/</span><b>{product.title}</b></nav>
    <section className="product-focus"><div className="product-gallery"><img src={product.image} alt={product.title}/><button>Tap image to inspect</button></div><div className="product-buy"><Eyebrow>{product.category} · {product.availability === "in-stock" ? "In stock" : "Out of stock"}</Eyebrow><h1>{product.title}</h1><div className="rating-empty"><span>☆ ☆ ☆ ☆ ☆</span><b>0 reviews</b></div><p className="product-price">{money(product.price, currency)} {product.compareAt && <><s>{money(product.compareAt, currency)}</s><i>Save {money(saving, currency)}</i></>}</p><p>Shipping calculated at checkout.</p><div className="product-actions-secondary"><button onClick={onWishlist}><Heart fill={wishlisted ? "currentColor" : "none"}/> {wishlisted ? "Saved" : "Add to wishlist"}</button><button onClick={() => setEnquiry(true)}><Mail/> Product enquiry</button></div><div className="quantity"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus/></button><span>{quantity}</span><button onClick={() => setQuantity((value) => value + 1)}><Plus/></button></div><button className="primary-buy" onClick={() => onAdd(product, quantity)}>Add to bag · {money(product.price * quantity, currency)}</button><button className="secondary-buy" onClick={() => {onAdd(product, quantity); window.history.pushState({}, "", pathFor("checkout")); window.dispatchEvent(new PopStateEvent("popstate"));}}>Buy it now</button><div className="secure-note"><ShieldCheck/><span><strong>100% secure payment</strong>Major cards and UPI accepted.</span></div>
        <div className="product-spec"><h2>Current product information</h2>{Object.entries(product.attributes).map(([key, value]) => <div key={key}><span>{key.replace(/\b\w/g, (letter) => letter.toUpperCase())}</span><b>{value}</b></div>)}</div>
      </div></section>
    <section className="product-details"><details open><summary>Product description <Plus/></summary><div dangerouslySetInnerHTML={{__html: product.descriptionHtml || `<p>The current Modesi product record does not yet include a written description.</p>`}}/></details><details><summary>Delivery & returns <Plus/></summary><p>Free shipping on prepaid orders above ₹999. Exchanges are offered within 7 days of delivery for unused items in their original condition.</p></details><details><summary>Care <Plus/></summary><p>Store in a dry place away from moisture and chemicals. Wipe gently with a soft cloth after wear.</p></details></section>
    <section className="faq-section"><SectionTitle index="PRODUCT GUIDANCE" title="Modesi" accent="FAQ."/>{faqs.map((faq) => <details key={faq.question}><summary>{faq.question}<Plus/></summary><p>{faq.answer}</p></details>)}</section>
    {widgetsFor("product", "product-after-buy").some((widget) => widget.component === "reviews") && <section className="reviews-empty"><Eyebrow>TRUSTOO REVIEW PLACEMENT</Eyebrow><h2>Customer reviews</h2><div><strong>0.0</strong><span>☆ ☆ ☆ ☆ ☆</span><p>There are no reviews yet.</p><button>Write a review</button></div></section>}
    <section className="product-feature"><SectionTitle index="EXPLORE MORE" title="More from" accent="Modesi."/><ProductRail products={related} currency={currency} wishlist={wishlisted ? [product.handle] : []} onWishlist={() => undefined} onAdd={onAdd}/></section>
    {enquiry && <div className="modal" role="dialog" aria-modal="true"><div className="modal-card"><button className="modal-close" onClick={() => setEnquiry(false)}><X/></button><Eyebrow>PRODUCT ENQUIRY</Eyebrow><h2>Ask about {product.title}</h2><form onSubmit={(event) => {event.preventDefault(); setEnquiry(false);}}><input value={product.title} readOnly/><input required placeholder="Name"/><input required type="email" placeholder="Email"/><input placeholder="Phone number"/><textarea required placeholder="Your question"/><button>Send enquiry</button></form></div></div>}
  </div>;
}

function StoryPage() { return <div className="story-page"><section className="story-hero"><img src={`${BASE}/assets/editorial/about-heritage.png`} alt="Modesi modern and desi campaign"/><div><Eyebrow light>MODESI · BRAND STORY</Eyebrow><h1>Made between<br/><em>worlds.</em></h1><p>{story.intro}</p></div></section><section className="story-chapter"><span>01</span><div><Eyebrow>THE IDEA</Eyebrow><h2>A runway in Milan.<br/>A mehendi in Mumbai.</h2></div><p>{story.body}</p></section><section className="story-manifesto"><div><Eyebrow light>02 · BRAND MANIFESTO</Eyebrow><h2>Heritage is not reserved for weddings. <em>It is everyday.</em></h2><p>{story.manifesto}</p></div><img src={`${BASE}/assets/editorial/about-modern.png`} alt="Modern Modesi jewellery styling"/></section><section className="founder-note"><Eyebrow>03 · FOUNDER’S NOTE</Eyebrow><blockquote>“{story.founder}”</blockquote><p>— {story.founderName}</p><small>The live source contains a second, inconsistent founder attribution. This concept intentionally avoids structured founder schema until Modesi verifies it.</small></section></div>; }

function ContactPage() {
  const [sent, setSent] = useState(false);
  function submit(event: FormEvent) { event.preventDefault(); setSent(true); }
  return <div className="contact-page"><section className="page-hero contact-hero"><Eyebrow>CONTACT MODESI</Eyebrow><h1>How can we<br/><em>help?</em></h1><p>Have a question but aren’t sure who to contact? Send a note and a member of the Modesi team can reach out.</p></section><section className="contact-grid"><div className="contact-details"><div><Phone/><span><small>Phone</small><a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></span></div><div><Mail/><span><small>Email</small><a href={`mailto:${contact.email}`}>{contact.email}</a></span></div><div><Clock3/><span><small>Opening hours</small>{contact.hours.map((hour) => <b key={hour}>{hour}</b>)}</span></div><div><MapPin/><span><small>Office</small><b>{contact.address}</b></span></div></div>{sent ? <div className="form-success"><Sparkles/><h2>Message prepared.</h2><p>This concept keeps submissions local until the Shopify/contact adapter is connected.</p><button onClick={() => setSent(false)}>Send another</button></div> : <form onSubmit={submit}><div><label>Name<input required/></label><label>Email<input required type="email"/></label></div><div><label>Phone<input type="tel"/></label><label>Subject<input required/></label></div><label>Message<textarea required rows={7}/></label><button>Send message <ArrowRight/></button></form>}</section></div>;
}

function WishlistPage({products, handles, currency, onWishlist, onAdd}: {products: Product[]; handles: string[]; currency: Currency; onWishlist: (handle: string) => void; onAdd: (product: Product) => void}) {
  const saved = products.filter((product) => handles.includes(product.handle));
  return <div className="simple-page"><section className="page-hero"><Eyebrow>SAVED PIECES</Eyebrow><h1>Your wishlist.</h1><p>Pieces stay saved on this device until Shopify customer accounts are connected.</p></section>{saved.length ? <div className="catalogue-grid grid">{saved.map((product) => <ProductCard key={product.id} product={product} currency={currency} wishlisted onWishlist={() => onWishlist(product.handle)} onAdd={() => onAdd(product)}/>)}</div> : <div className="empty-state page-empty"><Heart/><h2>Nothing saved yet</h2><p>Use the heart on any product to keep it here.</p><Link to="shop">Explore jewellery</Link></div>}</div>;
}

function CartPage({lines, currency, onQuantity, onRemove}: {lines: CartLine[]; currency: Currency; onQuantity: (handle: string, quantity: number) => void; onRemove: (handle: string) => void}) {
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  return <div className="simple-page"><section className="page-hero"><Eyebrow>YOUR BAG</Eyebrow><h1>Cart.</h1><p>Taxes and shipping are calculated at Shopify checkout.</p></section>{lines.length ? <div className="cart-layout"><div className="cart-lines">{lines.map((line) => <article key={line.product.handle}><img src={line.product.image} alt={line.product.title}/><div><Eyebrow>{line.product.category}</Eyebrow><Link to={`products/${line.product.handle}`}><h2>{line.product.title}</h2></Link><p>{money(line.product.price, currency)}</p><div className="quantity"><button onClick={() => onQuantity(line.product.handle, Math.max(1, line.quantity - 1))}><Minus/></button><span>{line.quantity}</span><button onClick={() => onQuantity(line.product.handle, line.quantity + 1)}><Plus/></button></div></div><button className="remove-line" onClick={() => onRemove(line.product.handle)}><Trash2/> Remove</button></article>)}</div><aside className="cart-summary"><Eyebrow>ORDER SUMMARY</Eyebrow><div><span>Subtotal</span><strong>{money(subtotal, currency)}</strong></div><div><span>Shipping</span><b>Calculated next</b></div><p>Free prepaid shipping applies above ₹999.</p><Link to="checkout" className="primary-buy">Proceed to checkout</Link><Link to="shop" className="text-link"><ArrowLeft/> Continue shopping</Link></aside></div> : <div className="empty-state page-empty"><ShoppingBag/><h2>Your cart is empty</h2><p>Add a Modesi piece and it will appear here.</p><Link to="shop">Continue shopping</Link></div>}</div>;
}

function CheckoutPage({lines, currency}: {lines: CartLine[]; currency: Currency}) {
  const [status, setStatus] = useState<"form" | "loading" | "demo">("form");
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  async function continueCheckout(event: FormEvent) { event.preventDefault(); setStatus("loading"); try { const cart = await createShopifyCheckout(lines.map((line) => ({merchandiseId: line.product.variantId, quantity: line.quantity}))); if (cart) { window.location.href = cart.checkoutUrl; return; } setStatus("demo"); } catch { setStatus("demo"); } }
  return <div className="checkout-page"><header><Link to="home" className="brand-mark"><img src={`${BASE}/assets/modesi-logo.png`} alt="Modesi"/></Link><span>Secure checkout concept <ShieldCheck/></span></header><main><form onSubmit={continueCheckout}><Eyebrow>CONTACT</Eyebrow><input required type="email" placeholder="Email"/><Eyebrow>DELIVERY</Eyebrow><div className="checkout-fields"><input required placeholder="First name"/><input required placeholder="Last name"/><input required placeholder="Address"/><input placeholder="Apartment, suite, etc."/><input required placeholder="City"/><input required placeholder="State"/><input required inputMode="numeric" placeholder="PIN code"/><input required type="tel" placeholder="Phone"/></div><Eyebrow>PAYMENT</Eyebrow><div className="payment-demo"><ShieldCheck/><span><b>Shopify-hosted payment</b>Cards and UPI will open on the connected store.</span></div><button className="primary-buy" disabled={!lines.length || status === "loading"}>{status === "loading" ? "Preparing Shopify checkout…" : `Continue · ${money(subtotal, currency)}`}</button>{status === "demo" && <p className="checkout-note">Demo complete. Set <code>VITE_SHOPIFY_CHECKOUT_MODE=live</code> after the development store is connected to open real Shopify checkout.</p>}</form><aside><Eyebrow>ORDER SUMMARY</Eyebrow>{lines.map((line) => <div className="checkout-line" key={line.product.handle}><img src={line.product.image} alt=""/><span><b>{line.product.title}</b><small>Qty {line.quantity}</small></span><strong>{money(line.product.price * line.quantity, currency)}</strong></div>)}<div className="checkout-total"><span>Total</span><strong>{money(subtotal, currency)}</strong></div></aside></main></div>;
}

function TrackOrderPage() { const [checked, setChecked] = useState(false); return <div className="simple-page"><section className="page-hero"><Eyebrow>ORDER HELP</Eyebrow><h1>Track an order.</h1><p>Use the email and order number received from Shopify.</p></section><form className="track-form" onSubmit={(event) => {event.preventDefault(); setChecked(true);}}><input required type="email" placeholder="Email address"/><input required placeholder="Order number"/><button>Check status <ArrowRight/></button>{checked && <p>This demo is ready to connect to the Shopify order-status adapter. No order was found in local data.</p>}</form></div>; }

function Footer() { return <footer><div className="footer-brand"><img src={`${BASE}/assets/modesi-logo.png`} alt="Modesi"/><p>Minimal jewellery dedicated to timeless elegance and modern simplicity—refined, wearable and designed for everyday moments as well as meaningful ones.</p><div><a href="https://www.instagram.com" aria-label="Instagram"><Instagram/></a><a href={`mailto:${contact.email}`} aria-label="Email"><Mail/></a></div></div><div><h3>Shop</h3><Link to="shop">All products</Link><Link to="best-sellers">Bestseller</Link><Link to="new-arrivals">New arrivals</Link><Link to="wishlist">Wishlist</Link></div><div><h3>Modesi</h3><Link to="modesi-story">About</Link><Link to="contact">Contact</Link><Link to="track-order">Track order</Link><a href="https://modesijewellery.com/blogs/news">Blogs</a></div><div><h3>Customer service</h3><a href="https://modesijewellery.com/policies/privacy-policy">Privacy policy</a><a href="https://modesijewellery.com/policies/refund-policy">Refund policy</a><a href="https://modesijewellery.com/policies/shipping-policy">Shipping policy</a><a href="https://modesijewellery.com/policies/terms-of-service">Terms of service</a></div><div className="footer-bottom"><span>© 2026 MODESI JEWELLERY · CONCEPT STOREFRONT</span><span>Hydrogen-compatible · Shopify-synced</span></div></footer>; }

function CartDrawer({open, lines, currency, onClose, onQuantity, onRemove}: {open: boolean; lines: CartLine[]; currency: Currency; onClose: () => void; onQuantity: (handle: string, quantity: number) => void; onRemove: (handle: string) => void}) {
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  return <div className={`drawer-layer${open ? " open" : ""}`} aria-hidden={!open}><button className="drawer-backdrop" onClick={onClose} aria-label="Close cart"/><aside className="cart-drawer"><header><div><Eyebrow>MODESI</Eyebrow><h2>Your bag <span>({lines.length})</span></h2></div><button onClick={onClose}><X/></button></header><main>{lines.length ? lines.map((line) => <article key={line.product.handle}><img src={line.product.image} alt={line.product.title}/><div><h3>{line.product.title}</h3><p>{money(line.product.price, currency)}</p><div className="mini-quantity"><button onClick={() => onQuantity(line.product.handle, Math.max(1, line.quantity - 1))}>−</button><span>{line.quantity}</span><button onClick={() => onQuantity(line.product.handle, line.quantity + 1)}>+</button></div></div><button onClick={() => onRemove(line.product.handle)}><Trash2/></button></article>) : <div className="drawer-empty"><ShoppingBag/><h3>Your bag is waiting.</h3><p>Add a current Modesi piece to begin.</p></div>}</main><footer><div><span>Subtotal</span><strong>{money(subtotal, currency)}</strong></div><Link to="cart" className="primary-buy" onNavigate={onClose}>View cart</Link><Link to="checkout" className="secondary-buy" onNavigate={onClose}>Checkout</Link></footer></aside></div>;
}

function SearchOverlay({open, products, onClose}: {open: boolean; products: Product[]; onClose: () => void}) { const [query, setQuery] = useState(""); const results = products.filter((product) => `${product.title} ${product.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())); return open ? <div className="search-overlay"><header><Search/><input autoFocus placeholder="Search products, styles and collections" value={query} onChange={(event) => setQuery(event.target.value)}/><button onClick={onClose}><X/></button></header><div><p>Popular searches: Ring · Earring · Pendant · Necklace · Bracelets</p>{query && <main>{results.map((product) => <Link key={product.handle} to={`products/${product.handle}`} onNavigate={onClose}><img src={product.image} alt=""/><span><small>{product.category}</small><strong>{product.title}</strong></span><ArrowRight/></Link>)}{!results.length && <span>No matching products.</span>}</main>}</div></div> : null; }

function Newsletter({open, onClose}: {open: boolean; onClose: () => void}) { return open ? <div className="modal newsletter-modal" role="dialog" aria-modal="true"><div className="newsletter-card"><img src={`${BASE}/assets/editorial/craft-detail.jpg`} alt="Modesi jewellery detail"/><div><button className="modal-close" onClick={onClose}><X/></button><Eyebrow>JOIN OUR MAILING LIST</Eyebrow><h2>Stay informed.</h2><p>Monthly tips, tracks and discounts from Modesi.</p><form onSubmit={(event) => {event.preventDefault(); onClose();}}><input required type="email" placeholder="Email address"/><button>Subscribe <ArrowRight/></button></form><button className="dismiss-link" onClick={onClose}>Don’t show this again today</button></div></div></div> : null; }

function FloatingWidgets({route, products, currency, onCurrency}: {route: string; products: Product[]; currency: Currency; onCurrency: (currency: Currency) => void}) {
  const [proofIndex, setProofIndex] = useState(0); const [concierge, setConcierge] = useState(false); const [currencyOpen, setCurrencyOpen] = useState(false);
  useEffect(() => { const timer = window.setInterval(() => setProofIndex((value) => (value + 1) % Math.max(products.length, 1)), 10100); return () => window.clearInterval(timer); }, [products.length]);
  const page = widgetPageForRoute(route);
  const leftWidgets = widgetsFor(page, "floating-left");
  const rightWidgets = widgetsFor(page, "floating-right");
  const proof = leftWidgets.some((widget) => widget.component === "social-proof");
  const showCurrency = leftWidgets.some((widget) => widget.component === "currency");
  const showConcierge = rightWidgets.some((widget) => widget.component === "whatsapp");
  const showTracking = rightWidgets.some((widget) => widget.component === "track-order");
  return <>{proof && products[proofIndex] && <aside className="social-proof"><img src={products[proofIndex].image} alt=""/><div><p>From the current Modesi catalogue</p><strong>{products[proofIndex].title}</strong><span>{money(products[proofIndex].price, currency)} · Explore now</span></div></aside>}{showCurrency && <div className="currency-widget"><button onClick={() => setCurrencyOpen((open) => !open)}>{currency}</button>{currencyOpen && <div>{(Object.keys(currencyRates) as Currency[]).map((code) => <button key={code} onClick={() => {onCurrency(code); setCurrencyOpen(false);}}>{code}</button>)}<small>Display estimate</small></div>}</div>}{showConcierge && <button className="concierge" aria-label="Open Modesi concierge" onClick={() => setConcierge(true)}><Sparkles/><span>Ask Modesi</span></button>}{showConcierge && concierge && <div className="concierge-panel"><header><div><Eyebrow>MODESI CONCIERGE</Eyebrow><h2>What do you need?</h2></div><button onClick={() => setConcierge(false)}><X/></button></header>{showTracking && <Link to="track-order" onNavigate={() => setConcierge(false)}><PackageSearch/><span><strong>Track an order</strong>Use email and order number</span><ArrowRight/></Link>}<a href={`https://wa.me/${contact.phone.replace(/\D/g, "")}`}><Phone/><span><strong>WhatsApp</strong>{contact.phone}</span><ArrowRight/></a><Link to="contact" onNavigate={() => setConcierge(false)}><Mail/><span><strong>Contact Modesi</strong>{contact.chatEmail}</span><ArrowRight/></Link><div className="concierge-faq"><CircleHelp/><span><strong>Can I change my order?</strong>Contact the team before it ships.</span></div></div>}</>;
}

function ReelModal({reel, onClose}: {reel: Reel; onClose: () => void}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(document.activeElement instanceof HTMLElement ? document.activeElement : null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;
    const siblings = Array.from(modal.parentElement?.children || []).filter((node): node is HTMLElement => node instanceof HTMLElement && node !== modal);
    const siblingState = siblings.map((node) => ({node, inert: node.inert, ariaHidden: node.getAttribute("aria-hidden")}));
    const previousOverflow = document.body.style.overflow;
    siblings.forEach((node) => {
      node.inert = true;
      node.setAttribute("aria-hidden", "true");
    });
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = Array.from(modal!.querySelectorAll<HTMLElement>('button:not([disabled]), video[controls], [href], [tabindex]:not([tabindex="-1"])'));
      if (!focusable.length) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      siblingState.forEach(({node, inert, ariaHidden}) => {
        node.inert = inert;
        if (ariaHidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", ariaHidden);
      });
      restoreFocusRef.current?.focus();
    };
  }, [reel.id]);

  return <div ref={modalRef} className="reel-modal" role="dialog" aria-modal="true" aria-labelledby="reel-modal-title">
    <button ref={closeRef} type="button" aria-label="Close reel" onClick={onClose}><X/></button>
    <video src={reel.video} poster={reel.poster || undefined} controls autoPlay playsInline tabIndex={0}/>
    <p><span id="reel-modal-title">{reel.title}</span>{reel.sourceLabel}</p>
  </div>;
}

export default function App() {
  const [location, setLocation] = useState(() => ({route: routeFromLocation(), search: window.location.search}));
  const route = location.route;
  const [products, setProducts] = useState(productFixtures);
  const [reels, setReels] = useState(reelFixtures);
  const [promotions, setPromotions] = useState<Promotion[] | null>(null);
  const [cart, setCart] = useState<CartLine[]>(() => { try { return JSON.parse(localStorage.getItem("modesi-cart") || "[]"); } catch { return []; } });
  const [wishlist, setWishlist] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem("modesi-wishlist") || "[]"); } catch { return []; } });
  const [currency, setCurrency] = useState<Currency>("INR");
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeReel, setActiveReel] = useState<Reel | null>(null);
  const [newsletter, setNewsletter] = useState(false);
  const [, setWidgetRevision] = useState(0);
  useEffect(() => { const listener = () => setLocation({route: routeFromLocation(), search: window.location.search}); window.addEventListener("popstate", listener); return () => window.removeEventListener("popstate", listener); }, []);
  useEffect(() => {
    loadProducts().then((result) => {
      setProducts(result.products);
      setCart((current) => current.flatMap((line) => {
        const currentProduct = result.products.find((product) => product.handle === line.product.handle);
        return currentProduct ? [{...line, product: currentProduct}] : [];
      }));
    });
    loadReels().then(setReels);
  }, []);
  useEffect(() => {
    let mounted = true;
    const refreshPromotions = () => loadPromotions().then((nextPromotions) => {
      if (mounted) setPromotions(nextPromotions);
    });
    refreshPromotions();
    const timer = window.setInterval(refreshPromotions, 60000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);
  useEffect(() => { loadWidgets().then(() => setWidgetRevision((value) => value + 1)); }, []);
  useEffect(() => { localStorage.setItem("modesi-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem("modesi-wishlist", JSON.stringify(wishlist)); }, [wishlist]);
  const widgetPage = widgetPageForRoute(route);
  const newsletterEnabled = widgetsFor(widgetPage, "footer").some((widget) => widget.component === "newsletter");
  useEffect(() => { if (!newsletterEnabled || localStorage.getItem("modesi-newsletter-dismissed")) { setNewsletter(false); return; } const timer = window.setTimeout(() => setNewsletter(true), 8000); return () => window.clearTimeout(timer); }, [newsletterEnabled]);
  function add(product: Product, quantity = 1) { setCart((current) => current.some((line) => line.product.handle === product.handle) ? current.map((line) => line.product.handle === product.handle ? {...line, quantity: line.quantity + quantity} : line) : [...current, {product, quantity}]); setCartOpen(true); }
  function updateQuantity(handle: string, quantity: number) { setCart((current) => current.map((line) => line.product.handle === handle ? {...line, quantity} : line)); }
  function remove(handle: string) { setCart((current) => current.filter((line) => line.product.handle !== handle)); }
  function toggleWishlist(handle: string) { setWishlist((current) => current.includes(handle) ? current.filter((item) => item !== handle) : [...current, handle]); }
  const shared = {products, currency, wishlist, onWishlist: toggleWishlist, onAdd: add};
  let page: ReactNode;
  if (route === "home") page = <HomePage {...shared} reels={reels} promotions={promotions} reelModalOpen={Boolean(activeReel)} onPlay={setActiveReel}/>;
  else if (route === "shop") page = <ShopPage {...shared}/>;
  else if (route === "new-arrivals") page = <ShopPage {...shared} title="New arrivals" intro="Be the first to shine" products={products.filter((product) => product.isNew)}/>;
  else if (route === "best-sellers") page = <ShopPage {...shared} title="Our bestseller" intro="Most loved by our customers" products={products.filter((product) => product.bestseller)}/>;
  else if (route.startsWith("products/")) { const product = products.find((item) => item.handle === route.split("/")[1]); page = product ? <ProductPage product={product} related={products} currency={currency} wishlisted={wishlist.includes(product.handle)} onWishlist={() => toggleWishlist(product.handle)} onAdd={add}/> : <NotFound/>; }
  else if (route === "modesi-story") page = <StoryPage/>;
  else if (route === "contact") page = <ContactPage/>;
  else if (route === "wishlist") page = <WishlistPage {...shared} handles={wishlist}/>;
  else if (route === "cart") page = <CartPage lines={cart} currency={currency} onQuantity={updateQuantity} onRemove={remove}/>;
  else if (route === "checkout") return <CheckoutPage lines={cart} currency={currency}/>;
  else if (route === "track-order") page = <TrackOrderPage/>;
  else page = <NotFound/>;
  return <div className="modesi-site"><Header page={widgetPage} cartCount={cart.reduce((sum, line) => sum + line.quantity, 0)} wishlistCount={wishlist.length} onCart={() => setCartOpen(true)} onSearch={() => setSearchOpen(true)}/><main>{page}</main><Footer/><CartDrawer open={cartOpen} lines={cart} currency={currency} onClose={() => setCartOpen(false)} onQuantity={updateQuantity} onRemove={remove}/><SearchOverlay open={searchOpen} products={products} onClose={() => setSearchOpen(false)}/><Newsletter open={newsletter} onClose={() => {setNewsletter(false); localStorage.setItem("modesi-newsletter-dismissed", "1");}}/><FloatingWidgets route={route} products={products} currency={currency} onCurrency={setCurrency}/>{activeReel && <ReelModal reel={activeReel} onClose={() => setActiveReel(null)}/>}</div>;
}

function NotFound() { return <div className="empty-state page-empty"><span className="giant-404">404</span><h1>This piece is not here.</h1><p>The route may have moved, but the collection is close by.</p><Link to="home">Return home</Link></div>; }

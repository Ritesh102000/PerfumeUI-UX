export type ProductAttributeKey =
  | "material"
  | "finish"
  | "stone"
  | "colour"
  | "style"
  | "occasion"
  | "size"
  | "closure";

export type Product = {
  id: string;
  variantId: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  price: number;
  compareAt?: number;
  currencyCode: string;
  image: string;
  category: string;
  tags: string[];
  collectionHandles: string[];
  availability: "in-stock" | "out-of-stock";
  createdAt: string;
  attributes: Record<ProductAttributeKey, string>;
  isNew?: boolean;
  bestseller?: boolean;
};

// Exact public catalogue records from modesijewellery.com, captured 29 August 2026.
// Product attributes stay conservative: a site-wide material or finish statement
// is not treated as evidence for an individual product. Shopify metafields replace
// these values only after the merchant assigns them to the specific product.
export const products: Product[] = [
  {
    id: "gid://shopify/Product/9339026637051",
    variantId: "gid://shopify/ProductVariant/48954921648379",
    handle: "earrings-fancy",
    title: "earrings fancy",
    descriptionHtml: "",
    price: 50,
    compareAt: 100,
    currencyCode: "INR",
    image: "/modesi-jewellery/assets/products/earrings-fancy.png",
    category: "Earrings",
    tags: ["Best Seller", "Earrings", "Editor's Pick", "Everyday"],
    collectionHandles: ["bestseller", "new-arrivals", "earrings", "between-0-500"],
    availability: "in-stock",
    createdAt: "2026-06-08T06:06:13Z",
    attributes: {material: "Not specified", finish: "Not specified", stone: "Not specified", colour: "Not specified", style: "Not specified", occasion: "Everyday", size: "Not specified", closure: "Not specified"},
    isNew: true,
    bestseller: true,
  },
  {
    id: "gid://shopify/Product/9379245883643",
    variantId: "gid://shopify/ProductVariant/49119295996155",
    handle: "jhumka-01",
    title: "JHUMKA 01",
    descriptionHtml: "<p>JHUMKA 01</p>",
    price: 999,
    currencyCode: "INR",
    image: "/modesi-jewellery/assets/products/jhumka-01.png",
    category: "Earrings",
    tags: ["JHUMKA", "JHUMKI"],
    collectionHandles: ["bestseller", "new-arrivals", "500-1200", "jhumka-navratri-combo-2026"],
    availability: "in-stock",
    createdAt: "2026-07-31T07:38:54Z",
    attributes: {material: "Not specified", finish: "Not specified", stone: "Not specified", colour: "Not specified", style: "Jhumka", occasion: "Not specified", size: "Not specified", closure: "Not specified"},
    isNew: true,
    bestseller: true,
  },
  {
    id: "gid://shopify/Product/9379246407931",
    variantId: "gid://shopify/ProductVariant/49119302156539",
    handle: "jhumka-02",
    title: "JHUMKA 02",
    descriptionHtml: "<p>JHUMKA 02</p>",
    price: 0,
    currencyCode: "INR",
    image: "/modesi-jewellery/assets/products/jhumka-02.png",
    category: "Earrings",
    tags: ["Best Seller", "Earrings", "JHUMKA", "JHUMKI", "New Arrivals"],
    collectionHandles: ["bestseller", "new-arrivals", "earrings", "jhumka-navratri-combo-2026"],
    availability: "in-stock",
    createdAt: "2026-07-31T07:45:25Z",
    attributes: {material: "Not specified", finish: "Not specified", stone: "Not specified", colour: "Not specified", style: "Jhumka", occasion: "Not specified", size: "Not specified", closure: "Not specified"},
    isNew: true,
    bestseller: true,
  },
];

export type Reel = {
  id: string;
  title: string;
  sourceLabel: string;
  duration: string;
  poster: string;
  video: string;
};

export const reels: Reel[] = [
  ["f6025d220c39480d8e55bd9ebc375b93", "92539186", "1.6", "WhatsApp Video 20260825 at 92849 AM.mp4", "PT14S"],
  ["f652048a85f645f6bee7259469ee62a8", "92539049", "4.5", "WhatsApp Video 20260825 at 92827 AM.mp4", "PT41S"],
  ["0d6e0dc6a1a54056b246cd2b0c67b3d7", "92539045", "4.5", "WhatsApp Video 20260825 at 92829 AM 1.mp4", "PT43S"],
  ["3fd0dc4b70014ad2b6687acff3be5145", "92539048", "4.5", "WhatsApp Video 20260825 at 92827 AM 1.mp4", "PT38S"],
  ["e2eae540100f4e86990a121e7c31a3c5", "92539047", "4.5", "WhatsApp Video 20260825 at 92825 AM.mp4", "PT40S"],
  ["3f448013a0d74d7bb7c35a1be04e6cb9", "92539046", "4.5", "WhatsApp Video 20260825 at 92829 AM.mp4", "PT45S"],
].map(([id, build, rate, sourceLabel, duration], index) => ({
  id,
  title: `Modesi reel ${String(index + 1).padStart(2, "0")}`,
  sourceLabel,
  duration,
  poster: `/modesi-jewellery/assets/reels/reel-${String(index + 1).padStart(2, "0")}.jpg`,
  video: `https://cdn.shopify.com/videos/c/vp/${id}/${id}.HD-720p-${rate}Mbps-${build}.mp4`,
}));

export const featuredCollections = [
  {title: "Women Rings", handle: "women-rings", image: "/modesi-jewellery/assets/collections/rings.png"},
  {title: "Earrings", handle: "earrings", image: "/modesi-jewellery/assets/collections/earrings.png"},
  {title: "Women Bracelets", handle: "women-bracelets", image: "/modesi-jewellery/assets/collections/bracelets.webp"},
  {title: "Necklaces", handle: "necklaces", image: "/modesi-jewellery/assets/collections/necklaces.png"},
  {title: "Pendants", handle: "pendants", image: "/modesi-jewellery/assets/collections/pendants.jpg"},
  {title: "Accessories", handle: "accessories", image: "/modesi-jewellery/assets/collections/accessories.webp"},
];

export const catalogueCollections = [
  "1 Gram gold jewellery", "500–1200", "925 Silver Jewellery", "Accessories", "Baby Kadli", "Bangles", "Bestseller", "Between 0–500", "Between 1200–2000", "Brooch", "Coins", "Cufflinks", "Earrings", "Everyday Wear", "Gold Plated Jewellery", "Home page", "Idols", "JHUMKA NAVRATRI COMBO 2026", "Kadas", "Kids Anklets", "Kids Bracelet", "Kids Chain Pendant", "Kids Earrings", "Kids Rings", "Men Bracelets", "Men Chain Pendant", "Men Rings", "Minimal", "Money Clips", "Necklaces", "New Arrivals", "Nose Rings", "Office Wear", "Party Wear", "Payal / Anklets", "Pendants", "Premium Gifts", "Stud Earrings", "Temple Wear", "Tie Pin", "Toe Rings", "Vermeil Jewellery", "Waist Belt / Kandora / Juda", "Wedding Wear", "Women Bracelets", "Women Chain Pendant", "Women Rings",
];

export const megaMenu = [
  {title: "Women", links: ["Earrings", "Women Rings", "Bangles", "Women Bracelets", "Necklaces", "Women Chain Pendant", "Payal / Anklets", "Nose Rings", "Toe Rings", "Waist Belt / Kandora / Juda", "JHUMKA NAVRATRI COMBO 2026"]},
  {title: "Men", links: ["Men Bracelets", "Men Rings", "Stud Earrings", "Kadas", "Men Chain Pendant", "Cufflinks", "Tie Pin", "Money Clips", "Brooch"]},
  {title: "Kids", links: ["Kids Chain Pendant", "Kids Bracelet", "Kids Anklets", "Baby Kadli", "Kids Earrings", "Kids Rings"]},
  {title: "Gifting & décor", links: ["Coins", "Idols", "Pendants", "Premium Gifts"]},
  {title: "Occasion", links: ["Minimal", "Everyday Wear", "Office Wear", "Party Wear", "Temple Wear", "Wedding Wear"]},
];

export const siteClaims = ["Crafted for Daily Use", "Skin Safe Jewellery", "Tarnish Free", "Gold Plated"];
export const servicePromises = [
  {title: "Easy returns", copy: "7-day hassle-free return policy"},
  {title: "24/7 support", copy: "Real-time chat & email support"},
  {title: "Free shipping", copy: "On all prepaid orders above ₹999"},
  {title: "Secure payments", copy: "All major cards & UPI accepted"},
];

export const faqs = [
  {question: "What makes Modesi jewellery unique?", answer: "At Modesi, we believe in timeless design and quiet elegance. Every piece is crafted with minimalism in mind—designed to complement your individuality and everyday style."},
  {question: "Is your jewellery made from real silver?", answer: "The current Modesi store states that its pieces are made from certified 925 sterling silver, prioritising lasting shine, durability and skin-friendly wear."},
  {question: "Do you offer gift packaging or gift cards?", answer: "The current store states that jewellery arrives in ready-to-gift boxes and that Modesi Digital Gift Cards are available."},
  {question: "What is Modesi’s return and exchange policy?", answer: "Exchanges are offered within 7 days of delivery when items are unused and in their original condition. Contact support to start the process."},
  {question: "How do I care for my Modesi jewellery?", answer: "Store pieces in a dry place away from moisture and chemicals. Clean gently with a soft cloth after wear to preserve the finish."},
  {question: "Is Modesi a sustainable brand?", answer: "The current store says it uses recyclable packaging and responsibly sourced materials. Supporting evidence should be added before turning this into a verified product claim."},
];

export const story = {
  intro: "In a world where tradition and trend often live in separate corners, Modesi was born to bring them together — beautifully, unapologetically.",
  body: "Inspired by the intricate artistry of South Asia and the minimalist aesthetics of the West, Modesi creates jewellery that feels just as comfortable on a runway in Milan as it does at a mehendi in Mumbai. It is made for people who switch between languages, cities and styles effortlessly.",
  manifesto: "We are the bridge between bold minimalism and ornate tradition. We believe heritage is not reserved for weddings. It is everyday. We honour the artisan, the innovator and the storyteller. We do not design for trends. We design for truth — your truth, your duality, your depth.",
  founder: "I started MODESI to create the kind of jewellery I could never find — pieces that spoke to both my heritage and my evolving style. MODESI is my answer to that blend: a space where tradition and rebellion sit side by side.",
  founderName: "Devang, Founder",
};

export const contact = {
  phone: "+91 9265293092",
  email: "devang@avinafashionjewellery.com",
  chatEmail: "modesijewellery@gmail.com",
  hours: ["Mon–Sat: 9am–11pm", "Sunday: 11am–5pm"],
  address: "Bldg no 9-R, K Industrial Hub, Kuvadva Wankaner Highway, V. Ranpur, 360003 Rajkot, Gujarat, India",
};

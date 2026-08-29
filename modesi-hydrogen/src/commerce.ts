import {products as fixtureProducts, reels as fixtureReels, type Product, type Reel} from "./data";

export type CommerceSource = {
  mode: "live" | "fixture";
  storeDomain: string;
  label: string;
};

export type Promotion = {
  id: string;
  title: string;
  message: string;
  linkLabel: string;
  linkUrl: string;
  image?: string;
  imageAlt: string;
};

export const fallbackPromotions: Promotion[] = [{
  id: "selected-earrings-offer",
  title: "Selected earrings, half price.",
  message: "Explore the current marked-down piece in the Modesi collection.",
  linkLabel: "Shop the offer",
  linkUrl: "products/earrings-fancy",
  image: "/modesi-jewellery/assets/products/earrings-fancy.png",
  imageAlt: "Gold-tone drop earrings with red and crystal-coloured stones",
}, {
  id: "current-jhumka-edit",
  title: "The Jhumka edit.",
  message: "Discover both current Jhumka designs in the Modesi collection.",
  linkLabel: "View the edit",
  linkUrl: "shop?collection=jhumka-navratri-combo-2026",
  image: "/modesi-jewellery/assets/products/jhumka-01.png",
  imageAlt: "Gold-tone Jhumka earrings with red beads and iridescent stones",
}];

type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  createdAt: string;
  collections: {nodes: {handle: string}[]};
  featuredImage?: {url: string; altText?: string | null};
  variants: {nodes: {id: string; price: {amount: string; currencyCode: string}; compareAtPrice?: {amount: string; currencyCode: string} | null}[]};
  baseMetal?: {value: string} | null;
  platingFinish?: {value: string} | null;
  stone?: {value: string} | null;
  colour?: {value: string} | null;
  style?: {value: string} | null;
  occasion?: {value: string} | null;
  size?: {value: string} | null;
  closure?: {value: string} | null;
};

const domain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || "revenuedesk-dev.myshopify.com").replace(/^https?:\/\//, "").replace(/\/$/, "");
const publicToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || "";
const apiVersion = import.meta.env.VITE_SHOPIFY_API_VERSION || "2026-04";
// Keep the concept isolated from products that already exist in the development
// store even when an environment variable is accidentally omitted.
const productQuery = import.meta.env.VITE_SHOPIFY_PRODUCT_QUERY || "vendor:Modesi";

const CATALOG_QUERY = `query ModesiCatalog($query: String) {
  products(first: 100, sortKey: CREATED_AT, reverse: true, query: $query) {
    nodes {
      id handle title descriptionHtml productType tags availableForSale createdAt
      collections(first: 50) { nodes { handle } }
      featuredImage { url altText }
      variants(first: 10) { nodes { id price { amount currencyCode } compareAtPrice { amount currencyCode } } }
      baseMetal: metafield(namespace: "modesi", key: "base_metal") { value }
      platingFinish: metafield(namespace: "modesi", key: "plating_finish") { value }
      stone: metafield(namespace: "modesi", key: "stone") { value }
      colour: metafield(namespace: "modesi", key: "colour") { value }
      style: metafield(namespace: "modesi", key: "style") { value }
      occasion: metafield(namespace: "modesi", key: "occasion") { value }
      size: metafield(namespace: "modesi", key: "size") { value }
      closure: metafield(namespace: "modesi", key: "closure") { value }
    }
  }
}`;

const REELS_QUERY = `query ModesiReels {
  metaobjects(type: "reel", first: 50) {
    nodes {
      id handle
      fields {
        key value
        reference {
          ... on Video {
            previewImage { url altText }
            sources { url mimeType format height width }
          }
          ... on MediaImage { image { url altText } }
        }
      }
    }
  }
}`;

const PROMOTIONS_QUERY = `query ModesiPromotions {
  metaobjects(type: "announcement", first: 20) {
    nodes {
      id handle
      fields {
        key value
        reference {
          ... on MediaImage { image { url altText } }
        }
      }
    }
  }
}`;

type ReelReference = {
  previewImage?: {url: string; altText?: string | null} | null;
  sources?: {url: string; mimeType?: string | null; format?: string | null; height?: number | null; width?: number | null}[];
  image?: {url: string; altText?: string | null} | null;
};

type ReelMetaobject = {
  id: string;
  handle: string;
  fields: {key: string; value: string; reference?: ReelReference | null}[];
};

type PromotionMetaobject = {
  id: string;
  handle: string;
  fields: {
    key: string;
    value: string;
    reference?: {image?: {url: string; altText?: string | null} | null} | null;
  }[];
};

async function storefrontRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const headers: Record<string, string> = {"Content-Type": "application/json"};
  if (publicToken) headers["X-Shopify-Storefront-Access-Token"] = publicToken;
  const response = await fetch(`https://${domain}/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers,
    body: JSON.stringify({query, variables}),
  });
  if (!response.ok) throw new Error(`Storefront API returned ${response.status}`);
  const payload = await response.json() as {data?: T; errors?: {message: string}[]};
  if (payload.errors?.length || !payload.data) throw new Error(payload.errors?.[0]?.message || "No Storefront API data");
  return payload.data;
}

function mapProduct(node: ShopifyProductNode): Product | null {
  const variant = node.variants.nodes[0];
  if (!variant) return null;
  const fixture = fixtureProducts.find((product) => product.handle === node.handle);
  return {
    id: node.id,
    variantId: variant.id,
    handle: node.handle,
    title: node.title,
    descriptionHtml: node.descriptionHtml,
    price: Number(variant.price.amount),
    compareAt: variant.compareAtPrice ? Number(variant.compareAtPrice.amount) : undefined,
    currencyCode: variant.price.currencyCode,
    image: node.featuredImage?.url || fixture?.image || "",
    category: node.productType || fixture?.category || "Jewellery",
    tags: node.tags,
    collectionHandles: node.collections.nodes.map((collection) => collection.handle),
    availability: node.availableForSale ? "in-stock" : "out-of-stock",
    createdAt: node.createdAt,
    attributes: {
      material: node.baseMetal?.value || fixture?.attributes.material || "Not specified",
      finish: node.platingFinish?.value || fixture?.attributes.finish || "Not specified",
      stone: node.stone?.value || fixture?.attributes.stone || "Not specified",
      colour: node.colour?.value || fixture?.attributes.colour || "Not specified",
      style: node.style?.value || fixture?.attributes.style || "Not specified",
      occasion: node.occasion?.value || fixture?.attributes.occasion || "Not specified",
      size: node.size?.value || fixture?.attributes.size || "Not specified",
      closure: node.closure?.value || fixture?.attributes.closure || "Not specified",
    },
    isNew: node.tags.some((tag) => tag.toLowerCase().includes("new")) || node.collections.nodes.some((collection) => collection.handle === "new-arrivals" || collection.handle === "modesi-new-arrivals"),
    bestseller: node.tags.some((tag) => tag.toLowerCase().includes("best")) || node.collections.nodes.some((collection) => collection.handle === "bestseller" || collection.handle === "modesi-bestseller"),
  };
}

export async function loadProducts(): Promise<{products: Product[]; source: CommerceSource}> {
  try {
    const data = await storefrontRequest<{products: {nodes: ShopifyProductNode[]}}>(CATALOG_QUERY, {query: productQuery});
    const liveProducts = data.products.nodes.map(mapProduct).filter((product): product is Product => Boolean(product));
    if (!liveProducts.length) throw new Error("Store has no published products");
    return {products: liveProducts, source: {mode: "live", storeDomain: domain, label: "Synced from Shopify"}};
  } catch {
    return {products: fixtureProducts, source: {mode: "fixture", storeDomain: domain, label: "Shopify-shaped local data"}};
  }
}

function mapReel(node: ReelMetaobject, index: number): (Reel & {order: number}) | null {
  const fields = Object.fromEntries(node.fields.map((field) => [field.key, field]));
  if (fields.active?.value === "false") return null;
  const videoField = fields.video_file || fields.video || fields.file;
  const sources = videoField?.reference?.sources || [];
  const videoSource = sources.find((source) => source.mimeType === "video/mp4" || source.format?.toLowerCase() === "mp4") || sources[0];
  const directVideo = /^https?:\/\//.test(videoField?.value || "") ? videoField.value : "";
  const video = videoSource?.url || directVideo;
  if (!video) return null;
  const previewField = fields.preview_video || fields.preview;
  const previewSources = previewField?.reference?.sources || [];
  const previewSource = previewSources.find((source) => source.mimeType === "video/mp4" || source.format?.toLowerCase() === "mp4") || previewSources[0];
  const directPreview = /^https?:\/\//.test(previewField?.value || "") ? previewField.value : "";
  const matchingFixture = fixtureReels.find((reel) => video.includes(reel.id));
  const posterField = fields.poster_image || fields.poster;
  const poster = posterField?.reference?.image?.url || videoField?.reference?.previewImage?.url || matchingFixture?.poster || "";
  return {
    id: node.id,
    title: fields.title?.value || node.handle,
    sourceLabel: fields.caption?.value || fields.alt_text?.value || "Modesi reel",
    duration: fields.duration?.value || "",
    poster,
    video,
    preview: previewSource?.url || directPreview || matchingFixture?.preview,
    order: Number(fields.order?.value) || index + 1,
  };
}

export async function loadReels(): Promise<Reel[]> {
  try {
    const data = await storefrontRequest<{metaobjects: {nodes: ReelMetaobject[]}}>(REELS_QUERY);
    const liveReels = data.metaobjects.nodes
      .map(mapReel)
      .filter((reel): reel is Reel & {order: number} => Boolean(reel))
      .sort((a, b) => a.order - b.order)
      .map(({order: _order, ...reel}) => reel);
    return liveReels.length === 6 && liveReels.every((reel) => Boolean(reel.preview)) ? liveReels : fixtureReels;
  } catch {
    return fixtureReels;
  }
}

function parseMetaobjectList(value = "") {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String).map((item) => item.trim().toLowerCase()).filter(Boolean);
  } catch {
    // Shopify list fields are JSON; comma-separated values remain editor-friendly.
  }
  return value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
}

function safePromotionUrl(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const allowedHosts = new Set([domain.toLowerCase(), "modesijewellery.com", "www.modesijewellery.com"]);
      return url.protocol === "https:" && allowedHosts.has(url.hostname.toLowerCase()) ? url.href : "";
    } catch {
      return "";
    }
  }
  if (/^[a-z][a-z\d+.-]*:/i.test(trimmed) || trimmed.startsWith("//")) return "";
  return trimmed;
}

function validCampaignWindow(startValue: string | undefined, endValue: string | undefined, now: number) {
  const start = startValue ? Date.parse(startValue) : null;
  const end = endValue ? Date.parse(endValue) : null;
  if ((startValue && !Number.isFinite(start)) || (endValue && !Number.isFinite(end))) return false;
  if (start !== null && now < start) return false;
  if (end !== null && now >= end) return false;
  return true;
}

export async function loadPromotions(): Promise<Promotion[]> {
  try {
    const data = await storefrontRequest<{metaobjects: {nodes: PromotionMetaobject[]}}>(PROMOTIONS_QUERY);
    const nodes = data.metaobjects.nodes;
    if (!nodes.length) return fallbackPromotions;
    const now = Date.now();
    return nodes
      .map((node) => {
        const fields = Object.fromEntries(node.fields.map((field) => [field.key, field]));
        const pageScopes = parseMetaobjectList(fields.page_scopes?.value || "all");
        if (fields.active?.value === "false") return null;
        if (!pageScopes.includes("all") && !pageScopes.includes("home")) return null;
        if (!validCampaignWindow(fields.starts_at?.value, fields.ends_at?.value, now)) return null;
        const title = fields.title?.value?.trim() || "";
        const message = fields.message?.value?.trim() || "";
        if (!title && !message) return null;
        const imageField = fields.image || fields.poster_image;
        const image = imageField?.reference?.image?.url || "";
        const linkUrl = safePromotionUrl(fields.link_url?.value);
        if (!image || !linkUrl) return null;
        const promotion: Promotion & {priority: number} = {
          id: node.id,
          title: title || message,
          message: title ? message : "",
          linkLabel: fields.link_label?.value?.trim() || "",
          linkUrl,
          imageAlt: imageField?.reference?.image?.altText || `${title || message} offer artwork`,
          priority: fields.priority?.value?.trim() && Number.isFinite(Number(fields.priority.value)) ? Number(fields.priority.value) : 100,
        };
        promotion.image = image;
        return promotion;
      })
      .filter((promotion): promotion is Promotion & {priority: number} => Boolean(promotion))
      .sort((a, b) => a.priority - b.priority)
      .map(({priority: _priority, ...promotion}) => promotion);
  } catch {
    return fallbackPromotions;
  }
}

export async function createShopifyCheckout(lines: {merchandiseId: string; quantity: number}[]) {
  if (import.meta.env.VITE_SHOPIFY_CHECKOUT_MODE !== "live") return null;
  const mutation = `mutation CreateModesiCart($input: CartInput!) {
    cartCreate(input: $input) { cart { id checkoutUrl } userErrors { field message } }
  }`;
  const data = await storefrontRequest<{cartCreate: {cart?: {id: string; checkoutUrl: string}; userErrors: {message: string}[]}}>(mutation, {input: {lines}});
  if (data.cartCreate.userErrors.length || !data.cartCreate.cart) throw new Error(data.cartCreate.userErrors[0]?.message || "Unable to create cart");
  return data.cartCreate.cart;
}

export const hydrogenConfig = {storeDomain: domain, storefrontToken: publicToken, apiVersion};
export const hasHydrogenToken = Boolean(publicToken);

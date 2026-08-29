export type WidgetSlot = "announcement" | "after-hero" | "product-after-buy" | "floating-left" | "floating-right" | "footer";
export type WidgetComponent = "reels" | "reviews" | "newsletter" | "whatsapp" | "social-proof" | "currency" | "track-order" | "announcement";

export type StorefrontWidget = {
  handle: string;
  component: WidgetComponent;
  enabled: boolean;
  placement: WidgetSlot;
  pageScopes: string[];
  priority: number;
  settings: Record<string, string | number | boolean>;
};

// Shopify metaobject-shaped configuration. A merchant can add or move widgets
// without changing layouts; only approved compiled components are accepted.
export const widgetRegistry: StorefrontWidget[] = [
  {handle: "store-announcement", component: "announcement", enabled: true, placement: "announcement", pageScopes: ["all"], priority: 5, settings: {primary: "Complimentary shipping above ₹999", secondary: "7-day exchanges", tertiary: "Made for modern desis everywhere"}},
  {handle: "modesi-reels", component: "reels", enabled: true, placement: "after-hero", pageScopes: ["home"], priority: 10, settings: {autoplay: true, loop: true}},
  {handle: "trustoo-review-slot", component: "reviews", enabled: true, placement: "product-after-buy", pageScopes: ["product"], priority: 20, settings: {provider: "Trustoo", emptyState: true}},
  {handle: "mailing-list", component: "newsletter", enabled: true, placement: "footer", pageScopes: ["all"], priority: 30, settings: {delaySeconds: 8, dismissDays: 1}},
  {handle: "community-interest", component: "social-proof", enabled: true, placement: "floating-left", pageScopes: ["home", "shop", "product"], priority: 40, settings: {truthfulCopy: true, rotateSeconds: 10}},
  {handle: "bucks-currency", component: "currency", enabled: true, placement: "floating-left", pageScopes: ["all"], priority: 50, settings: {currencies: "INR,USD,EUR,GBP,CAD"}},
  {handle: "modesi-concierge", component: "whatsapp", enabled: true, placement: "floating-right", pageScopes: ["all"], priority: 60, settings: {greetingDelaySeconds: 5}},
  {handle: "order-help", component: "track-order", enabled: true, placement: "floating-right", pageScopes: ["all"], priority: 70, settings: {insideConcierge: true}},
];

const allowedComponents = new Set<WidgetComponent>(["reels", "reviews", "newsletter", "whatsapp", "social-proof", "currency", "track-order", "announcement"]);
const allowedSlots = new Set<WidgetSlot>(["announcement", "after-hero", "product-after-buy", "floating-left", "floating-right", "footer"]);

function parseList(value = "") {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Comma-separated values remain convenient in the Shopify editor.
  }
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseSettings(value = "") {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, string | number | boolean> : {};
  } catch {
    return {};
  }
}

export async function loadWidgets() {
  const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || "";
  if (!token) return widgetRegistry;
  const domain = (import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || "").replace(/^https?:\/\//, "").replace(/\/$/, "");
  const version = import.meta.env.VITE_SHOPIFY_API_VERSION || "2026-04";
  if (!domain) return widgetRegistry;
  try {
    const response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: "POST",
      headers: {"Content-Type": "application/json", "X-Shopify-Storefront-Access-Token": token},
      body: JSON.stringify({query: `query ModesiWidgets {
        metaobjects(type: "storefront_widget", first: 50) {
          nodes { handle fields { key value } }
        }
      }`}),
    });
    if (!response.ok) return widgetRegistry;
    const payload = await response.json() as {data?: {metaobjects?: {nodes?: {handle: string; fields: {key: string; value: string}[]}[]}}};
    const remote = (payload.data?.metaobjects?.nodes || []).map((node) => {
      const fields = Object.fromEntries(node.fields.map((field) => [field.key, field.value]));
      const component = fields.component as WidgetComponent;
      const placement = fields.placement as WidgetSlot;
      if (!allowedComponents.has(component) || !allowedSlots.has(placement)) return null;
      return {
        handle: node.handle,
        component,
        enabled: fields.enabled !== "false",
        placement,
        pageScopes: parseList(fields.page_scopes || "all"),
        priority: Number.isFinite(Number(fields.priority)) ? Number(fields.priority) : 100,
        settings: parseSettings(fields.settings),
      } satisfies StorefrontWidget;
    }).filter((widget): widget is StorefrontWidget => Boolean(widget));
    if (remote.length) widgetRegistry.splice(0, widgetRegistry.length, ...remote);
  } catch {
    // The compiled registry remains the resilient fallback.
  }
  return widgetRegistry;
}

export function widgetsFor(page: string, placement?: WidgetSlot) {
  return widgetRegistry
    .filter((widget) => widget.enabled && (widget.pageScopes.includes("all") || widget.pageScopes.includes(page)) && (!placement || widget.placement === placement))
    .sort((a, b) => a.priority - b.priority);
}

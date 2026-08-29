# Modesi Shopify/Hydrogen concept

This source builds the `/modesi-jewellery/` concept inside the existing UI/UX showcase. It uses `@shopify/hydrogen-react`, a framework-neutral Storefront API repository and production-shaped local fallbacks.

## Connection model

- Development-store target: `revenuedesk-dev.myshopify.com`.
- Modesi is isolated from existing sample data with vendor `Modesi` and tag `MODESI_IMPORT`; no existing test products are deleted.
- The Storefront query defaults to `vendor:Modesi` (and can be overridden explicitly), so connecting Headless does not expose the development store's pre-existing products in this concept.
- The `Modesi UI UX Showcase` Headless publication exposes only the three Modesi products and 47 imported collections; the development store's 17 pre-existing products and three pre-existing collections stay outside this publication.
- Products, metafields and six reel metaobjects now load live through the public Storefront API. Cart creation and the Shopify checkout URL were verified, while the public showcase intentionally keeps `VITE_SHOPIFY_CHECKOUT_MODE=demo` so visitors cannot mistake it for a live store.
- `.env.local` contains the browser-safe public Storefront token for local builds and is ignored by Git. Never put a private Admin or Storefront token in `VITE_*` variables.

## Widgets

`src/widgets.ts` is a safe Shopify metaobject adapter with a compiled fallback registry. Once the Headless token is present it reads `storefront_widget` metaobjects automatically, so merchants can enable, order, place and page-scope approved components without a redeploy. Arbitrary script URLs are unsupported. Third-party adapters can map Trustoo, Reelfy, BUCKS or Chatix data into the same slots without changing layouts.

Product filter attributes read the public `modesi.*` product metafields first and fall back to conservative audited fixtures while Shopify is unavailable. Site-wide material or finish language is not assigned to a product unless its product metafield confirms it.

The storefront also reads public `reel` metaobjects. A reel can reference a Shopify Video in `video_file`, an optional MediaImage in `poster_image`, and text fields for `title`, `caption`, `alt_text`, `duration`, `active` and `order`. If the metaobjects are absent or unavailable, the six audited Modesi reel URLs and local posters remain the fallback.

## Seed material

- `seed/modesi-products.csv`: the three exact public product records and canonical images.
- `seed/seed-manifest.json`: six reels, six populated collection rules, all 47 current catalogue names, filter/metafield axes and widget definitions.
- Temporary video uploads are prepared at `/tmp/modesi-shopify-seed/` and are not committed.

## Run and build

```bash
npm install
npm run dev
npm run build
```

The build writes the static-compatible storefront to `../modesi-jewellery/` and creates refresh-safe route folders for the existing Vercel project.

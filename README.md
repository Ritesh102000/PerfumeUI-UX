# UI/UX Website Catalogue

A framework-free catalogue of independent, interactive website concepts for client presentations.

## Structure

- `index.html` - neutral catalogue landing page
- `aureve/` - standalone luxury perfume storefront concept
- `voidstep-skate/` - standalone six-page skate commerce, culture and meme-media concept
- `rf-speciality-foods/` - standalone four-page B2B bakery manufacturing and wholesale concept
- `koshra-gifting/` - standalone premium dry-fruit and corporate-gifting commerce concept
- `nirnay-institute/` - standalone eleven-page Indian coaching institute and student-practice concept
- `wealth-nexus-community/` - standalone faith-led Muslim business brotherhood and membership concept
- `editoverse/` - standalone on-demand video editing service landing page
- `avina-jewellery/` - standalone trilingual B2B jewellery-manufacturing experience
- `modesi-jewellery/` - built output for the Modesi Shopify/Hydrogen-compatible commerce concept
- `modesi-hydrogen/` - source, Shopify adapter, widget registry and seed manifests for Modesi

Every concept owns its HTML, CSS, JavaScript, assets, README and client PDF. A concept can be opened, hosted or handed over without depending on another concept folder.

## Run locally

From the catalogue root:

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`.

## Adding another concept

1. Create a new self-contained subfolder.
2. Keep all of that concept's assets and code inside it.
3. Add its card to the root `index.html`.
4. Include a `README.md` and `output/pdf/` client guide in the concept folder.

All concepts are front-end demonstrations. Modesi reads its isolated products, collections, metafields and reel media live from the connected Shopify development store. Its cart interface, checkout form and other visitor submissions intentionally remain non-transactional in the public showcase, although Storefront cart creation and the Shopify-hosted checkout handoff have been verified. Other checkout, account, email and backend actions are non-production unless stated otherwise.

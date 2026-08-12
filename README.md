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

All concepts are front-end demonstrations. Checkout, account, email and other backend actions are intentionally non-production unless stated otherwise.

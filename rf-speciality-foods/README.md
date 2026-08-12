# RF Speciality Foods - B2B Bakery Website Concept

An independent four-page UI/UX concept for a bakery manufacturer supplying cafés, restaurants, hotels, cloud kitchens, caterers, retailers and distributors. It is intentionally separate from the AURÈVE and VOIDSTEP concepts.

## When to choose this direction

Choose this design for a food manufacturer that needs to feel approachable and appetising while still communicating dependable wholesale supply. It is a strong fit when the website must help a buyer understand the product range, see the operational story, review social proof and start a sample or catalogue conversation.

The soft blue, blush-pink, cream and white palette avoids the cold industrial look common in manufacturing websites. Oversized editorial headlines, asymmetric grids, hard rules, offset shadows and modular information panels create a confident catalogue rhythm. Clean product photography keeps the offer tangible. The result is B2B-first without looking corporate, templated or playful.

## Pages

- `index.html` - home page with product, process, Instagram, about and testimonial previews
- `products.html` - detailed sections for brownies, cheesecakes and cookies, plus supporting product lines
- `about.html` - brand story, manufacturing approach, values and partner types
- `testimonials.html` - a testimonial-system concept with clearly labelled placeholder quotes

## Key UX decisions

- The home page previews every deeper page so a time-poor procurement buyer can understand the offer without opening the full site.
- The same editorial system runs across Home, Products, About and Testimonials: segmented navigation, large type, bordered modules, offset cards, manufacturing rails and bold conversion sections.
- Product sections describe menu use and business fit rather than pretending to publish unconfirmed MOQs, shelf life or logistics specifications.
- Instagram appears once, in the middle of the home page. It uses visible snapshots of three actual public posts in a sharper editorial grid, with every image linking to its original post and a direct profile link below.
- The sample-request drawer is available from every page. It is a front-end demonstration and does not transmit or store data.
- Testimonials are marked as illustrative concept copy until the business supplies approved customer names, roles, logos and quotes.

## Run locally

From the catalogue root:

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/rf-speciality-foods/`.

## Production handoff

Before launch, connect the enquiry forms, replace placeholder testimonial copy with verified approvals, confirm product specifications, add real contact details, add privacy/terms pages and optimise final media. If a live API-powered Instagram feed is required, connect an approved Meta integration and provide its access credentials during production.

Asset credits and generation notes are in `SOURCES.md`. The client-facing design guide is in `output/pdf/rf-speciality-foods-design-guide.pdf`.

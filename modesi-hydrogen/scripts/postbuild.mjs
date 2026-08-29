import {cp, mkdir} from "node:fs/promises";
import {resolve} from "node:path";

const output = resolve(import.meta.dirname, "../../modesi-jewellery");
const routes = [
  "shop",
  "new-arrivals",
  "best-sellers",
  "modesi-story",
  "contact",
  "wishlist",
  "cart",
  "checkout",
  "track-order",
  "products/earrings-fancy",
  "products/jhumka-01",
  "products/jhumka-02",
];

await Promise.all(routes.map(async (route) => {
  const directory = resolve(output, route);
  await mkdir(directory, {recursive: true});
  await cp(resolve(output, "index.html"), resolve(directory, "index.html"));
}));

/**
 * The catalog snapshot, bundled with the app.
 *
 * The data is synthetic: `tools/debrand` rewrites the harvested catalog into
 * invented families, generated copy, and colourway swatches, so nothing here
 * describes anyone's real merchandise. It is bundled rather than fetched
 * because there is no store behind it.
 */
import raw from '../../assets/catalog.json';
import { setSearchCatalog } from './constructor';
import type { Catalog } from './types';

export const catalog = raw as unknown as Catalog;

// Search runs on-device against this same snapshot. Registering it at module
// load keeps the search screen from having to own the wiring, and there is no
// async step to wait for now that nothing is fetched.
setSearchCatalog(catalog);

export const HOME_CATEGORY = 'featured-new-arrivals';

/** The shop tabs, in the order the demo presents them. */
export const SHOP_SECTIONS = [
  { id: 'featured-new-arrivals', label: 'New Arrivals' },
  { id: 'mens-shoes', label: "Men's Shoes" },
  { id: 'womens-shoes', label: "Women's Shoes" },
  { id: 'mens-apparel', label: "Men's Apparel" },
  { id: 'womens-apparel', label: "Women's Apparel" },
  { id: 'featured-best-sellers', label: 'Best Sellers' },
] as const;

/**
 * Pure query helpers over the catalog snapshot.
 *
 * Deliberately free of any React or platform import so both the Expo app and the
 * Exact app can share it verbatim.
 *
 * @ref LLP 0002#facets — Filter vocabulary mirrors the facets Brooks's own PLP
 * exposes (gender, cushion, width, size, color, rating), so the app's filter
 * sheet stays truthful to the merchandising data rather than inventing axes.
 */
import type { Catalog, Colorway, Product } from './types';

export interface Filters {
  gender?: string[];
  productType?: string[];
  cushion?: string[];
  width?: string[];
  size?: string[];
  support?: string[];
  onSale?: boolean;
  minRating?: number;
  maxPrice?: number;
}

export type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'name';

export function productsIn(catalog: Catalog, categoryId: string): Product[] {
  const cat = catalog.categories.find((c) => c.id === categoryId);
  if (cat) {
    const order = new Map(cat.productIds.map((id, i) => [id, i]));
    return catalog.products
      .filter((p) => order.has(p.id))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }
  // Constructor group ids are hierarchical, so a product in
  // `mens-shoes-road-running-shoes` is also in `mens-shoes` and `mens`.
  return catalog.products.filter((p) => p.groups.includes(categoryId));
}

function matchesWidth(p: Product, widths: string[]): boolean {
  return p.colors.some((c) => c.widths.some((w) => widths.includes(w.value) && w.available));
}

function matchesSize(p: Product, sizes: string[]): boolean {
  return p.colors.some((c) => c.sizes.some((s) => sizes.includes(s.value) && s.available));
}

export function applyFilters(products: Product[], f: Filters): Product[] {
  return products.filter((p) => {
    if (f.gender?.length && !(p.gender && f.gender.includes(p.gender))) return false;
    if (f.productType?.length && !f.productType.includes(p.productType)) return false;
    if (f.cushion?.length && !(p.cushion && f.cushion.includes(p.cushion))) return false;
    if (f.support?.length && !(p.support && f.support.includes(p.support))) return false;
    if (f.width?.length && !matchesWidth(p, f.width)) return false;
    if (f.size?.length && !matchesSize(p, f.size)) return false;
    if (f.onSale && !p.onSale) return false;
    if (f.minRating != null && (p.rating ?? 0) < f.minRating) return false;
    if (f.maxPrice != null && (p.price ?? 0) > f.maxPrice) return false;
    return true;
  });
}

export function sortProducts(products: Product[], key: SortKey): Product[] {
  const out = [...products];
  switch (key) {
    case 'price-asc':
      return out.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    case 'price-desc':
      return out.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    case 'rating':
      return out.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case 'name':
      return out.sort((a, b) => a.name.localeCompare(b.name));
    case 'newest':
      return out.sort(
        (a, b) => Number(b.badge === 'New Style') - Number(a.badge === 'New Style')
      );
    default:
      return out;
  }
}

/**
 * Which filter options are actually present in a result set, with counts.
 * Drives the filter sheet so we never offer a filter that yields zero products.
 */
export function facetsFor(products: Product[]) {
  const count = <T extends string>(pick: (p: Product) => T[] | T | null | undefined) => {
    const m = new Map<string, number>();
    for (const p of products) {
      const v = pick(p);
      const vals = Array.isArray(v) ? v : v ? [v] : [];
      for (const x of new Set(vals)) m.set(x, (m.get(x) ?? 0) + 1);
    }
    return [...m.entries()]
      .map(([value, n]) => ({ value, count: n }))
      .sort((a, b) => b.count - a.count);
  };

  return {
    gender: count((p) => p.gender),
    productType: count((p) => p.productType),
    cushion: count((p) => p.cushion),
    support: count((p) => p.support),
    width: count((p) => [
      ...new Set(p.colors.flatMap((c) => c.widths.filter((w) => w.available).map((w) => w.value))),
    ]),
    size: count((p) => [
      ...new Set(p.colors.flatMap((c) => c.sizes.filter((s) => s.available).map((s) => s.value))),
    ]),
  };
}

export function byId(catalog: Catalog, id: string): Product | undefined {
  return catalog.products.find((p) => p.id === id);
}

export function colorwayOf(p: Product, code?: string): Colorway {
  return p.colors.find((c) => c.code === code) ?? p.colors[0];
}

/**
 * Brooks variant ids concatenate style, width, color, and a zero-padded size:
 * style 110498 + width 1D + color 197 + size 9.0 -> "1104981D197.090".
 *
 * @ref LLP 0002#variant-id — Confirmed by round-tripping this id through the real
 * Cart-AddProduct endpoint, which accepted it and returned the matching line item.
 */
export function variantId(
  productId: string,
  width: string,
  colorCode: string,
  size: string
): string {
  const n = Number(size);
  const padded = Number.isFinite(n)
    ? `.${String(Math.round(n * 10)).padStart(3, '0')}`
    : `.${size}`;
  return `${productId}${width}${colorCode}${padded}`;
}

/** Price range across a product's colorways, for tiles that show "$120 – $140". */
export function priceRange(p: Product): { min: number; max: number } {
  const prices = p.colors.map((c) => c.price).filter((x): x is number => x != null);
  if (!prices.length) return { min: p.price ?? 0, max: p.price ?? 0 };
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function formatPrice(value: number | null | undefined): string {
  if (value == null) return '';
  return `$${value.toFixed(2).replace(/\.00$/, '')}`;
}

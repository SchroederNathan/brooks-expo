import { catalog } from '@/data/catalog';
import { byId, colorwayOf } from '@/data/query';
import type { Product } from '@/data/types';
import type { OwnedShoe } from '@/data/mileage';

/** Catalog shoes a runner could own: shoes with at least one colorway. */
export const SHOES = catalog.products.filter((p) => p.productType === 'Shoes' && p.colors.length > 0);

export function productOf(shoe: OwnedShoe): Product | undefined {
  return shoe.productId ? byId(catalog, shoe.productId) : undefined;
}

export function imageOf(shoe: OwnedShoe): string | null {
  const product = productOf(shoe);
  return product ? (colorwayOf(product, shoe.colorCode ?? undefined).images[0]?.url ?? null) : null;
}

/**
 * The model without its version: "Ghost 17" and "Ghost 15" are both "ghost",
 * "Addiction Walker 2" is "addiction walker", and "Brooks Ghost 15", typed in
 * by hand, is "ghost" too. Words after the number ("GTX", "Moana") are edition
 * names and are dropped with it.
 */
export function modelOf(name: string): string {
  return name
    .toLowerCase()
    .replace(/^brooks\s+/, '')
    .replace(/\s+\d+(\.\d+)?\b.*$/, '')
    .trim();
}

/** "Ghost 17" → 17; a model with no number sorts first. */
function version(p: Product): number {
  const n = /\b(\d+)\b/.exec(p.name)?.[1];
  return n ? Number(n) : 0;
}

/**
 * The catalog's newest model in the pair's own line, for the "Shop the
 * Ghost 17" shortcut. Same gender when the pair's is known. Null when the
 * catalog has no shoe in that line.
 *
 * @ref LLP 0006#replacing-a-pair — A runner who liked a pair enough to wear it
 * out most often buys its successor, so the successor is one tap away. The
 * Finder is the other path, for a runner who wants to reconsider.
 */
export function successorOf(shoe: OwnedShoe): Product | null {
  const model = modelOf(productOf(shoe)?.name ?? shoe.name);
  if (!model) return null;
  const gender = productOf(shoe)?.gender;
  const candidates = SHOES.filter(
    (p) =>
      modelOf(p.name) === model &&
      !p.colors.every((c) => c.soldOut) &&
      (!gender || p.gender === gender || p.gender === 'unisex')
  );
  // Newest first; among equals, the plain edition before "Moana" or "GTX".
  return (
    candidates.sort(
      (a, b) => version(b) - version(a) || a.name.length - b.name.length || (b.rating ?? 0) - (a.rating ?? 0)
    )[0] ?? null
  );
}

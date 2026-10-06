import type { Catalog, Product } from '@/data/types';

/**
 * The add-to-bag sheet's "You might also like…" rail: the other half of the
 * kit — apparel under a shoe, shoes under apparel — for the same gender or
 * unisex, with at least one colorway in stock, most-reviewed first.
 *
 * [inferred] The catalog snapshot carries no co-purchase or "complete the look"
 * data (LLP 0002), so review count stands in for popularity. Swap this for
 * real merchandising data if the harvest ever captures it.
 */
export function alsoLike(catalog: Catalog, product: Product, n = 6): Product[] {
  const want = product.productType === 'Shoes' ? 'Apparel' : 'Shoes';
  const anyGender = product.gender == null || product.gender === 'unisex';
  return catalog.products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.productType === want &&
        (anyGender || p.gender === product.gender || p.gender === 'unisex') &&
        p.colors.some((c) => !c.soldOut)
    )
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, n);
}

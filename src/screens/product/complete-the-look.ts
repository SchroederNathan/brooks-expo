import { heroImage } from '@/data/images';
import type { Catalog, Colorway, Gender, Product } from '@/data/types';

/** Where a piece goes on a runner. */
export type LookSlot = 'shoes' | 'top' | 'bottom' | 'socks' | 'layer';

export interface LookPiece {
  slot: LookSlot;
  product: Product;
}

export const SLOT_LABEL: Record<LookSlot, string> = {
  shoes: 'Shoes',
  top: 'Top',
  bottom: 'Bottom',
  socks: 'Socks',
  layer: 'Layer',
};

/** The flat lay has room for three pieces beside the product itself. */
export const LOOK_PIECES = 3;

/** The order a kit reads in, head to toe, with the layer last: it is optional. */
const KIT_ORDER: LookSlot[] = ['shoes', 'top', 'bottom', 'socks', 'layer'];

/**
 * The slot a product fills, from its Constructor groups. Apparel that only
 * sits in sale groups, and accessories other than socks (belts, vests,
 * gloves), have no slot and stay out of a look.
 */
export function slotOf(p: Product): LookSlot | null {
  const groups = p.groups.join(' ');
  // Running kit takes running shoes: the most-reviewed men's shoe is a walker.
  if (p.productType === 'Shoes') return /-shoes-(road-running|trail)-shoes/.test(groups) ? 'shoes' : null;
  if (/-apparel-(tops|sports-bras)/.test(groups)) return 'top';
  if (/-apparel-(bottoms|shorts|tights|pants)/.test(groups)) return 'bottom';
  if (/accessories-socks/.test(groups)) return 'socks';
  if (/-apparel-outerwear/.test(groups)) return 'layer';
  return null;
}

/**
 * "Complete the look" on the PDP: one piece for each slot the product does not
 * fill — a top, a bottom, socks and a layer under a shoe; a shoe and the other
 * apparel slots under apparel. Each piece is the same gender or unisex, has a
 * colorway in stock, and is the most-reviewed candidate, with the product's
 * own franchise first (Ghost socks under a Ghost shoe).
 *
 * @ref LLP 0003#complete-the-look — [inferred] The catalog snapshot carries no
 * co-purchase or merchandised-outfit data (LLP 0002), so review count stands
 * in for popularity. It is the same look for every reader: do not present it
 * as personalized. Swap this for real merchandising data if the harvest ever
 * captures it.
 */
export function completeTheLook(catalog: Catalog, product: Product, n = LOOK_PIECES): LookPiece[] {
  // A walker or a spike has no slot, but its page still never offers a shoe.
  const own = product.productType === 'Shoes' ? 'shoes' : slotOf(product);
  let gender: Gender | null =
    product.gender === 'mens' || product.gender === 'womens' ? product.gender : null;
  const pieces: LookPiece[] = [];

  for (const slot of KIT_ORDER) {
    if (slot === own || pieces.length === n) continue;
    const pick = catalog.products
      .filter(
        (p) =>
          p.id !== product.id &&
          slotOf(p) === slot &&
          (gender == null || p.gender === gender || p.gender === 'unisex') &&
          p.colors.some((c) => !c.soldOut)
      )
      .sort(
        (a, b) =>
          Number(sameFranchise(b, product)) - Number(sameFranchise(a, product)) ||
          b.reviewCount - a.reviewCount
      )[0];
    if (!pick) continue;
    // A unisex anchor (socks) takes its gender from the first gendered pick,
    // so the look does not mix a men's top with women's shorts.
    if (gender == null && (pick.gender === 'mens' || pick.gender === 'womens')) gender = pick.gender;
    pieces.push({ slot, product: pick });
  }
  return pieces;
}

function sameFranchise(a: Product, b: Product) {
  return a.franchise != null && a.franchise === b.franchise;
}

export function priceOf(p: Product, c: Colorway): number | null {
  return c.price ?? p.price;
}

const LAYDOWN = /-\d{3}-lf\d?-/;

/**
 * The colorway a piece shows in the look, and so the one it is sold in.
 *
 * Brooks shoots apparel on a model first (`mf`), on a grey backdrop of its own;
 * a laydown (`lf`) is the garment alone, which is what the flat lay needs.
 * Often only some colorways have one, so take the first in-stock colorway that
 * does, then any in-stock colorway. Shoes have no laydown and take the latter.
 */
export function lookColorway(p: Product): Colorway {
  return (
    p.colors.find((c) => !c.soldOut && c.images.some((i) => LAYDOWN.test(i.url))) ??
    p.colors.find((c) => !c.soldOut) ??
    p.colors[0]
  );
}

export function laydownImage(c: Colorway): string {
  return c.images.find((i) => LAYDOWN.test(i.url))?.url ?? heroImage(c.images);
}

/** Medium when it is in stock, as the PDP defaults it: it is what most people wear. */
export function defaultWidth(c: Colorway): string | null {
  const avail = c.widths.filter((w) => w.available);
  return (avail.find((w) => /1D|1B/.test(w.value)) ?? avail[0])?.value ?? null;
}

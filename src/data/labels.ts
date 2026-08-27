/**
 * Human labels for the raw facet vocabulary the catalog carries.
 *
 * @ref LLP 0003#product-taxonomy — Brooks teaches customers "Neutral vs Support"
 * as the top-level split, and names its support levels Flexible / Balanced /
 * Structured (GuideRails™) / Max. The catalog stores the raw SFCC slugs; these
 * maps translate without inventing vocabulary.
 */

import type { Product } from './types';

export const SUPPORT_LABEL: Record<string, string> = {
  neutral: 'Neutral',
  flexible_support: 'Flexible support',
  balanced_support: 'Balanced support',
  structured_support: 'Structured (GuideRails™)',
  max_support: 'Max support',
};

export const GENDER_LABEL: Record<string, string> = {
  womens: "Women's",
  mens: "Men's",
  unisex: 'Unisex',
};

export const EXPERIENCE_LABEL: Record<string, string> = {
  cushion: 'Cushion',
  speed: 'Speed',
  walking: 'Walking',
  light_trail: 'Light trail',
  mountain_trail: 'Mountain trail',
  speed_trail: 'Speed trail',
};

export function supportLabel(v: string | null | undefined): string | null {
  if (!v) return null;
  return SUPPORT_LABEL[v] ?? v;
}

export function genderLabel(v: string | null | undefined): string | null {
  if (!v) return null;
  return GENDER_LABEL[v] ?? v;
}

export function experienceLabel(v: string | null | undefined): string | null {
  if (!v) return null;
  return EXPERIENCE_LABEL[v] ?? v;
}

/**
 * Activity vocabulary, keyed by the tail of a Constructor group id
 * (`mens-shoes-road-running-shoes` → `road-running-shoes`).
 *
 * @ref LLP 0003#plp-chrome — The site's tile meta line reads
 * `Men's - Road Running, Walking`. Brooks has no activity field on the product
 * record; the activity IS the shop category, so the line is derived from the
 * group ids rather than from `bestFor`, which is marketing copy.
 */
export const ACTIVITY_LABEL: Record<string, string> = {
  'road-running-shoes': 'Road Running',
  'trail-shoes': 'Trail Running',
  'track-spikes': 'Track',
  'treadmill-shoes': 'Treadmill',
  'walking-shoes': 'Walking',
  'hiking-shoes': 'Hiking',
  'lifestyle-shoes': 'Lifestyle',
};

/** Reading order of the meta line, independent of group-id order. */
const ACTIVITY_ORDER = Object.values(ACTIVITY_LABEL);

const GROUP_ACTIVITY = /^(?:mens|womens)-shoes-(.+)$/;

/** e.g. `["Road Running", "Walking"]`. Empty for apparel. */
export function activityLabels(product: Product): string[] {
  const found = new Set<string>();
  for (const g of product.groups) {
    const label = ACTIVITY_LABEL[GROUP_ACTIVITY.exec(g)?.[1] ?? ''];
    if (label) found.add(label);
  }
  return ACTIVITY_ORDER.filter((l) => found.has(l));
}

const WIDTH_ORDER = ['Narrow', 'Medium', 'Wide', 'Extra Wide'];

/**
 * e.g. `["Medium", "Wide"]` — the fitting name only, with the size code
 * (`Medium (1D)`) dropped. Widths that no colorway carries are hidden, unless
 * that would empty the line, in which case the style's full range shows.
 */
export function widthLabels(product: Product): string[] {
  const all = new Set<string>();
  const stocked = new Set<string>();
  for (const c of product.colors) {
    for (const w of c.widths) {
      const name = w.label.replace(/\s*\(.*\)$/, '');
      all.add(name);
      if (w.available) stocked.add(name);
    }
  }
  const pick = stocked.size ? stocked : all;
  return WIDTH_ORDER.filter((w) => pick.has(w));
}

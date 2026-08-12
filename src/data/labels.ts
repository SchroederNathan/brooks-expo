/**
 * Human labels for the raw facet vocabulary the catalog carries.
 *
 * @ref LLP 0003#product-taxonomy — Brooks teaches customers "Neutral vs Support"
 * as the top-level split, and names its support levels Flexible / Balanced /
 * Structured (GuideRails™) / Max. The catalog stores the raw SFCC slugs; these
 * maps translate without inventing vocabulary.
 */

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

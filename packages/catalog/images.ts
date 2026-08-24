/**
 * Swatch helpers for the synthetic catalog.
 *
 * The de-branded catalog carries no photography. Every colorway instead stores
 * the colors it describes, and `tools/debrand` encodes them into the image
 * slots as `swatch:RRGGBB,RRGGBB@frame`. Note the stops carry no leading '#'
 * and the frame is separated by '@': a '#' delimiter collides with the hex
 * colours it is delimiting. Keeping the `images` array — one
 * entry per original photo — means the PDP gallery, its thumbnail rail, and the
 * pagination dots all keep working against real counts rather than being
 * special-cased for a catalog with no pictures.
 *
 * Nothing here touches the network. That is the point: an app with no image
 * host has no third-party image dependency to explain.
 */

export type ImageFit = 'fit' | 'cut';

export interface ImageOpts {
  /** Rendered width in points. Kept for call-site compatibility. */
  width: number;
  height?: number;
  fit?: ImageFit;
  background?: string;
}

/** Neutral ground the swatches sit on, matching the old product-shot backdrop. */
export const SWATCH_BG = '#F8F8F8';

export interface Swatch {
  /** One to three hex stops, in the order the colorway names them. */
  stops: string[];
  /** Which of the colorway's frames this is; frames are composed differently. */
  frame: number;
}

const FALLBACK: Swatch = { stops: [SWATCH_BG], frame: 0 };

/**
 * Parse a `swatch:` URI.
 *
 * Tolerant on purpose: a stale catalog, or one harvested before the de-brand,
 * yields the neutral fallback instead of throwing inside a list renderer.
 */
export function parseSwatch(uri: string): Swatch {
  if (!uri || !uri.startsWith('swatch:')) return FALLBACK;
  const [colors, frame] = uri.slice('swatch:'.length).split('@');
  const stops = colors
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^[0-9A-Fa-f]{6}$/.test(s))
    .map((s) => `#${s}`);
  if (!stops.length) return FALLBACK;
  return { stops, frame: Number.parseInt(frame ?? '0', 10) || 0 };
}

/** True when a url is a swatch rather than something fetchable. */
export function isSwatch(uri: string): boolean {
  return typeof uri === 'string' && uri.startsWith('swatch:');
}

/**
 * The primary color of a colorway — used where a single dot has to stand in for
 * the whole colorway, such as the PDP's colorway selector.
 */
export function primaryStop(uri: string): string {
  return parseSwatch(uri).stops[0] ?? SWATCH_BG;
}

/** Hero frame for a colorway. Frame 0 is the one the harvest listed first. */
export function heroImage(images: { url: string }[]): string {
  return images[0]?.url ?? '';
}

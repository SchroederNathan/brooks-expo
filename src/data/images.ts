/**
 * Brooks image CDN helpers.
 *
 * @ref LLP 0002#image-cdn — Brooks serves product photography from a Demandware
 * Scene7-style CDN that resizes on demand and, unlike the rest of the site, is
 * open to any HTTP client. We store bare URLs and size them here, so a grid
 * thumbnail never downloads a 2500px master. This is the single biggest lever on
 * how fast the app feels on a phone.
 */

export type ImageFit = 'fit' | 'cut';

export interface ImageOpts {
  /** Rendered width in points. Multiply by pixel density at the call site if needed. */
  width: number;
  height?: number;
  fit?: ImageFit;
  /**
   * Brooks shoots on near-white; matching the placeholder to it prevents the
   * flash of grey behind transparent PNG margins.
   */
  background?: string;
}

export const BROOKS_IMAGE_BG = 'F8F8F8';

/**
 * Size a bare Brooks CDN url.
 *
 * Brooks masters are PNGs with transparency; `sfrm=png` keeps the alpha channel
 * so shoes sit on our own background rather than a baked-in one.
 */
export function brooksImage(bareUrl: string, opts: ImageOpts): string {
  if (!bareUrl) return '';
  const base = bareUrl.split('?')[0];
  const { width, height = width, fit = 'fit', background = BROOKS_IMAGE_BG } = opts;
  const q = new URLSearchParams({
    sw: String(Math.round(width)),
    sh: String(Math.round(height)),
    sm: fit,
    sfrm: 'png',
    strip: 'false',
    bgcolor: background,
  });
  return `${base}?${q.toString()}`;
}

/**
 * Brooks encodes the shot angle as a single letter before the slug:
 * `110498-197-{angle}-hyperion-max-4-...`. `l` is the hero side profile.
 */
export const ANGLE_HERO = 'l';

export function angleOf(url: string): string | null {
  const m = url.match(/-(\d{3})-([a-z])-/);
  return m ? m[2] : null;
}

/** Hero shot for a colorway, falling back to whatever the first image is. */
export function heroImage(images: { url: string }[]): string {
  const hero = images.find((i) => angleOf(i.url) === ANGLE_HERO);
  return (hero ?? images[0])?.url ?? '';
}

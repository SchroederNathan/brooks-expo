/**
 * Brooks brand palette.
 *
 * @ref LLP 0003#brand — Every value here was read out of brooksrunning.com's own
 * production stylesheet rather than eyeballed from screenshots.
 *
 * These are deliberately literal hex values, not platform semantic colors: the
 * app reproduces Brooks's light-only brand rendering 1:1 on every platform, so
 * the palette must not adapt per-device or per-scheme.
 */

export const colors = {
  /** Brooks's "black" is a near-black navy. The site never uses pure #000. */
  ink: '#0E131F',
  inkSoft: '#3C4250',
  /** The site's secondary text gray. */
  inkMuted: '#707070',
  inkFaint: '#A0A4AD',

  surface: '#FFFFFF',
  /** Section/page alt background. Brooks shoots product on this exact value. */
  surfaceAlt: '#F8F8F8',
  surfaceSunken: '#F2F2F2',
  /** The site's default border color. */
  hairline: '#E5E5E5',
  /** Stronger rule used by outlined commerce choices and their sold-out slash. */
  controlBorder: '#C9CBCD',

  /** Brooks blue — the default theme accent: links, selected states, focus. */
  blue: '#003789',
  brightBlue: '#016CCF',
  /** Dark-theme background and the Run Club card. */
  navy: '#14295F',

  /**
   * "Brooks lime." Used on eyebrows-on-navy, progress fills, and focus
   * outlines. A spark, never a surface. (The cart badge wore it until the
   * native tab bar's system badge fixed the text color to white — see
   * LLP 0003#icons-and-the-logo.)
   */
  lime: '#ECF000',

  sale: '#D4281C',
  success: '#097B52',

  overlay: 'rgba(14, 19, 31, 0.55)',
  scrim: 'rgba(14, 19, 31, 0.35)',
} as const;

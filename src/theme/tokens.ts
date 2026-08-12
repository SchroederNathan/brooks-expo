/**
 * Brooks design tokens.
 *
 * @ref LLP 0003#brand — Every value here was read out of brooksrunning.com's own
 * production stylesheet rather than eyeballed from screenshots. Two of them are
 * load-bearing and counter-intuitive:
 *
 *  1. `radius.none` is the default. Brooks aggressively zeroes border-radius
 *     sitewide; square corners are a brand trait, and rounding them is the
 *     fastest way to make this look like a generic commerce template.
 *  2. `lime` is a spark, not a brand color. It appears only on the cart badge,
 *     progress fills, and focus states. Using it as a surface would be wrong.
 */

export const color = {
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

  /** Brooks blue — the default theme accent: links, selected states, focus. */
  blue: '#003789',
  brightBlue: '#016CCF',
  /** Dark-theme background and the Run Club card. */
  navy: '#14295F',

  /**
   * "Brooks lime." Used on the cart badge (with blue text), progress fills, and
   * focus outlines. A spark, never a surface.
   */
  lime: '#ECF000',

  sale: '#D4281C',
  success: '#097B52',

  overlay: 'rgba(14, 19, 31, 0.55)',
  scrim: 'rgba(14, 19, 31, 0.35)',
} as const;

export const font = {
  /**
   * Brooks sets everything in Filson Pro, which is licensed and cannot ship in
   * an app bundle. Figtree is the closest geometric-humanist match on Google
   * Fonts and, crucially, has a true 900 Black to carry Brooks's display weight.
   */
  black: 'Figtree_900Black',
  extraBold: 'Figtree_800ExtraBold',
  bold: 'Figtree_700Bold',
  semibold: 'Figtree_600SemiBold',
  medium: 'Figtree_500Medium',
  regular: 'Figtree_400Regular',
  /** The site's handwritten accent face. At most one use per screen. */
  script: 'Caveat_600SemiBold',
} as const;

/**
 * Headlines are sentence case with tight leading — the site sets headings at
 * `line-height: calc(1em + 4px)`. ALL CAPS is reserved for eyebrows, labels,
 * and button text, always with positive tracking.
 */
export const type = {
  hero: { fontFamily: font.black, fontSize: 40, lineHeight: 44, letterSpacing: -0.5 },
  h1: { fontFamily: font.black, fontSize: 30, lineHeight: 34, letterSpacing: -0.4 },
  h2: { fontFamily: font.extraBold, fontSize: 26, lineHeight: 30, letterSpacing: -0.3 },
  h3: { fontFamily: font.extraBold, fontSize: 20, lineHeight: 24, letterSpacing: -0.2 },
  pdpTitle: { fontFamily: font.extraBold, fontSize: 24, lineHeight: 28, letterSpacing: -0.3 },

  eyebrow: {
    fontFamily: font.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: font.bold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },

  productTitle: { fontFamily: font.bold, fontSize: 15, lineHeight: 20 },
  price: { fontFamily: font.bold, fontSize: 16, lineHeight: 22 },
  priceLarge: { fontFamily: font.bold, fontSize: 20, lineHeight: 26 },

  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 24 },
  bodySmall: { fontFamily: font.regular, fontSize: 13, lineHeight: 20 },
  caption: { fontFamily: font.medium, fontSize: 13, lineHeight: 18 },
  tiny: { fontFamily: font.medium, fontSize: 11, lineHeight: 14 },
  script: { fontFamily: font.script, fontSize: 22, lineHeight: 26 },
  /** Countdown / any figure that must not jitter as it ticks. */
  mono: {
    fontFamily: font.bold,
    fontSize: 15,
    lineHeight: 20,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  gutter: 20,
} as const;

/**
 * Square by default. `pill` exists only for dots, badges, and quantity steppers,
 * which the site does render as circles.
 */
export const radius = {
  none: 0,
  sm: 2,
  pill: 999,
} as const;

/**
 * Brooks's buttons use a hard offset shadow on press — a brutalist "pressed
 * sticker" effect, not a soft Material elevation. Reproducing that instead of a
 * blur is most of what makes the buttons feel like Brooks's buttons.
 */
export const shadow = {
  hard: {
    shadowColor: color.ink,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    elevation: 0,
  },
  bar: {
    shadowColor: color.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12,
  },
} as const;

export const motion = {
  fast: 160,
  base: 260,
  slow: 420,
  /** The site's own hero entrance: fade + 40px rise, staggered ~80ms. */
  heroRise: 40,
  heroStagger: 80,
} as const;

/** Brooks Run Club — the membership framing used on login and the cart. */
export const RUN_CLUB_PERKS = [
  'Free standard shipping',
  'Free express shipping over $160',
  'An annual birthday gift',
  'Early access to new shoes and sales',
  'Fun games and prizes',
] as const;

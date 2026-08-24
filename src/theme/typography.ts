/**
 * Type ramp.
 *
 * Archivo (SIL Open Font License) replaces the licensed brand face the demo
 * used to bundle. It is a grotesque with real 800 and 900 cuts, so the five
 * slots below map one-to-one onto the weights the layouts already ask for and
 * no call site had to change.
 *
 * Weight is set via fontFamily names (static font files loaded with expo-font),
 * not fontWeight — the two do not mix reliably on Android.
 */
export const font = {
  black: 'Archivo_900Black',
  extraBold: 'Archivo_800ExtraBold',
  bold: 'Archivo_700Bold',
  medium: 'Archivo_500Medium',
  regular: 'Archivo_400Regular',
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
  option: { fontFamily: font.regular, fontSize: 13, lineHeight: 17 },
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

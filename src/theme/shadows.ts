/**
 * Shadows are CSS boxShadow strings (never legacy shadow/elevation props, per
 * expo-native-ui). Two tokens, both derived from ink #0E131F:
 *
 * - `hard`: Brooks's brutalist "pressed sticker" offset — a hard 4pt shadow
 *   with zero blur. The Button renders its press shadow as an absolutely
 *   positioned View instead (pixel-exact on every platform); this token
 *   documents the brand treatment for any future soft surface that needs it.
 * - `bar`: the sticky bar's upward haze. Converted from the legacy iOS values
 *   (shadowRadius 12 at opacity 0.08, offset 0/-2); on Android this replaces
 *   `elevation: 12`, which could never render an upward offset — the CSS
 *   shadow is truer to the design there.
 */
export const shadows = {
  hard: '4px 4px 0px #0E131F',
  bar: '0px -2px 12px rgba(14, 19, 31, 0.08)',
} as const;

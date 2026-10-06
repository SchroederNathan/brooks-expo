/**
 * Shadows are CSS boxShadow strings (never legacy shadow/elevation props, per
 * expo-native-ui), derived from ink #0E131F:
 *
 * - `hard`: Brooks's brutalist "pressed sticker" offset — a hard 4pt shadow
 *   with zero blur. The Button renders its press shadow as an absolutely
 *   positioned View instead (pixel-exact on every platform); this token
 *   documents the brand treatment for any future soft surface that needs it.
 *
 * The PDP sticky bar's upward `bar` haze was retired with its white panel; the
 * bar is now a fade to white (see the product screen).
 */
export const shadows = {
  hard: '4px 4px 0px #0E131F',
} as const;

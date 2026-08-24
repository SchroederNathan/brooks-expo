/**
 * Demo palette.
 *
 * Deliberately not the palette this app shipped with. The previous values were
 * read out of a real retailer's production stylesheet, and a matching palette is
 * one of the things that makes a replica read as a replica — Apple's 4.1
 * guidance names user interface alongside name and icon. Teal and amber sit far
 * enough from that navy-and-lime pairing to be unmistakable.
 *
 * Literal hex rather than platform semantic colors: the app renders light-only
 * and identically on every platform, so the palette must not adapt per device.
 */

export const colors = {
  /** Near-black with a green cast, to sit under the teal rather than fight it. */
  ink: '#12191A',
  inkSoft: '#3A4547',
  inkMuted: '#6E7A7C',
  inkFaint: '#A2ACAD',

  surface: '#FFFFFF',
  /** Section and page alternate background; also the swatch ground. */
  surfaceAlt: '#F6F7F7',
  surfaceSunken: '#EFF1F1',
  hairline: '#E3E6E6',
  /** Stronger rule for outlined commerce choices and their sold-out slash. */
  controlBorder: '#C6CCCC',

  /** The accent: links, selected states, focus. */
  blue: '#0E5C63',
  brightBlue: '#12A0A8',
  /** Dark surface and the membership card. */
  navy: '#123238',

  /** The spark: eyebrows on dark, progress fills, focus outlines. Never a surface. */
  lime: '#FFB020',

  sale: '#C0392B',
  success: '#0B7A55',

  overlay: 'rgba(18, 25, 26, 0.55)',
  scrim: 'rgba(18, 25, 26, 0.35)',
} as const;

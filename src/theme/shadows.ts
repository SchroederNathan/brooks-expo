import { colors } from './colors';

/**
 * Brooks's buttons use a hard offset shadow on press — a brutalist "pressed
 * sticker" effect, not a soft Material elevation. Reproducing that instead of a
 * blur is most of what makes the buttons feel like Brooks's buttons.
 */
export const shadows = {
  hard: {
    shadowColor: colors.ink,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 4, height: 4 },
    elevation: 0,
  },
  bar: {
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 12,
  },
} as const;

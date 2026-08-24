import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * The row that holds the wordmark and the controls. The site sets its own header
 * row at ~62px; 56 keeps the proportion around a 20pt wordmark without making a
 * native bar feel like a web page in a shell.
 */
export const HEADER_BAR_HEIGHT = 56;

/**
 * Header geometry for the current device.
 *
 * The status-bar inset is part of the header, not a separate strip above it: the
 * blue runs to the top of the screen and the whole block leaves together, so
 * nothing blue is left behind once the header is gone.
 */
export function useHeaderMetrics() {
  const { top } = useSafeAreaInsets();

  return {
    /** Padding above the row, so the wordmark clears the status bar. */
    insetTop: top,
    /** The row itself. */
    barHeight: HEADER_BAR_HEIGHT,
    /**
     * The whole block: what content must clear to start below the header, and
     * the distance the header travels to hide. Every interpolation range in this
     * module is exactly this long.
     */
    headerHeight: top + HEADER_BAR_HEIGHT,
  };
}

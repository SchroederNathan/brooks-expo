import {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { motion } from '@/theme';

import type { HeaderScrollState } from './use-header-scroll';

/**
 * The collapse itself, separated from the bar that wears it.
 *
 * @ref LLP 0003#the-header-collapses-on-scroll — Two regimes, ported from the
 * `instagram-header-on-scroll-animation` study:
 *
 * - **Near the top** the bar is a direct function of scroll offset, so it
 *   peels away with the finger and comes back with it.
 * - **Deeper in** offset is meaningless as an absolute, so the bar hides
 *   against the anchor the drag *started* at, and an upward flick reveals it
 *   outright on a timing animation instead. Whether a lift was a flick is decided
 *   once, in `useHeaderScroll`, and published as `revealRequest`.
 *
 * The regimes cannot both own the bar, so `skipTopInterpolation` hands control
 * to the flick until the reader is genuinely back at the top. Without it, a
 * flick-reveal at offset 200 is immediately overwritten by the near-top formula,
 * which says "offset 200, therefore hidden".
 *
 * [observed 2026-08-26] This used to live inside `BrooksHeader`'s one animated
 * style. Browse's search field collapses on the same two regimes but composes
 * the result with a second motion (the field rising over the title on focus),
 * so the regimes had to be a hook that publishes two shared values rather than a
 * style that owns them. The blue header reads the same two values.
 */

/** Where "near the top" ends. Three travel-heights of runway before the anchor regime. */
const TOP_ZONE_MULTIPLE = 3;
/**
 * The block fades as it leaves, finishing at 75% of the travel. Fading is what
 * keeps a half-open bar from reading as a sliced wordmark: by the time it is
 * half way out it is already mostly gone.
 */
const FADE_AT = 0.75;

export function useCollapse(state: HeaderScrollState): {
  /** 0 fully shown, -travel fully hidden. The same value as `state.headerTop`. */
  translateY: SharedValue<number>;
  /** 1 fully shown, 0 gone — a shorter curve than `translateY` (see FADE_AT). */
  opacity: SharedValue<number>;
} {
  const {
    headerHeight: travel,
    headerTop,
    isBarVisible,
    offsetY,
    offsetYAnchorOnBeginDrag,
    reduceMotion,
    revealRequest,
  } = state;

  // Opacity is its own value rather than a function of headerTop: the two curves
  // have different lengths (see FADE_AT), so one cannot be derived from the other.
  const opacity = useSharedValue(1);
  const skipTopInterpolation = useSharedValue(false);

  const isTopOfList = useDerivedValue(() => offsetY.get() < travel * TOP_ZONE_MULTIPLE, [travel]);

  useAnimatedReaction(
    () => ({
      offset: offsetY.get(),
      reveal: revealRequest.get(),
      anchor: offsetYAnchorOnBeginDrag.get(),
      visible: isBarVisible.get(),
      top: isTopOfList.get(),
    }),
    ({ offset, reveal, anchor, visible, top }) => {
      if (reduceMotion) {
        headerTop.set(0);
        opacity.set(1);
        return;
      }

      // Back at the very top: the flick regime has nothing left to protect.
      if (offset <= 0 && skipTopInterpolation.get()) {
        skipTopInterpolation.set(false);
      }

      if (top && !skipTopInterpolation.get()) {
        headerTop.set(interpolate(offset, [0, travel], [0, -travel], Extrapolation.CLAMP));
        opacity.set(interpolate(offset, [0, travel * FADE_AT], [1, 0], Extrapolation.CLAMP));
      }

      if (!top) {
        if (!visible && reveal) {
          headerTop.set(withTiming(0, { duration: motion.fast }));
          opacity.set(withTiming(1, { duration: motion.fast }));
          skipTopInterpolation.set(true); // Keep the near-top formula from undoing it.
        }

        if (visible && !reveal) {
          headerTop.set(
            interpolate(offset, [anchor, anchor + travel], [0, -travel], Extrapolation.CLAMP)
          );
          opacity.set(
            interpolate(offset, [anchor, anchor + travel * FADE_AT], [1, 0], Extrapolation.CLAMP)
          );
        }
      }
    },
    [travel, reduceMotion]
  );

  return { translateY: headerTop, opacity };
}

import { useMemo } from 'react';
import {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  type DerivedValue,
  type SharedValue,
} from 'react-native-reanimated';
import type Animated from 'react-native-reanimated';

import { useHeaderMetrics } from './metrics';
import { useScrollDirection, type ScrollDirection, type ScrollWorklets } from './scroll-direction';

/**
 * How far the row must have travelled before an end-of-drag is treated as
 * mid-flight and worth snapping. Two points of slop keeps a bar that is already
 * parked from being nudged by a rounding error.
 */
const SNAP_SLOP = 2;
/**
 * Lift velocity above which the snap stands down, in points per millisecond.
 *
 * `scrollTo` cancels iOS's deceleration, so snapping into a fling replaces the
 * reader's flick with a ~header-height scroll — the content visibly stops short,
 * and the to-top branch yanks it backwards. Above this threshold, momentum will
 * carry the offset far enough to resolve the header on its own, and the snap has
 * nothing to fix; below it, the deceleration left to cancel is a few tens of
 * points and imperceptible.
 */
const SNAP_MAX_VELOCITY = 0.2;
/**
 * Lift velocity that counts as a flick rather than a scroll, in points per
 * millisecond. Below it, an upward drag does not reveal a hidden header —
 * without the split the header flickers on every gentle scroll.
 */
const FLICK_VELOCITY = 1.25;

/** Everything the header needs to draw itself, plus the plumbing a screen needs. */
export type HeaderScrollState = {
  /** The header's own height, which is also how far it travels to hide. */
  headerHeight: number;
  /** Header offset: 0 fully shown, -headerHeight fully hidden. */
  headerTop: SharedValue<number>;
  /** True while any part of the header is still on screen. */
  isBarVisible: DerivedValue<boolean>;
  offsetY: SharedValue<number>;
  /**
   * Set at the moment the finger leaves the glass, when the lift was an upward
   * flick; cleared when the next drag begins.
   *
   * Deciding this once per gesture rather than re-reading velocity every frame is
   * a deviation from the study, and it fixes a real artifact: the study's
   * `velocityOnEndDrag` outlives its gesture, so any later direction flip during
   * deceleration — the rubber-band at the end of a list, an overshoot settling
   * back — still read as a flick and slammed the header open with no finger on
   * the screen.
   */
  revealRequest: SharedValue<boolean>;
  scrollDirection: SharedValue<ScrollDirection>;
  offsetYAnchorOnBeginDrag: SharedValue<number>;
  reduceMotion: boolean;
};

/**
 * Scroll state for a collapsing header, owned on the UI thread.
 *
 * @ref LLP 0003#the-header-collapses-on-scroll — The behaviour is ported from
 * the `instagram-header-on-scroll-animation` study in rn-makeitanimated. Two
 * deviations from the original are deliberate:
 *
 * 1. The original snapped the list with `scheduleOnRN` + an imperative
 *    `scrollToOffset`, then blocked touches for a 300ms `setTimeout` so the
 *    programmatic scroll could not be interrupted. Reanimated's `scrollTo`
 *    does the same thing from the worklet, so the snap never crosses to the JS
 *    thread and there is no window to guard: an interrupted snap is just a new
 *    drag, which is what a reader expects anyway.
 * 2. Reduced-motion callers get the bar pinned open rather than a shorter
 *    animation. A header that vanishes is a layout change, not decoration.
 */
export function useHeaderScroll() {
  const { headerHeight } = useHeaderMetrics();
  const reduceMotion = useReducedMotion();

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const offsetY = useSharedValue(0);
  const headerTop = useSharedValue(0);
  const revealRequest = useSharedValue(false);

  const isBarVisible = useDerivedValue(
    () => Math.abs(headerTop.get()) < headerHeight,
    [headerHeight]
  );

  const { scrollDirection, offsetYAnchorOnBeginDrag, onBeginDrag, onScroll } = useScrollDirection();

  const handlers: ScrollWorklets = useMemo(
    () => ({
      onBeginDrag: (event) => {
        'worklet';
        revealRequest.set(false);
        onBeginDrag(event);
      },
      onScroll: (event) => {
        'worklet';
        offsetY.set(event.contentOffset.y);
        onScroll(event);
      },
      onEndDrag: (event) => {
        'worklet';
        if (reduceMotion) return;

        const velocity = Math.abs(event.velocity?.y ?? 0);
        if (scrollDirection.get() === 'to-top' && velocity > FLICK_VELOCITY) {
          revealRequest.set(true);
        }

        // The snap resolves a header the reader *parked* half-open. A list still
        // travelling resolves itself, so leave the fling alone.
        if (velocity > SNAP_MAX_VELOCITY) return;

        // Snap a half-hidden header to whichever end it was heading for, by
        // scrolling the content the remaining distance rather than animating
        // the header: its position is a function of scroll offset, so moving the
        // offset is the only way to leave the two in agreement.
        const travelled = Math.abs(headerTop.get());
        const midFlight = travelled >= SNAP_SLOP && travelled < headerHeight - SNAP_SLOP;
        if (!midFlight) return;

        if (scrollDirection.get() === 'to-bottom') {
          scrollTo(
            scrollRef,
            0,
            event.contentOffset.y + (headerHeight - travelled + SNAP_SLOP),
            true
          );
        }
        if (scrollDirection.get() === 'to-top') {
          scrollTo(scrollRef, 0, event.contentOffset.y - headerHeight - SNAP_SLOP, true);
        }
      },
    }),
    [
      headerHeight,
      headerTop,
      offsetY,
      onBeginDrag,
      onScroll,
      reduceMotion,
      revealRequest,
      scrollDirection,
      scrollRef,
    ]
  );

  const onScrollHandler = useAnimatedScrollHandler(handlers, [handlers]);

  const state: HeaderScrollState = {
    headerHeight,
    headerTop,
    isBarVisible,
    offsetY,
    revealRequest,
    scrollDirection,
    offsetYAnchorOnBeginDrag,
    reduceMotion,
  };

  return {
    state,
    headerHeight,
    scrollRef,
    /** The three worklets, for a container that already owns a scroll handler. */
    handlers,
    /**
     * Spread onto an `Animated.ScrollView` / `Animated.FlatList`. The native
     * inset adjustment is off because the header is app-drawn: the safe area is
     * already inside `headerHeight`, and letting UIKit add it again would pad
     * the content twice.
     */
    scrollProps: {
      ref: scrollRef,
      onScroll: onScrollHandler,
      scrollEventThrottle: 16,
      contentInsetAdjustmentBehavior: 'never' as const,
    },
  };
}

import { router, useIsFocused } from 'expo-router';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Press } from '@/components/press';
import { BrooksWordmark } from '@/screens/home/wordmark';
import { colors, motion, spacing } from '@/theme';

import { HeaderActions, type HeaderAction } from './actions';
import { useHeaderMetrics } from './metrics';
import type { HeaderScrollState } from './use-header-scroll';

/**
 * The Brooks header: blue bar, wordmark left, screen-chosen controls right.
 *
 * @ref LLP 0003#the-header-collapses-on-scroll — Both the bar and its collapse
 * are ports. The chrome is brooksrunning.com's own sticky header (flat
 * `#003789`, white wordmark, trailing sprite glyphs). The motion is the
 * `instagram-header-on-scroll-animation` study from rn-makeitanimated, which
 * splits into two regimes:
 *
 * - **Near the top** the header is a direct function of scroll offset, so it
 *   peels away with the finger and comes back with it.
 * - **Deeper in** offset is meaningless as an absolute, so the header hides
 *   against the anchor the drag *started* at, and an upward flick reveals it
 *   outright on a timing animation instead. Whether a lift was a flick is decided
 *   once, in `useHeaderScroll`, and published as `revealRequest` — see the note
 *   there for why re-reading velocity per frame was wrong.
 *
 * The regimes cannot both own the header, so `skipTopInterpolation` hands
 * control to the flick until the reader is genuinely back at the top. Without
 * it, a flick-reveal at offset 200 is immediately overwritten by the near-top
 * formula, which says "offset 200, therefore hidden".
 *
 * The block is full-bleed: the status-bar inset is padding inside the header
 * rather than a strip that stays behind, so a minimized header leaves no blue
 * anywhere and the wordmark is never clipped against a band above it.
 */

/** Where "near the top" ends. Three header heights of runway before the anchor regime. */
const TOP_ZONE_MULTIPLE = 3;
/**
 * The whole block fades as it leaves, finishing at 75% of the travel. Fading is
 * what keeps a half-open header from reading as a sliced wordmark: by the time
 * it is half way out it is already mostly gone.
 */
const FADE_AT = 0.75;

type Props = {
  /**
   * Trailing controls, in order. The site's own set is the default; Home, the
   * one screen that mounts this header, asks for `search` alone.
   */
  actions?: readonly HeaderAction[];
  /** Scroll state from `useHeaderScroll`. */
  state: HeaderScrollState;
  /** Defaults to going home, which is what the site's logo does. */
  onLogoPress?: () => void;
  /**
   * Status-bar style once the header is gone and the screen's own content is
   * behind the clock. Defaults to `dark`, for the white pages that are the
   * common case; a screen whose upper content is dark passes `light`.
   */
  hiddenStatusBarStyle?: StatusBarStyle;
};

export function BrooksHeader({
  actions = ['search', 'account', 'cart', 'menu'],
  state,
  onLogoPress,
  hiddenStatusBarStyle = 'dark',
}: Props) {
  const { insetTop, barHeight } = useHeaderMetrics();
  const {
    headerHeight,
    headerTop,
    isBarVisible,
    offsetY,
    offsetYAnchorOnBeginDrag,
    reduceMotion,
    revealRequest,
  } = state;

  // Opacity is its own value rather than a function of headerTop: the two curves
  // have different lengths (see FADE_AT), so one cannot be derived from the other.
  const headerOpacity = useSharedValue(1);
  const skipTopInterpolation = useSharedValue(false);
  const [gone, setGone] = useState(false);
  // Tab screens stay mounted when they lose focus, and React Native resolves the
  // status bar from the *last mounted* entry rather than the visible one. So an
  // unfocused screen must withdraw its entry, or the bar reports whichever tab
  // happened to mount most recently.
  const focused = useIsFocused();

  const isTopOfList = useDerivedValue(
    () => offsetY.get() < headerHeight * TOP_ZONE_MULTIPLE,
    [headerHeight]
  );
  // One style function, not the reference's two: position and opacity read the
  // same inputs and branch identically, so evaluating the branches twice per
  // frame only invited the two to disagree.
  const headerStyle = useAnimatedStyle(() => {
    if (reduceMotion) {
      return { transform: [{ translateY: 0 }], opacity: 1, pointerEvents: 'auto' as const };
    }

    // Back at the very top: the flick regime has nothing left to protect.
    if (offsetY.get() <= 0 && skipTopInterpolation.get()) {
      skipTopInterpolation.set(false);
    }

    if (isTopOfList.get() && !skipTopInterpolation.get()) {
      headerTop.set(
        interpolate(offsetY.get(), [0, headerHeight], [0, -headerHeight], Extrapolation.CLAMP)
      );
      headerOpacity.set(
        interpolate(offsetY.get(), [0, headerHeight * FADE_AT], [1, 0], Extrapolation.CLAMP)
      );
    }

    if (!isTopOfList.get()) {
      if (!isBarVisible.get() && revealRequest.get()) {
        headerTop.set(withTiming(0, { duration: motion.fast }));
        headerOpacity.set(withTiming(1, { duration: motion.fast }));
        skipTopInterpolation.set(true); // Keep the near-top formula from undoing it.
      }

      if (isBarVisible.get() && !revealRequest.get()) {
        const anchor = offsetYAnchorOnBeginDrag.get();
        headerTop.set(
          interpolate(
            offsetY.get(),
            [anchor, anchor + headerHeight],
            [0, -headerHeight],
            Extrapolation.CLAMP
          )
        );
        headerOpacity.set(
          interpolate(
            offsetY.get(),
            [anchor, anchor + headerHeight * FADE_AT],
            [1, 0],
            Extrapolation.CLAMP
          )
        );
      }
    }

    return {
      // translateY, not `top`: the header moves every frame, and a transform
      // keeps it out of the layout pass entirely.
      transform: [{ translateY: headerTop.get() }],
      opacity: headerOpacity.get(),
      // A faded-out header still covers the top of the content, so it has to
      // stop taking touches as well as stop being visible.
      pointerEvents: headerOpacity.get() > 0.02 ? ('auto' as const) : ('none' as const),
    };
  }, [headerHeight, reduceMotion]);

  // The clock sits on Brooks blue while the header is up and on the screen's own
  // content once it is gone, so the status-bar style has to follow the header.
  // This is the one place the animation touches the JS thread, and only on a
  // crossing — not per frame.
  useAnimatedReaction(
    () => headerOpacity.get() < 0.5,
    (isGone, wasGone) => {
      if (wasGone !== null && isGone !== wasGone) scheduleOnRN(setGone, isGone);
    }
  );

  return (
    <>
      {focused && <StatusBar style={gone ? hiddenStatusBarStyle : 'light'} animated />}
      <Animated.View
        style={[
          styles.header,
          { height: headerHeight, paddingTop: insetTop },
          headerStyle,
        ]}
      >
        <Animated.View style={[styles.row, { height: barHeight }]}>
          <Press
            accessibilityRole="button"
            accessibilityLabel="Brooks home"
            onPress={onLogoPress ?? (() => router.navigate('/'))}
            hitSlop={{ top: 12, bottom: 12, left: 4, right: 12 }}
          >
            <BrooksWordmark width={108} color={colors.surface} />
          </Press>
          <HeaderActions actions={actions} />
        </Animated.View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    zIndex: 40,
    backgroundColor: colors.blue,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
  },
});

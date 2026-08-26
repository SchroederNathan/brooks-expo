import { router, useIsFocused } from 'expo-router';
import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Press } from '@/components/press';
import { BrooksWordmark } from '@/screens/home/wordmark';
import { colors, spacing } from '@/theme';

import { HeaderActions, type HeaderAction } from './actions';
import { useHeaderMetrics } from './metrics';
import { useCollapse } from './use-collapse';
import type { HeaderScrollState } from './use-header-scroll';

/**
 * The Brooks header: blue bar, wordmark left, screen-chosen controls right.
 *
 * @ref LLP 0003#the-header-collapses-on-scroll — Both the bar and its collapse
 * are ports. The chrome is brooksrunning.com's own sticky header (flat
 * `#003789`, white wordmark, trailing sprite glyphs). The motion is the
 * `instagram-header-on-scroll-animation` study from rn-makeitanimated; it lives
 * in `useCollapse`, which publishes the bar's offset and opacity, because Browse's
 * search row collapses on the same rules and composes them with a second motion.
 *
 * The block is full-bleed: the status-bar inset is padding inside the header
 * rather than a strip that stays behind, so a minimized header leaves no blue
 * anywhere and the wordmark is never clipped against a band above it.
 */

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
  const { headerHeight } = state;
  const { translateY, opacity } = useCollapse(state);
  const [gone, setGone] = useState(false);
  // Tab screens stay mounted when they lose focus, and React Native resolves the
  // status bar from the *last mounted* entry rather than the visible one. So an
  // unfocused screen must withdraw its entry, or the bar reports whichever tab
  // happened to mount most recently.
  const focused = useIsFocused();

  const headerStyle = useAnimatedStyle(() => ({
    // translateY, not `top`: the header moves every frame, and a transform
    // keeps it out of the layout pass entirely.
    transform: [{ translateY: translateY.get() }],
    opacity: opacity.get(),
    // A faded-out header still covers the top of the content, so it has to
    // stop taking touches as well as stop being visible.
    pointerEvents: opacity.get() > 0.02 ? ('auto' as const) : ('none' as const),
  }));

  // The clock sits on Brooks blue while the header is up and on the screen's own
  // content once it is gone, so the status-bar style has to follow the header.
  // This is the one place the animation touches the JS thread, and only on a
  // crossing — not per frame.
  useAnimatedReaction(
    () => opacity.get() < 0.5,
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

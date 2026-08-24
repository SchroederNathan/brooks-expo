import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { BrandMark } from '@/screens/home/wordmark';

import { colors, motion } from '../theme';

/**
 * The animated splash.
 *
 * This used to play a Lottie file exported from a real retailer's own logo
 * animation. That asset was theirs, so the whole thing is now drawn in-app: the
 * mark rises and settles, holds briefly, then the layer fades out to reveal the
 * app already rendered beneath it.
 *
 * Reanimated rather than Lottie because there is no longer an animation file to
 * play, and one fewer bundled asset is one fewer thing to license. The white
 * ground matches the native splash (`app.json` splash.backgroundColor) so the
 * handoff has no seam.
 */
export function AnimatedSplash() {
  const progress = useSharedValue(0);
  const done = useSharedValue(false);
  const opacity = useSharedValue(1);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: motion.slow,
      easing: Easing.out(Easing.cubic),
    });
    // Hold on the settled mark, then let the exit animation take over.
    opacity.value = withDelay(
      motion.slow + 240,
      withTiming(0, { duration: motion.base }, (finished) => {
        if (finished) done.value = true;
      }),
    );
  }, [progress, opacity, done]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }, { scale: 0.96 + progress.value * 0.04 }],
  }));

  const rootStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    // Stop swallowing touches the moment the layer is invisible, rather than
    // waiting for the unmount, so the first tap after the splash always lands.
    pointerEvents: opacity.value === 0 ? 'none' : 'auto',
  }));

  return (
    <Animated.View
      exiting={FadeOut.duration(motion.fast)}
      style={[StyleSheet.absoluteFill, styles.root, rootStyle]}
    >
      <Animated.View style={markStyle}>
        <BrandMark width={168} color={colors.ink} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

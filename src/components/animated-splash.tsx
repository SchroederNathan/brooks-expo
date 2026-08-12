import LottieView from 'lottie-react-native';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

import { colors, motion } from '../theme';

/**
 * The animated splash: plays assets/lottie/brooks-splash.json once over the
 * whole screen — the BROOKS wordmark collapses into the chevron, which sweeps
 * off — then fades itself out to reveal the app already rendered beneath it.
 * The animation draws on white; the container and the native splash
 * (app.json splash.backgroundColor) match it so the handoff has no seam.
 */
export function AnimatedSplash() {
  const [finished, setFinished] = useState(false);

  if (finished) return null;

  return (
    <Animated.View
      exiting={FadeOut.duration(motion.base)}
      style={[StyleSheet.absoluteFill, styles.root]}
      pointerEvents="auto"
    >
      <LottieView
        source={require('../../assets/lottie/brooks-splash.json')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        autoPlay
        loop={false}
        onAnimationFinish={() => setFinished(true)}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.surface, zIndex: 10 },
});

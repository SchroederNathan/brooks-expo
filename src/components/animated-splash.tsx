import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  FadeOut,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { colors, motion } from '../theme';

/**
 * The animated splash: the Brooks chevron sits centred, eases down to 70%,
 * then swells and sweeps to the bottom right until the screen is the white of
 * its notch — then the splash fades itself out to reveal the app already
 * rendered beneath it. The animation draws on white; the container and the
 * native splash (the expo-splash-screen plugin's backgroundColor in app.json)
 * match it so the handoff has no seam. On Android the native splash also shows
 * the chevron at this first frame's size.
 *
 * This is a frame-for-frame port of the Jitter-exported Lottie the splash used
 * to play (402×874 composition, 60 frames at 60 fps; it was
 * assets/lottie/brooks-splash.json, in git history). One playhead drives a
 * single SVG matrix, so the vector is redrawn at every scale rather than a
 * bitmap being blown up 100×.
 * @ref LLP 0000#splash-animation — why the splash no longer uses Lottie
 */
export function AnimatedSplash() {
  const [finished, setFinished] = useState(false);
  const frame = useSharedValue(0);

  useEffect(() => {
    frame.value = withTiming(
      FRAMES,
      { duration: (FRAMES / FPS) * 1000, easing: Easing.linear },
      (done) => {
        if (done) scheduleOnRN(setFinished, true);
      },
    );
  }, [frame]);

  const chevronProps = useAnimatedProps(() => ({
    matrix: chevronMatrix(frame.value),
  }));

  if (finished) return null;

  return (
    <Animated.View
      exiting={FadeOut.duration(motion.base)}
      style={[StyleSheet.absoluteFill, styles.root]}
      pointerEvents="auto"
    >
      {/* `slice` is Lottie's `resizeMode="cover"`: fill the screen, centred. */}
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${COMP_WIDTH} ${COMP_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <AnimatedG animatedProps={chevronProps}>
          <Path d={CHEVRON} fill={CHEVRON_FILL} />
        </AnimatedG>
      </Svg>
    </Animated.View>
  );
}

// `matrix` is react-native-svg's native transform prop. Animated props skip
// the JS `transform` parsing, so the worklet writes the matrix directly.
const AnimatedG = Animated.createAnimatedComponent(
  G as React.ComponentType<React.ComponentProps<typeof G> & { matrix?: number[] }>,
);

const COMP_WIDTH = 402;
const COMP_HEIGHT = 874;
const FPS = 60;
const FRAMES = 60;

/** The Lottie's fill, rgb(0, 0.22, 0.54) — a hair off `colors.blue`. */
const CHEVRON_FILL = '#00388A';

/** The chevron outline, in the Lottie shape layer's own coordinates. */
const CHEVRON =
  'M420.93 0.16C432.23 -0.44 452.8 0.82 464.6 1.34C494.23 2.66 523.84 4.41 553.42 6.55C722.5 18.07 890.38 43.2 1055.41 81.74C1144.12 103.04 1514.71 202.59 1555.5 269.91C1558.09 274.19 1559.67 279.11 1558.39 284.1C1556.21 292.55 1547.46 297.28 1539.82 300C1520.62 306.84 1497.32 306.67 1477.07 308.39C1455.07 310.18 1433.09 312.21 1411.14 314.5C1089.93 347.68 771.87 433.19 494.41 602.3C481.71 610.03 469.14 617.94 456.69 626.06C435.73 639.62 404.22 657.85 378.2 657.78C297.27 657.57 214.63 627.62 138.41 602.45C90.83 586.74 -28.35 527.24 6.18 472.41C80.29 354.74 512.96 314.9 685.43 297.52C756.57 290.35 940.66 279.79 996.61 243.86C1002.79 239.9 1009.48 234.19 1010.99 226.65C1012.06 221.27 1010.26 216.08 1007.3 211.61C997.08 196.21 972.21 182.83 956.3 173.69C881.24 130.58 796.21 101.27 713.82 75.61C617.42 45.91 519.68 20.74 420.93 0.16Z';

/**
 * The Lottie's layer chain, flattened. The shape layer scales the outline
 * 133.33%; a null scales that 3.9% × 3.87% (not quite uniform); the animated
 * null pins it at anchor (40.5, 17) — the chevron's centre — and moves and
 * scales it on the keyframes below.
 */
const SHAPE_SCALE = 1.3333;
const NULL_SCALE_X = 0.039;
const NULL_SCALE_Y = 0.0387;
const ANCHOR_X = 40.5;
const ANCHOR_Y = 17;

/** Keyframes on the animated null. Both segments ease cubic-bezier(.5, 0, 0, 1). */
const KEY_FRAMES = [0, 30, 60];
const KEY_SCALE = [100, 70, 10000];
const KEY_X = [201.5, 201.5, 579.5];
const KEY_Y = [437, 437, 1201];

/** The chevron's transform at `frame`, as an SVG matrix [a, b, c, d, e, f]. */
function chevronMatrix(frame: number): number[] {
  'worklet';
  const segment = frame < KEY_FRAMES[1] ? 0 : 1;
  const start = KEY_FRAMES[segment];
  const length = KEY_FRAMES[segment + 1] - start;
  const progress = Math.min(Math.max((frame - start) / length, 0), 1);
  const eased = Easing.bezierFn(0.5, 0, 0, 1)(progress);
  const lerp = (keys: number[]) =>
    keys[segment] + (keys[segment + 1] - keys[segment]) * eased;

  const scale = lerp(KEY_SCALE) / 100;
  return [
    scale * NULL_SCALE_X * SHAPE_SCALE,
    0,
    0,
    scale * NULL_SCALE_Y * SHAPE_SCALE,
    lerp(KEY_X) - scale * ANCHOR_X,
    lerp(KEY_Y) - scale * ANCHOR_Y,
  ];
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.surface, zIndex: 10 },
});

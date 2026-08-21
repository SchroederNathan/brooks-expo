import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
} from 'react-native-reanimated';

import { colors } from '@/theme';

const DEFAULT_DOT_SIZE = 6;
const DEFAULT_ACTIVE_WIDTH = 18;
const DEFAULT_GAP = 6;

export type AnimatedPaginationDotsProps = {
  count: number;
  /** Zero-based page position, including fractional progress while scrolling. */
  progress: SharedValue<number>;
  activeColor?: string;
  inactiveColor?: string;
  dotSize?: number;
  activeWidth?: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * A scroll-linked pagination indicator. Each dot derives its width and color
 * directly from fractional page progress, keeping the interaction on the UI
 * thread instead of rendering React state for every scroll frame.
 *
 * @ref LLP 0003#screen-patterns — The PDP gallery indicator is continuous
 * state feedback tied to the user's swipe, with a reduced-motion snap mode.
 */
export function AnimatedPaginationDots({
  count,
  progress,
  activeColor = colors.ink,
  inactiveColor = colors.inkFaint,
  dotSize = DEFAULT_DOT_SIZE,
  activeWidth = DEFAULT_ACTIVE_WIDTH,
  gap = DEFAULT_GAP,
  style,
}: AnimatedPaginationDotsProps) {
  const reducedMotion = useReducedMotion();

  if (count < 2) return null;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.row, { gap }, style]}
    >
      {Array.from({ length: count }, (_, index) => (
        <PaginationDot
          key={index}
          index={index}
          count={count}
          progress={progress}
          dotSize={dotSize}
          activeWidth={activeWidth}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
          reducedMotion={reducedMotion}
        />
      ))}
    </View>
  );
}

function PaginationDot({
  index,
  count,
  progress,
  dotSize,
  activeWidth,
  activeColor,
  inactiveColor,
  reducedMotion,
}: {
  index: number;
  count: number;
  progress: SharedValue<number>;
  dotSize: number;
  activeWidth: number;
  activeColor: string;
  inactiveColor: string;
  reducedMotion: boolean;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const boundedProgress = Math.min(Math.max(progress.get(), 0), count - 1);
    const page = reducedMotion ? Math.round(boundedProgress) : boundedProgress;
    const distance = Math.abs(page - index);

    return {
      width: interpolate(
        distance,
        [0, 1],
        [activeWidth, dotSize],
        Extrapolation.CLAMP
      ),
      backgroundColor: interpolateColor(
        distance,
        [0, 1],
        [activeColor, inactiveColor]
      ),
    };
  }, [
    activeColor,
    activeWidth,
    count,
    dotSize,
    inactiveColor,
    index,
    reducedMotion,
  ]);

  return <Animated.View style={[{ height: dotSize }, animatedStyle]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

type Props = Omit<ComponentProps<typeof Animated.ScrollView>, 'children' | 'onScroll'> & {
  children: ReactNode;
  header: ReactNode;
  headerHeight: number;
};

/**
 * A scroll container whose leading visual stretches into top-edge overscroll.
 * The fixed-height frame keeps the following content attached to the stretched
 * edge while the absolutely positioned header cancels the scroll view's bounce,
 * leaving its top pinned to the screen.
 *
 * @ref LLP 0003#screen-patterns — Home's planned parallax is implemented as a
 * reusable scroll primitive rather than hero-specific event state.
 */
export function StretchyParallaxScrollView({
  children,
  header,
  headerHeight,
  scrollEventThrottle = 16,
  ...scrollProps
}: Props) {
  const scrollOffset = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;
  });
  const headerStyle = useAnimatedStyle(() => {
    const pullDistance = Math.max(-scrollOffset.value, 0);

    return {
      height: headerHeight + pullDistance,
      transform: [{ translateY: -pullDistance }],
    };
  }, [headerHeight]);

  return (
    <Animated.ScrollView
      {...scrollProps}
      alwaysBounceVertical
      bounces
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle}
    >
      <View style={[styles.headerFrame, { height: headerHeight }]}>
        <Animated.View
          style={[styles.header, { height: headerHeight }, headerStyle]}
        >
          {header}
        </Animated.View>
      </View>
      {children}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  headerFrame: {
    width: '100%',
    zIndex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    overflow: 'hidden',
  },
});

import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
} from 'react-native-reanimated';

type Props = Omit<ComponentProps<typeof Animated.ScrollView>, 'children' | 'onScroll'> & {
  children: ReactNode;
  foreground: ReactNode;
  header: ReactNode;
  headerHeight: number;
};

const PARALLAX_RATE = 0.5;

/**
 * A scroll container whose leading visual moves at half the content's speed
 * while its foreground stays locked to the following content. Both layers
 * stretch into top-edge overscroll and clip at the following content's moving
 * boundary, so neither layer can bleed into later sections.
 *
 * @ref LLP 0003#screen-patterns — Home's planned parallax is implemented as a
 * reusable scroll primitive rather than hero-specific event state.
 */
export function StretchyParallaxScrollView({
  children,
  foreground,
  header,
  headerHeight,
  scrollEventThrottle = 16,
  ...scrollProps
}: Props) {
  const reduceMotion = useReducedMotion();
  const scrollOffset = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.set(event.contentOffset.y);
  });
  const mediaClipStyle = useAnimatedStyle(() => {
    const pullDistance = Math.max(-scrollOffset.get(), 0);

    return {
      height: headerHeight + pullDistance,
      transform: [{ translateY: -pullDistance }],
    };
  }, [headerHeight]);
  const mediaStyle = useAnimatedStyle(() => {
    const offset = scrollOffset.get();
    const pullDistance = Math.max(-offset, 0);
    const parallaxDistance = reduceMotion
      ? 0
      : Math.max(offset, 0) * PARALLAX_RATE;

    return {
      height: headerHeight + pullDistance,
      transform: [{ translateY: parallaxDistance }],
    };
  }, [headerHeight, reduceMotion]);
  const foregroundStyle = useAnimatedStyle(() => {
    const pullDistance = Math.max(-scrollOffset.get(), 0);

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
          style={[
            styles.mediaClip,
            { height: headerHeight },
            mediaClipStyle,
          ]}
        >
          <Animated.View
            style={[styles.media, { height: headerHeight }, mediaStyle]}
          >
            {header}
          </Animated.View>
        </Animated.View>
      </View>
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.foreground,
          { height: headerHeight },
          foregroundStyle,
        ]}
      >
        {foreground}
      </Animated.View>
      {children}
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  headerFrame: {
    width: '100%',
  },
  mediaClip: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    overflow: 'hidden',
  },
  media: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
  },
  foreground: {
    position: 'absolute',
    zIndex: 1,
    top: 0,
    right: 0,
    left: 0,
    overflow: 'hidden',
  },
});

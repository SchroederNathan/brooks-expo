import type { ComponentProps, ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  type AnimatedRef,
} from 'react-native-reanimated';

import type { ScrollWorklets } from '@/components/brooks-header/scroll-direction';

type Props = Omit<
  ComponentProps<typeof Animated.ScrollView>,
  'children' | 'onScroll' | 'ref'
> & {
  children: ReactNode;
  foreground: ReactNode;
  header: ReactNode;
  headerHeight: number;
  /**
   * Extra scroll worklets to run alongside the parallax bookkeeping. Reanimated
   * allows one scroll handler per scrollable, so a caller that also needs scroll
   * state (the collapsing header) hands its worklets over rather than attaching
   * a second handler that would silently replace this one.
   */
  scrollHandlers?: Partial<ScrollWorklets>;
  /** Forwarded so a caller can drive this scroll view (the header's snap). */
  scrollRef?: AnimatedRef<Animated.ScrollView>;
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
  scrollHandlers,
  scrollRef,
  ...scrollProps
}: Props) {
  const reduceMotion = useReducedMotion();
  const scrollOffset = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler(
    {
      onBeginDrag: (event) => {
        scrollHandlers?.onBeginDrag?.(event);
      },
      onScroll: (event) => {
        scrollOffset.set(event.contentOffset.y);
        scrollHandlers?.onScroll?.(event);
      },
      onEndDrag: (event) => {
        scrollHandlers?.onEndDrag?.(event);
      },
    },
    [scrollHandlers]
  );
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
      ref={scrollRef}
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

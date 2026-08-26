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
   * Space above the media, in points. The media's top edge sits here at rest and
   * stays pinned here during a pull, so a screen with a floating bar passes the
   * bar's height and the media stretches from the bar's lower edge.
   */
  topInset?: number;
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
 * while its foreground stays locked to the following content. The media
 * stretches into top-edge overscroll and clips at the following content's
 * boundary, so it cannot bleed into later sections.
 *
 * @ref LLP 0003#screen-patterns — Home's planned parallax is implemented as a
 * reusable scroll primitive rather than hero-specific event state.
 *
 * @ref LLP 0003#screen-patterns — Every per-frame style here is a transform.
 * An earlier version animated `height` on the clip, media, and foreground; each
 * frame then ran a Yoga layout on the UI thread, which re-laid-out the native
 * video view and redrew the gradient's CGContext. Instruments showed those two
 * as the main-thread hotspots during a pull. Transforms skip layout, so the
 * stretch is now a scale about the media's top edge with a clip that is already
 * tall enough to hold it.
 */
export function StretchyParallaxScrollView({
  children,
  foreground,
  header,
  headerHeight,
  topInset = 0,
  scrollEventThrottle = 16,
  scrollHandlers,
  scrollRef,
  contentContainerStyle,
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
  const mediaStyle = useAnimatedStyle(() => {
    const offset = scrollOffset.get();
    const pullDistance = Math.max(-offset, 0);

    if (pullDistance > 0) {
      // Grow by the pull with the top edge pinned: scale about the centre, then
      // shift up by half the growth so the top lands at `-pullDistance` and the
      // bottom stays on the following content.
      const scale = (headerHeight + pullDistance) / headerHeight;
      return {
        transform: [{ translateY: -pullDistance / 2 }, { scale }],
      };
    }

    // The media scrolls 1:1 until the content above it (a closing floating
    // bar) has left the screen. Starting the half-speed drift at offset 0
    // would open a gap between the bar's lower edge and the media's top edge.
    const parallaxDistance = reduceMotion
      ? 0
      : Math.max(offset - topInset, 0) * PARALLAX_RATE;
    return {
      transform: [{ translateY: parallaxDistance }, { scale: 1 }],
    };
  }, [headerHeight, reduceMotion, topInset]);

  return (
    <Animated.ScrollView
      {...scrollProps}
      ref={scrollRef}
      alwaysBounceVertical
      bounces
      onScroll={handleScroll}
      scrollEventThrottle={scrollEventThrottle}
      contentContainerStyle={[{ paddingTop: topInset }, contentContainerStyle]}
    >
      <View style={[styles.headerFrame, { height: headerHeight }]}>
        {/*
          The clip is fixed at twice the media height and starts one media
          height above the frame, so a pull up to 100% of the hero has room to
          stretch into without the clip ever changing size. Its lower edge is
          the frame's lower edge, which is what keeps parallaxed media out of
          the following section.
        */}
        <View
          style={[
            styles.mediaClip,
            { top: -headerHeight, height: headerHeight * 2 },
          ]}
        >
          <Animated.View
            style={[
              styles.media,
              { top: headerHeight, height: headerHeight },
              mediaStyle,
            ]}
          >
            {header}
          </Animated.View>
        </View>
        {/*
          The foreground is plain content: it fills the frame and moves with the
          following section during both pull and scroll, so it needs no
          per-frame style at all.
        */}
        <View pointerEvents="box-none" style={styles.foreground}>
          {foreground}
        </View>
      </View>
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
    right: 0,
    left: 0,
    overflow: 'hidden',
  },
  media: {
    position: 'absolute',
    right: 0,
    left: 0,
  },
  foreground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
});

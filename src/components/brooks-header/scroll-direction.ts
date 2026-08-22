import { useSharedValue } from 'react-native-reanimated';
import type { ReanimatedScrollEvent } from 'react-native-reanimated/lib/typescript/hook/commonTypes';

export type ScrollDirection = 'idle' | 'to-top' | 'to-bottom';

/**
 * Scroll-direction and drag-anchor bookkeeping, entirely on the UI thread.
 *
 * Direction is latched rather than sampled: it only flips when the sign of the
 * frame-to-frame delta disagrees with the current direction, so a single jittery
 * frame mid-drag cannot flip it and restart the header animation.
 *
 * `offsetYAnchorOnBeginDrag` is the offset the finger went down at. The header
 * hides progressively against *that* anchor rather than against absolute scroll
 * position, which is what makes a short flick from deep in a list hide the bar
 * by exactly the distance dragged.
 *
 * Ported from the `instagram-header-on-scroll-animation` study in
 * rn-makeitanimated (`src/shared/lib/hooks/use-scroll-direction.ts`).
 */
export function useScrollDirection() {
  const scrollDirection = useSharedValue<ScrollDirection>('idle');
  const offsetYAnchorOnBeginDrag = useSharedValue(0);
  const prevOffsetY = useSharedValue(0);

  const onBeginDrag = (event: ReanimatedScrollEvent) => {
    'worklet';
    offsetYAnchorOnBeginDrag.set(event.contentOffset.y);
  };

  const onScroll = (event: ReanimatedScrollEvent) => {
    'worklet';
    const offsetY = event.contentOffset.y;
    // Top-edge overscroll is clamped away: a bounce is not a direction change.
    const current = Math.max(offsetY, 0);
    const previous = Math.max(prevOffsetY.get(), 0);
    const direction = scrollDirection.get();

    if (previous < current && direction !== 'to-bottom') {
      scrollDirection.set('to-bottom');
    }
    if (previous > current && direction !== 'to-top') {
      scrollDirection.set('to-top');
    }

    prevOffsetY.set(offsetY);
  };

  return { scrollDirection, offsetYAnchorOnBeginDrag, onBeginDrag, onScroll };
}

export type ScrollWorklets = {
  onBeginDrag: (event: ReanimatedScrollEvent) => void;
  onScroll: (event: ReanimatedScrollEvent) => void;
  onEndDrag: (event: ReanimatedScrollEvent) => void;
};

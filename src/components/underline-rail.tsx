import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, { cubicBezier, Easing, useReducedMotion } from 'react-native-reanimated';

import { colors } from '@/theme';

/**
 * A row of selectable children with an ink underline that slides to the
 * focused item. Measure once via onLayout; the line then moves with a CSS
 * transition (transform + width) so selection stays on the UI thread.
 *
 * @ref LLP 0003#tile — Replaces the boxed blue/ink selected swatch. Same
 * component on the catalog tile and the PDP color rail.
 */

/**
 * The indicator's motion, exported so anything else that slides an ink rule to
 * a focused item moves identically — currently the bottom tab bar's top rule
 * (`components/tab-bar.tsx`). Keep the two in lockstep by importing, not by
 * copying the numbers.
 */
export const INDICATOR_MS = 200;
/** On-screen movement. Native CSS transitions reject cubic-bezier strings. */
export const INDICATOR_EASING = cubicBezier(0.77, 0, 0.175, 1);
/** The same curve for `withTiming`, which takes an Easing rather than a CSS value. */
export const INDICATOR_TIMING_EASING = Easing.bezier(0.77, 0, 0.175, 1);
const LINE_GAP = 3;

export function UnderlineRail({
  selectedIndex,
  children,
  gap = 0,
  scrollable = false,
  color = colors.ink,
  thickness = 2,
  style,
  contentContainerStyle,
  trailing,
}: {
  selectedIndex: number;
  children: ReactNode;
  gap?: number;
  scrollable?: boolean;
  color?: string;
  thickness?: number;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Rendered after the items, not measured as a selection target (e.g. "+16"). */
  trailing?: ReactNode;
}) {
  const reduced = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const viewportW = useRef(0);
  const prevIndex = useRef(selectedIndex);
  const [layouts, setLayouts] = useState<{ x: number; width: number }[]>([]);
  const [armed, setArmed] = useState(false);

  const selected = layouts[selectedIndex];

  const onItemLayout = (index: number, e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    setLayouts((prev) => {
      const cur = prev[index];
      if (cur && cur.x === x && cur.width === width) return prev;
      const next = prev.slice();
      next[index] = { x, width };
      return next;
    });
  };

  useEffect(() => {
    if (!selected || armed) return;
    const id = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(id);
  }, [selected, armed]);

  useEffect(() => {
    const prev = prevIndex.current;
    prevIndex.current = selectedIndex;
    if (!scrollable || !armed || !selected || prev === selectedIndex) return;
    const x = selected.x + selected.width / 2 - viewportW.current / 2;
    scrollRef.current?.scrollTo({ x: Math.max(0, x), animated: !reduced });
  }, [selectedIndex, selected, armed, scrollable, reduced]);

  const underlineStyle = {
    backgroundColor: color,
    height: thickness,
    width: selected?.width ?? 0,
    opacity: selected ? 1 : 0,
    transform: [{ translateX: selected?.x ?? 0 }],
    transitionProperty: ['transform', 'width'] as const,
    transitionDuration: armed && !reduced ? INDICATOR_MS : 0,
    transitionTimingFunction: INDICATOR_EASING,
  };

  const row = (
    <View style={[styles.row, { gap, paddingBottom: thickness + LINE_GAP }]}>
      {Children.map(children, (child, index) => (
        <View collapsable={false} onLayout={(e) => onItemLayout(index, e)}>
          {child}
        </View>
      ))}
      {trailing}
      <Animated.View pointerEvents="none" style={[styles.line, underlineStyle]} />
    </View>
  );

  if (!scrollable) {
    return <View style={style}>{row}</View>;
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={style}
      contentContainerStyle={contentContainerStyle}
      onLayout={(e) => {
        viewportW.current = e.nativeEvent.layout.width;
      }}
    >
      {row}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  line: {
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
});

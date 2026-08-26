import type { ReactNode } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/themed-text';
import { colors, spacing } from '@/theme';

/**
 * The root of a tab screen that draws no chrome of its own.
 *
 * @ref LLP 0003#the-header-collapses-on-scroll — The blue collapsing header is
 * Home's alone now. Browse, Cart, and Profile used to inherit their top spacing
 * from it: `useBrooksHeader` handed back a `headerHeight` that already contained
 * the status-bar inset, so a screen padded its content by that one number and
 * turned the native inset adjustment off. Take the header away and that number
 * goes with it — leaving three screens to each recompute
 * `insets.top + <some gap>` inline, which is exactly the drift the design-system
 * rule exists to stop (Shoe Finder and Login had already written it twice).
 *
 * So the safe area becomes a primitive rather than an arithmetic expression
 * repeated per screen. One gap, one gutter, one heading rhythm — the same
 * three values the header used to impose, now imposed by a component.
 */

/**
 * Distance from the safe-area top to a headerless screen's first line of
 * content. `spacing.xl` is the value Shoe Finder and Login already used; it is
 * named here so the app has one answer instead of three copies of it.
 */
const TOP_GAP = spacing.xl;

/**
 * The top padding a headerless screen needs, for a screen whose root cannot be
 * `Screen` or `ScreenScrollView` — a `FlatList`, or a container that owns its
 * own scroll handler.
 */
export function useScreenTopPadding() {
  const { top } = useSafeAreaInsets();
  return top + TOP_GAP;
}

/**
 * A non-scrolling screen root. Caller style merges last, so a screen can change
 * its fill or centre its content without forking the safe-area contract.
 */
export function Screen({ style, ...rest }: ViewProps) {
  const paddingTop = useScreenTopPadding();

  return <View {...rest} style={[styles.root, { paddingTop }, style]} />;
}

/**
 * A scrolling screen root: the same safe area, applied to the content container
 * so the fill still runs under the status bar as the reader scrolls.
 *
 * `contentInsetAdjustmentBehavior` stays `never` for the reason the header's own
 * scroll props set it — the safe area is accounted for exactly once, here, and
 * letting UIKit add it again would pad the content twice.
 */
export function ScreenScrollView({ contentContainerStyle, style, ...rest }: ScrollViewProps) {
  const paddingTop = useScreenTopPadding();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      showsVerticalScrollIndicator={false}
      {...rest}
      style={[styles.root, style]}
      contentContainerStyle={[
        { paddingTop, paddingBottom: spacing.xxxl },
        contentContainerStyle,
      ]}
    />
  );
}

/**
 * The `h1` that names a headerless screen, on the shared gutter and rhythm.
 *
 * Children rather than a `title` string: Cart's heading carries an inline count
 * in a second ramp step, and a component that takes content as props would have
 * needed a prop for it.
 */
export function ScreenHeading({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.heading, style]}>
      <Txt variant="h1">{children}</Txt>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  heading: { paddingHorizontal: spacing.gutter, marginBottom: spacing.lg },
});

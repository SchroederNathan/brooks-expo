import { Link } from 'expo-router';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/**
 * The picture a push zooms out of.
 *
 * Wrap the image of any card that opens a screen. On iOS 18+ the photo lifts
 * off the card and grows into the pushed screen — Apple's own
 * `UIViewController.Transition.zoom`, reached through Expo Router's
 * `Link.AppleZoom`. Everywhere else (Android, iOS 17 and older, web) the
 * wrapper renders as a plain `View` and the push slides as before.
 *
 * @ref LLP 0003#zoom-transitions
 *
 * Two constraints this component exists to hold in one place:
 *
 * 1. `Link.AppleZoom` takes exactly one child and slots native zoom props onto
 *    it, so the child must be a host view that survives view flattening —
 *    hence the explicit `View` with `collapsable={false}` rather than handing it
 *    an `expo-image` directly.
 * 2. The frame must be known on first paint. The native side reads the source
 *    rect before the push begins, so the size is passed in as numbers instead
 *    of being left to `flex` to resolve.
 *
 * Must be rendered inside a `<Link ... asChild>`; `Link.AppleZoom` throws
 * otherwise.
 */
export function ZoomSource({
  width,
  height,
  style,
  children,
}: {
  width: number;
  height: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  return (
    <Link.AppleZoom>
      <View collapsable={false} style={StyleSheet.flatten([{ width, height }, styles.clip, style])}>
        {children}
      </View>
    </Link.AppleZoom>
  );
}

const styles = StyleSheet.create({
  // The zoom scales the source rect, so anything bleeding past the card's own
  // bounds would be carried into the transition with it.
  clip: { overflow: 'hidden' },
});

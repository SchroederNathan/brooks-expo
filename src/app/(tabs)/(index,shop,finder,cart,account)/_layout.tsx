import { Stack } from 'expo-router/stack';
import { StyleSheet, View } from 'react-native';

import { colors } from '@/theme';

export const unstable_settings = {
  index: { anchor: 'index' },
  shop: { anchor: 'shop' },
  finder: { anchor: 'finder' },
  cart: { anchor: 'cart' },
  account: { anchor: 'account' },
};

const tabNames = new Set(['index', 'shop', 'finder', 'cart', 'account']);

/**
 * Shared native stack chrome for every tab.
 *
 * @ref LLP 0003#the-header-collapses-on-scroll — [superseded 2026-08-21] Each
 * tab used to carry a native transparent header with the wordmark in a
 * `Stack.Toolbar`. Chrome above an anchor is app-drawn now, so every anchor
 * hides the native header.
 *
 * [observed 2026-08-26] What each anchor then draws is no longer the same thing.
 * Home mounts the blue collapsing `useBrooksHeader`, which floats over its video
 * hero. Browse, Cart, Profile, and Shoe Finder draw nothing above their content:
 * they open on an in-content `h1` and take their safe area from
 * `components/screen`. `finder` is still declared unconditionally below because
 * it can be pushed onto another tab's stack.
 *
 * `search` is the one screen here that keeps the native header, because the
 * native `Stack.SearchBar` is mounted in it; it is not an anchor at all, but a
 * screen pushed onto whichever tab's stack asked for it.
 */
export default function TabStackLayout({ segment }: { segment: string }) {
  const matchedName = segment.match(/\(([^)]+)\)/)?.[1] ?? 'index';
  const screenName = tabNames.has(matchedName) ? matchedName : 'index';

  return (
    <View collapsable={false} style={styles.root}>
      <Stack
        screenOptions={{
          animation: 'none',
          contentStyle: { backgroundColor: colors.surface },
          headerBackButtonDisplayMode: 'minimal',
          headerBlurEffect: 'none',
          headerShadowVisible: false,
          headerTitle: '',
          headerTransparent: true,
        }}
      >
        {screenName === 'finder' ? null : (
          <Stack.Screen name={screenName} options={{ headerShown: false }} />
        )}
        {/* Declared unconditionally, not just when it is the anchor: the Browse
            card and the Account row can land on this route inside another tab's
            stack, and its full-bleed navy panel has no room for a header. */}
        <Stack.Screen name="finder" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});

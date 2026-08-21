import { Stack } from 'expo-router/stack';
import { StyleSheet, View } from 'react-native';

import { BrooksWordmark } from '@/screens/home/wordmark';
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
 * @ref LLP 0003#screen-patterns — The home header stays fully transparent over
 * the hero with no app-owned material; the tab bar is app-drawn and opaque.
 *
 * `finder` opts out of the shared wordmark toolbar and out of the header
 * entirely: its intro is a full-bleed navy panel that either would sit on top
 * of. `search` is not an anchor at all — it is pushed onto whichever tab's stack
 * asked for it, and sets its own header (the native `Stack.SearchBar`).
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
          <Stack.Screen name={screenName}>
            <Stack.Toolbar placement="left">
              <Stack.Toolbar.View hidesSharedBackground>
                <View style={styles.wordmark}>
                  <BrooksWordmark width={84} color={colors.ink} />
                </View>
              </Stack.Toolbar.View>
            </Stack.Toolbar>
          </Stack.Screen>
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
  wordmark: {
    width: 84,
    height: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
});

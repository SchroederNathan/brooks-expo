import { Stack } from 'expo-router/stack';
import { StyleSheet, View } from 'react-native';

import { BrooksWordmark } from '@/screens/home/wordmark';
import { colors } from '@/theme';

export const unstable_settings = {
  index: { anchor: 'index' },
  shop: { anchor: 'shop' },
  cart: { anchor: 'cart' },
  account: { anchor: 'account' },
  search: { anchor: 'search' },
};

const tabNames = new Set(['index', 'shop', 'cart', 'account', 'search']);

/**
 * Shared native stack chrome for every tab.
 *
 * @ref LLP 0003#screen-patterns — The home header stays fully transparent over
 * the hero with no app-owned material; the tab bar keeps its native material.
 */
export default function TabStackLayout({ segment }: { segment: string }) {
  const matchedName = segment.match(/\(([^)]+)\)/)?.[1] ?? 'index';
  const screenName = tabNames.has(matchedName) ? matchedName : 'index';

  return (
    <View collapsable={false} style={styles.root}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: colors.surface },
          headerBackButtonDisplayMode: 'minimal',
          headerBlurEffect: 'none',
          headerShadowVisible: false,
          headerTitle: '',
          headerTransparent: true,
        }}
      >
        <Stack.Screen
          name={screenName}
          options={screenName === 'search' ? { headerShown: true, headerTitle: '' } : undefined}
        >
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.View hidesSharedBackground>
              <View style={styles.wordmark}>
                <BrooksWordmark width={84} color={colors.ink} />
              </View>
            </Stack.Toolbar.View>
          </Stack.Toolbar>
        </Stack.Screen>
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

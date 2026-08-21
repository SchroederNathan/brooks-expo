import { Tabs } from 'expo-router/js-tabs';

import { BrooksTabBar } from '@/components/tab-bar';

/**
 * App-owned bottom tab bar. Five tabs: Home, Browse, Shoe Finder, Cart,
 * Profile.
 *
 * @ref LLP 0003#icons-and-the-logo — `NativeTabs` rendered the items itself, so
 * icons had to be SF Symbols / Material Symbols and the cart badge had to wear
 * the system's fixed-white text. It also capped the app at four regular tabs
 * plus the detached search role: a fifth tipped UITabBarController into a
 * "More" tab. Drawing the bar in JS restores the Brooks sprite glyphs and the
 * lime-on-blue badge, and lets Shoe Finder have a tab again.
 *
 * Search gave up its slot in the trade. It is still reachable everywhere it was
 * — the Browse header's search field and the category header both push
 * `/search`, which lands on the current tab's stack, so the native
 * `Stack.SearchBar` still comes up with it.
 *
 * Each trigger targets one clone of the shared array-group Stack so every tab
 * gets the same native Brooks toolbar without duplicating its layout.
 */
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <BrooksTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="(index)" options={{ title: 'Home' }} />
      <Tabs.Screen name="(shop)" options={{ title: 'Browse' }} />
      <Tabs.Screen name="(finder)" options={{ title: 'Shoe Finder' }} />
      <Tabs.Screen name="(cart)" options={{ title: 'Cart' }} />
      <Tabs.Screen name="(account)" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

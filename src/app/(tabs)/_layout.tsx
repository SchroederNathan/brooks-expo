import { Tabs } from 'expo-router/js-tabs';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { DynamicColorIOS, Platform } from 'react-native';

import { BrooksTabBar } from '@/components/tab-bar';
import { useCart } from '@/store/cart';
import { colors } from '@/theme';
import { NATIVE_TABS } from '@/utils/native-tabs';

/**
 * The bottom tab bar. Five tabs: Home, Browse, Shoe Finder, Cart, Profile.
 *
 * @ref LLP 0003#liquid-glass-devices-get-the-system-tab-bar — Liquid Glass
 * devices get the system bar (`NativeTabs`); every other device gets the
 * app-drawn `BrooksTabBar`. Both mount the same five array-group clones, so the
 * routes, stacks, and anchors are identical either way.
 *
 * Each trigger targets one clone of the shared array-group Stack so every tab
 * gets the same native Brooks toolbar without duplicating its layout.
 */
export default function TabLayout() {
  return NATIVE_TABS ? <GlassTabs /> : <BrooksTabs />;
}

/**
 * @ref LLP 0003#icons-and-the-logo — The app-drawn bar keeps the Brooks sprite
 * glyphs and the lime-on-blue cart badge, which the system bar cannot render.
 */
function BrooksTabs() {
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

/**
 * The selected tab's color. Ink, like the app-drawn bar — but glass flips to
 * its dark appearance over dark content (Shoe Finder's navy panel, Home's
 * footer), where ink on navy disappears. A dynamic color follows that flip.
 * iOS only: `DynamicColorIOS` throws elsewhere, and this module loads everywhere.
 */
const GLASS_TINT =
  Platform.OS === 'ios' ? DynamicColorIOS({ light: colors.ink, dark: colors.surface }) : colors.ink;

/**
 * The system bar, with SF Symbols in place of the sprite glyphs. Icons only,
 * like the app-drawn bar: each label is `hidden`, which blanks the item title,
 * so the name moves to the trigger's `accessibilityLabel` for VoiceOver.
 *
 * Five regular triggers fit without a "More" tab. The ceiling that pushed Shoe
 * Finder off the bar in August was five plus the detached `role="search"`
 * trigger; Browse is the search screen now, so there is no search trigger.
 *
 * `disableAutomaticContentInsets` on every trigger: the system would otherwise
 * flip each tab's first scroll view from `never` to `automatic`, and every
 * screen here already pads for the top safe area itself (`components/screen`),
 * so the top inset would be applied twice. Screens clear the bar through
 * `useTabBarOverlap()` instead.
 *
 * The cart badge is always mounted and toggled with `hidden`, so the trigger's
 * children keep one shape as the count changes. `hidden` is only read when the
 * badge has no text — any string, "0" included, shows — so an empty cart has
 * to pass none.
 */
function GlassTabs() {
  const { count } = useCart();

  return (
    <NativeTabs tintColor={GLASS_TINT} badgeBackgroundColor={colors.blue}>
      <NativeTabs.Trigger
        name="(index)"
        accessibilityLabel="Home"
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <NativeTabs.Trigger.Label hidden>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="(shop)"
        accessibilityLabel="Browse"
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
        />
        <NativeTabs.Trigger.Label hidden>Browse</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="(finder)"
        accessibilityLabel="Shoe Finder"
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon sf={{ default: 'shoe', selected: 'shoe.fill' }} />
        <NativeTabs.Trigger.Label hidden>Shoe Finder</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="(cart)"
        accessibilityLabel="Cart"
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon sf={{ default: 'cart', selected: 'cart.fill' }} />
        <NativeTabs.Trigger.Label hidden>Cart</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={count === 0}>
          {count === 0 ? undefined : count > 9 ? '9+' : String(count)}
        </NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="(account)"
        accessibilityLabel="Profile"
        disableAutomaticContentInsets
      >
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <NativeTabs.Trigger.Label hidden>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

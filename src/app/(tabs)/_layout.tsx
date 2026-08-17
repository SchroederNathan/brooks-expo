import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useCart } from '@/store/cart';
import { colors, font } from '@/theme';

/**
 * System tab bar (liquid glass on iOS 26, Material 3 on Android). The system
 * renders the items, so icons are SF Symbols / Material Symbols rather than
 * the Brooks sprite glyphs the old JS tab bar drew — see LLP 0003#iconography.
 * The search trigger carries `role="search"`, which iOS detaches into the
 * standalone button at the trailing edge of the bar.
 *
 * Four regular tabs is the ceiling here: a fifth (Shoe Finder's old slot) plus
 * the search trigger tips UITabBarController into a "More" tab, which swallows
 * the search role. Shoe Finder is a pushed screen now — see `app/finder.tsx`.
 */
export default function TabLayout() {
  const { count } = useCart();

  return (
    <NativeTabs
      tintColor={colors.ink}
      labelStyle={{ fontFamily: font.medium }}
      // The system badge cannot render the site's lime-with-blue-text pair
      // legibly (badge text is fixed white on iOS), so the badge wears the
      // other brand color instead.
      badgeBackgroundColor={colors.blue}
      minimizeBehavior="onScrollDown"
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="shop">
        <NativeTabs.Trigger.Icon
          sf={{ default: 'storefront', selected: 'storefront.fill' }}
          md="storefront"
        />
        <NativeTabs.Trigger.Label>Shop</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Icon sf={{ default: 'bag', selected: 'bag.fill' }} md="shopping_bag" />
        <NativeTabs.Trigger.Label>Bag</NativeTabs.Trigger.Label>
        {count > 0 ? (
          <NativeTabs.Trigger.Badge>{count > 9 ? '9+' : String(count)}</NativeTabs.Trigger.Badge>
        ) : null}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="account">
        <NativeTabs.Trigger.Icon sf={{ default: 'person', selected: 'person.fill' }} md="person" />
        <NativeTabs.Trigger.Label>Account</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="(search)" role="search">
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

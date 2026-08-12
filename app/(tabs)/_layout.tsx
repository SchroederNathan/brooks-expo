import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Txt } from '../../src/components/primitives';
import { useCart } from '../../src/store/cart';
import { color, font, radius } from '../../src/theme/tokens';

/**
 * Tab icons are drawn rather than pulled from an icon font: five glyphs is a
 * small price for having the bag icon carry a live count badge and for the
 * whole set sharing one stroke weight.
 */
function Icon({ name, active }: { name: string; active: boolean }) {
  const c = active ? color.ink : color.inkFaint;
  const w = active ? 2.2 : 1.8;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      {name === 'home' && (
        <Path
          d="M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5"
          stroke={c}
          strokeWidth={w}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {name === 'shop' && (
        <>
          <Path
            d="M4 7h16l-1.2 13H5.2L4 7Z"
            stroke={c}
            strokeWidth={w}
            strokeLinejoin="round"
          />
          <Path d="M8.5 9V6a3.5 3.5 0 0 1 7 0v3" stroke={c} strokeWidth={w} strokeLinecap="round" />
        </>
      )}
      {name === 'finder' && (
        <>
          <Circle cx={11} cy={11} r={7} stroke={c} strokeWidth={w} />
          <Path d="m16.5 16.5 4 4" stroke={c} strokeWidth={w} strokeLinecap="round" />
        </>
      )}
      {name === 'bag' && (
        <>
          <Path d="M5 8h14l-1 12H6L5 8Z" stroke={c} strokeWidth={w} strokeLinejoin="round" />
          <Path d="M9 10V6.5a3 3 0 0 1 6 0V10" stroke={c} strokeWidth={w} strokeLinecap="round" />
        </>
      )}
      {name === 'account' && (
        <>
          <Circle cx={12} cy={8.5} r={3.8} stroke={c} strokeWidth={w} />
          <Path
            d="M4.5 20.5c1.2-3.8 4-5.8 7.5-5.8s6.3 2 7.5 5.8"
            stroke={c}
            strokeWidth={w}
            strokeLinecap="round"
          />
        </>
      )}
    </Svg>
  );
}

function TabIcon({ name, focused, badge }: { name: string; focused: boolean; badge?: number }) {
  return (
    <View>
      <Icon name={name} active={focused} />
      {badge ? (
        <View style={styles.badge}>
          {/* Lime fill with blue text — the site's exact cart-badge treatment. */}
          <Txt variant="caption" c={color.blue} style={styles.badgeText}>
            {badge > 9 ? '9+' : badge}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}

export default function TabLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: color.ink,
        tabBarInactiveTintColor: color.inkFaint,
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 10, letterSpacing: 0.2 },
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: color.hairline,
          // A translucent bar lets product photography scroll under it, which is
          // most of why the app reads as native rather than as a page.
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : color.surface,
          elevation: 0,
        },
        tabBarBackground:
          Platform.OS === 'ios'
            ? () => <BlurView tint="light" intensity={80} style={StyleSheet.absoluteFill} />
            : undefined,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => <TabIcon name="shop" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="finder"
        options={{
          title: 'Shoe Finder',
          tabBarIcon: ({ focused }) => <TabIcon name="finder" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Bag',
          tabBarIcon: ({ focused }) => <TabIcon name="bag" focused={focused} badge={count} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ focused }) => <TabIcon name="account" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.pill,
    backgroundColor: color.lime,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: color.surface,
  },
  badgeText: { fontSize: 10, lineHeight: 13 },
});

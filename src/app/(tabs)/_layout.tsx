import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet } from 'react-native';

import { TabIcon } from '@/components/tab-icon';
import { useCart } from '@/store/cart';
import { colors, font } from '@/theme';


export default function TabLayout() {
  const { count } = useCart();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle: { fontFamily: font.medium, fontSize: 10, letterSpacing: 0.2 },
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.hairline,
          // A translucent bar lets product photography scroll under it, which is
          // most of why the app reads as native rather than as a page.
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.surface,
          // Audit exemption: not a shadow — suppresses react-navigation's
          // default Android tab-bar elevation.
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


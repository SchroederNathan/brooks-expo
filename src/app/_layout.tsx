import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
  Figtree_800ExtraBold,
  Figtree_900Black,
  useFonts,
} from '@expo-google-fonts/figtree';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CartProvider } from '@/store/cart';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
    Figtree_800ExtraBold,
    Figtree_900Black,
    Caveat_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // Hold the splash until Figtree is ready: letting the system font paint first
  // causes a visible reflow, which is exactly the kind of tell that makes an app
  // feel like a web page in a shell.
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <CartProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.surface },
            }}
          >
            {/* Headers stay hidden (all chrome is in-body brand design); the
                titles still feed web document titles and accessibility. */}
            <Stack.Screen name="(tabs)" options={{ title: 'Brooks' }} />
            <Stack.Screen
              name="product/[id]"
              options={{ title: 'Product', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="category/[id]"
              options={{ title: 'Shop', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="search"
              options={{ title: 'Search', presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="login"
              options={{
                title: 'Brooks Run Club',
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
          </Stack>
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

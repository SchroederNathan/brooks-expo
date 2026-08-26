import { Caveat_600SemiBold } from '@expo-google-fonts/caveat';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplash } from '@/components/animated-splash';
import { CartProvider } from '@/store/cart';
import { colors, header } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'FilsonPro-Regular': require('../../assets/fonts/FilsonProRegular.otf'),
    'FilsonPro-Medium': require('../../assets/fonts/FilsonProMedium.otf'),
    'FilsonPro-Bold': require('../../assets/fonts/FilsonProBold.otf'),
    'FilsonPro-Heavy': require('../../assets/fonts/FilsonProHeavy.otf'),
    'FilsonPro-Black': require('../../assets/fonts/FilsonProBlack.otf'),
    Caveat_600SemiBold,
  });
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // Hold the splash until Filson Pro is ready: letting the system font paint first
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
            {/* The root header stays hidden because each tab route owns its
                branded nested Stack header; this title still feeds web
                document titles and accessibility. */}
            <Stack.Screen name="(tabs)" options={{ title: 'Brooks' }} />
            {/* iOS 18+ zoom is opted in per Link.AppleZoom at the source —
                the catalog tile into the PDP, and every editorial / franchise
                card into the PLP. These screens keep the stack default so
                Android and older iOS still push. @ref LLP 0003#zoom-transitions

                Both pushed screens wear the native bar, and both run it
                transparent: the PDP's over its full-bleed gallery, the PLP's
                over the white its own control row carries up behind it. The PLP
                also sets its title as the in-content one scrolls away.
                @ref LLP 0003#pushed-screens-wear-the-native-header */}
            <Stack.Screen
              name="product/[id]"
              options={{ title: 'Product', ...header.overlay }}
            />
            <Stack.Screen name="category/[id]" options={{ title: 'Shop', ...header.plain }} />
            <Stack.Screen
              name="login"
              options={{
                title: 'Brooks Run Club',
                presentation: 'modal',
              }}
            />
          </Stack>
          {/* Native only: web has no native splash to hand off from, and
              lottie-react-native's web renderer would be an extra dependency. */}
          {Platform.OS !== 'web' && <AnimatedSplash />}
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

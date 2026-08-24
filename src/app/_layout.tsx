import {
  Archivo_400Regular,
  Archivo_500Medium,
  Archivo_700Bold,
  Archivo_800ExtraBold,
  Archivo_900Black,
} from '@expo-google-fonts/archivo';
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
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_700Bold,
    Archivo_800ExtraBold,
    Archivo_900Black,
    Caveat_600SemiBold,
  });
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  // Hold the splash until the type is ready: letting the system font paint first
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
            <Stack.Screen name="(tabs)" options={{ title: 'Ecommerce Demo' }} />
            {/* iOS 18+ zoom is opted in per Link.AppleZoom on the tile; this
                screen keeps the stack default so Android / older iOS still
                push. @ref LLP 0003#screen-patterns */}
            <Stack.Screen name="product/[id]" options={{ title: 'Product' }} />
            <Stack.Screen name="category/[id]" options={{ title: 'Shop' }} />
            <Stack.Screen
              name="login"
              options={{
                title: 'Member preview',
                presentation: 'modal',
              }}
            />
          </Stack>
          {/* Native only: web has no native splash to hand off from. */}
          {Platform.OS !== 'web' && <AnimatedSplash />}
        </CartProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

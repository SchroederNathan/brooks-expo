import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { BottomTabBarHeightContext } from 'expo-router/js-tabs';
import { createContext, useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Which tab bar this device gets, decided once at launch.
 *
 * @ref LLP 0003#liquid-glass-devices-get-the-system-tab-bar — Where the system
 * draws Liquid Glass (iOS 26+, unless the app opts out through
 * `UIDesignRequiresCompatibility`), the app hands the bar back to `NativeTabs`.
 * Everywhere else — Android, web, iOS 18 and older — keeps the app-drawn
 * `BrooksTabBar`.
 *
 * A module constant, not state: `NativeTabs` remounts its navigator if its
 * shape changes at runtime, and the answer cannot change while the app runs.
 */
export const NATIVE_TABS = isLiquidGlassAvailable();

/**
 * True below a tab's stack. Provided by the array-group layout that every tab
 * mounts, so a screen pushed onto the root stack (Login, the PDP) reads false
 * and keeps its bottom edge to itself.
 */
export const InTabContext = createContext(false);

/**
 * How much of a tab screen's bottom edge the tab bar covers.
 *
 * The two bars have opposite layout models. The JS bar is a flex sibling of the
 * screen, so it shortens the screen and covers nothing: 0. The glass bar floats
 * over the screen, which runs to the bottom of the window underneath it. Inside
 * a native tab, `NativeTabs` wraps the content in its own `SafeAreaProvider`,
 * whose bottom inset is the bar plus the home indicator — exactly the strip to
 * keep content out of.
 */
export function useTabBarOverlap() {
  const { bottom } = useSafeAreaInsets();
  const inTab = useContext(InTabContext);
  return NATIVE_TABS && inTab ? bottom : 0;
}

/**
 * How far the screen's bottom edge sits above the window's: the JS bar's
 * measured height, or 0 under the glass bar, which does not shorten the screen.
 * Read from context rather than `useBottomTabBarHeight()`, which throws outside
 * the JS navigator.
 */
export function useJsTabBarHeight() {
  return useContext(BottomTabBarHeightContext) ?? 0;
}

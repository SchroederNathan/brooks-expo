import type { NativeStackNavigationOptions } from 'expo-router';
import { Platform } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

import { colors } from './colors';
import { font } from './typography';

/**
 * Native stack header presets.
 *
 * @ref LLP 0003#pushed-screens-wear-the-native-header — A pushed screen wears
 * the platform's own bar, not an app-drawn one. The app used to draw square
 * bordered boxes over the PDP gallery and a hand-rolled 48pt row over the PLP
 * grid; both re-implemented what UINavigationBar already does, and neither
 * inherited the back gesture's interactive chevron, the bar's own hit targets,
 * or its Dynamic Type behaviour.
 *
 * These are tokens, not a component. The expo-design-system rule is explicit:
 * do not wrap a platform component that already carries the design language.
 * So the Brooks identity reaches the native bar the only way it should — as
 * values (ink tint, Filson title) handed to `Stack` options.
 *
 * The blue collapsing `useBrooksHeader` is a separate thing and stays: it is a
 * verbatim port of brooksrunning.com's own sticky header. [observed 2026-08-26]
 * It belongs to Home alone now — the other anchors draw no chrome at all and
 * take their safe area from `components/screen`.
 *
 * [observed 2026-09-24] Every pushed or presented screen wears the native bar
 * again: the PDP (`overlay`), the PLP (`plain`), and the `Filter & sort` and
 * Run Club sheets (`sheet`). Their buttons are `Stack.Toolbar.Button`s — the
 * PLP's filter, each sheet's close — not app-drawn squares or crosses.
 * @ref LLP 0003#pushed-screens-wear-the-native-header
 */

/** The bar's own tint: back chevron and every toolbar button. */
const tint = colors.ink;

/**
 * The back button is `minimal` because a Brooks
 * push is always one level deep from a grid or a tile — the previous screen's
 * title adds nothing the chevron does not already say.
 */
const base = {
  headerShown: true,
  headerTintColor: tint,
  headerBackButtonDisplayMode: 'minimal',
  headerShadowVisible: false,
  headerBackTitleStyle: { fontFamily: font.medium },
} satisfies NativeStackNavigationOptions;

export const header = {
  /** The bar's tint, for a toolbar button that needs it explicitly. */
  tint,

  /**
   * A bar with no surface of its own, over full-bleed media (the PDP gallery).
   * `headerBlurEffect: 'none'` because Brooks shoots product on near-white:
   * a blur over #F8F8F8 reads as a smudge, and the chevron has all the contrast
   * it needs without one.
   */
  overlay: {
    ...base,
    headerTransparent: true,
    headerBlurEffect: 'none',
    headerTitle: '',
  } satisfies NativeStackNavigationOptions,

  /**
   * A bar with no surface of its own over a scrolling grid (the PLP). The
   * screen sets the title, and passes `''` until its in-content large title
   * has scrolled away.
   *
   * Transparent because the PLP is a zoom destination: an opaque bar makes
   * UIKit inset the content, and under a zoom that inset lands a beat late, so
   * the grid paints behind the bar and then jumps down. The screen pads itself
   * by `useHeaderHeight()` instead, and iOS 26's scroll edge effect keeps the
   * bar legible over tiles that scroll under it. @ref LLP 0003#zoom-transitions
   */
  plain: {
    ...base,
    headerTransparent: true,
    headerBlurEffect: 'none',
    // Filson, not the system face — the one piece of brand the native bar takes.
    headerTitleStyle: { fontFamily: font.extraBold, fontSize: 17, color: colors.ink },
  } satisfies NativeStackNavigationOptions,

  /**
   * The bar of a presented sheet (`Filter & sort`, Run Club). No back button:
   * the screen puts the system close button in its trailing slot with
   * `Stack.Toolbar`. The screen's own white is the bar's surface.
   */
  sheet: {
    ...base,
    headerStyle: { backgroundColor: colors.surface },
    headerTitleStyle: { fontFamily: font.extraBold, fontSize: 17, color: colors.ink },
  } satisfies NativeStackNavigationOptions,
} as const;

/**
 * Whether presented sheets wear the native bar. iOS only: Android's form sheet
 * renders no stack header, so there a sheet draws its own title and close.
 */
export const nativeSheetHeader = Platform.OS === 'ios';

/**
 * SF Symbols for `Stack.Toolbar.Button`, named for what the app means rather
 * than for the glyph.
 *
 * The Brooks sprite in `components/icons` is *not* the source here. A toolbar
 * button is bar chrome, and bar chrome is the platform's: an SF Symbol lines up
 * optically with the back chevron beside it, scales with Dynamic Type, and gets
 * the pressed state for free. The sprite stays where it belongs — in the blue
 * header, the tab bar, and screen content.
 */
export const headerIcon = {
  share: 'square.and.arrow.up',
  cart: 'bag',
  filters: 'line.3.horizontal.decrease',
  /** A sheet's dismiss: the glyph UIKit's own `.close` bar item draws. */
  close: 'xmark',
  account: 'person',
} as const satisfies Record<string, SFSymbol>;

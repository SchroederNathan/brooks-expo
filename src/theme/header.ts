import type { NativeStackNavigationOptions } from 'expo-router';
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
 * [superseded 2026-08-28] The PLP no longer wears the native bar. It hides it
 * and draws back and search as Browse's `OutlineIconButton` squares, so the
 * `plain` preset that used to sit here is gone. Native chrome is now the PDP's
 * alone. @ref LLP 0003#pushed-screens-wear-the-native-header
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
} as const;

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
  account: 'person',
} as const satisfies Record<string, SFSymbol>;

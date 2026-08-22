import type { StatusBarStyle } from 'expo-status-bar';

import { BrooksHeader } from './header';

import type { HeaderAction } from './actions';
import { useHeaderScroll } from './use-header-scroll';

export type { HeaderAction, HeaderActionConfig, HeaderActionName } from './actions';
export { HEADER_BAR_HEIGHT, useHeaderMetrics } from './metrics';

type Options = {
  /**
   * Trailing controls, in order. Defaults to the site's own set —
   * search · account · cart · menu.
   */
  actions?: readonly HeaderAction[];
  /** Defaults to going home. */
  onLogoPress?: () => void;
  /**
   * Status-bar style once the header has left and the screen's own content is
   * behind the clock. Defaults to `dark`; a screen whose upper content is dark
   * (Home's video hero) passes `light`.
   */
  hiddenStatusBarStyle?: StatusBarStyle;
};

/**
 * The whole header, in one hook: the element to render and the props that make
 * it collapse.
 *
 * A screen wires it in three lines, and cannot half-wire it — the scroll state
 * and the bar that reads it come from the same call, so there is no context to
 * forget to mount and no shared values to thread:
 *
 * ```tsx
 * const { header, headerHeight, scrollProps } = useBrooksHeader({
 *   actions: ['search', 'cart', 'menu'],
 * });
 *
 * return (
 *   <View style={{ flex: 1 }}>
 *     <Animated.ScrollView {...scrollProps} contentContainerStyle={{ paddingTop: headerHeight }}>
 *       {...}
 *     </Animated.ScrollView>
 *     {header}
 *   </View>
 * );
 * ```
 *
 * Render `header` *after* the scroll view: it is absolutely positioned, and tree
 * order is what puts it on top.
 *
 * A screen whose container already owns a scroll handler (Home's parallax hero)
 * passes `handlers` and `scrollRef` into that container instead of spreading
 * `scrollProps`. A full-bleed screen ignores `headerHeight` and lets its own
 * media run under the bar, which is what the site does with its hero.
 */
export function useBrooksHeader(options?: Options) {
  const { state, headerHeight, handlers, scrollProps, scrollRef } = useHeaderScroll();

  return {
    header: (
      <BrooksHeader
        actions={options?.actions}
        state={state}
        onLogoPress={options?.onLogoPress}
        hiddenStatusBarStyle={options?.hiddenStatusBarStyle}
      />
    ),
    headerHeight,
    scrollProps,
    handlers,
    scrollRef,
  };
}

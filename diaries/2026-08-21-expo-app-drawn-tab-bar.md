# App-drawn bottom tab bar with a sliding top rule

**Date:** 2026-08-21
**Agent:** Claude Opus 5
**System:** Expo
**Scope:** Replace `NativeTabs` with a JS tab bar — five tabs in Brooks sprite
glyphs, ink focus rule above the icon, sharing the color rail's motion.

## Outcome

`NativeTabs` is gone. `src/components/tab-bar.tsx` draws the bar over
`expo-router/js-tabs` (React Navigation bottom tabs), and
`src/components/tab-icon.tsx` supplies the glyphs. Five tabs: Home, Browse, Shoe
Finder, Cart, Profile.

Three real consequences beyond the visual:

- **Brooks icons reach the tab bar for the first time.** `#icon-cart`,
  `#icon-account`, and `#icon-search` (Shoe Finder) are sprite paths verbatim;
  Home and Browse stay hand-drawn because the sprite has no equivalent. The
  lime-fill/blue-text cart badge is back — the system badge forces white text on
  iOS, so it had been recolored to `blue`.
- **The four-tab ceiling is gone,** so Shoe Finder gets a tab again. Search
  traded its slot for it and became a pushed screen. It kept both its entry
  points (Browse header field, category header) and its native `Stack.SearchBar`,
  which works the same pushed as it did as a detached search tab.
- **Route restructure:** the shared array group went from
  `(index,shop,cart,account,search)` to `(index,shop,finder,cart,account)`, and
  the root-level `app/finder.tsx` was deleted. `search.tsx` stays a file in the
  group without being an anchor, so `/search` still resolves onto whichever
  tab's stack pushed it.

Evidence: `bun run typecheck` clean; verified on iPhone 17 Pro Max (iOS 27.0)
simulator.

## What worked well

- **Reusing the color rail's motion by importing it, not copying it.**
  `INDICATOR_MS` / `INDICATOR_EASING` are now exported from `underline-rail.tsx`
  and consumed by the tab bar. Same 200ms `cubic-bezier(.77,0,.175,1)`, so the
  tab rule and the swatch rule cannot drift apart later.
- **Native CSS transitions on Reanimated 4** were the whole animation: a
  `transitionProperty: ['transform']` style on an `Animated.View` with
  `translateX` derived from measured item frames. No shared values, no worklets,
  no gesture plumbing. Roughly ten lines for the indicator.
- **Git history as design documentation.** The deleted `src/components/tab-icon.tsx`
  from before the native-tabs migration still had the hand-drawn house path and
  the exact per-glyph `thicken` values that normalize the sprite's non-uniform
  line weights. `git show <sha>^:<path>` recovered work that would otherwise have
  been re-derived by eye.
- **Measuring the simulator's pixels instead of eyeballing screenshots.** Every
  geometry decision here (the rule's 6pt gap under the hairline, per-glyph sizes,
  the cart's 90pt dead space, the 200ms slide) came from reading rows and columns
  out of a scale-1.0 PNG with PIL, and from stepping the recorded slide frame by
  frame at 60fps to confirm the easing. Two of those defects were invisible in a
  downscaled screenshot, and one of my visual reads off the downscaled image was
  simply wrong — the rule looked like it had escaped the bar when it had not.

## Friction and blockers

- **I got the layout model backwards, and the API's own naming led me there.**
  `BottomTabView` renders each screen with `StyleSheet.absoluteFill`, so I
  concluded content sits *under* the bar and plumbed the measured bar height into
  six screens via a `useTabBarInset()` hook. Wrong: that fill is relative to a
  sibling container styled `screens: { flex: 1 }`, with the tab bar beside it in
  the same column, so a non-absolute bar shortens the screen instead of covering
  it. Every one of those additions double-counted ~85pt. The tell was visual —
  90pt of dead white between the cart's checkout button and the bar — and I only
  caught it because I measured the gap in pixels rather than accepting the
  screenshot. All of it was reverted. `absoluteFill` on a screen is a strong
  false signal for "overlay"; the truth is one style object away in
  `BottomTabView.js` and nowhere in the docs.
- **A custom `tabBar` silently loses behaviors that live on the tab button, not
  the navigator.** Tab switching (`CommonActions.navigate(route)` dispatched at
  `state.key`) has to be reimplemented, and pop-to-top on re-tap has to be
  written from scratch — React Navigation's own button does not even do that one.
  Worse, `navigation.dispatch(StackActions.popToTop())` from a `tabBar` is a
  no-op with no warning: actions bubble *up*, so it leaves the tab navigator for
  the root stack. It needs `target: <nested stack key>`, which is reachable only
  as an untyped `route.state.key`.
- **`Tabs` from `expo-router` is deprecated in favor of `expo-router/js-tabs`,**
  and the only place that says so is a `@deprecated` JSDoc tag in
  `build/exports.d.ts`. The SDK 57 router reference page documents `Tabs` without
  mentioning the subpath, and the JS-tabs guide was not where I looked first.
- **The router reference actively pointed the wrong way.** Asking the versioned
  `sdk/router` page whether `Tabs` supports a custom `tabBar` returned "no custom
  `tabBar` prop is explicitly documented" and recommended `expo-router/ui`
  headless tabs instead. It does support `tabBar` — it is React Navigation's
  bottom tabs — but the prop is inherited from `BottomTabNavigatorProps` and the
  generated reference expands that type into ~200 lines of unreadable
  `Omit<...>` intersections where the individual props are effectively invisible.
- Metro port 8081 was held by an unrelated project, so this ran on 8082 with
  `RCT_jsLocation`. Known, documented in project memory, cost a minute.

## What was hard

Choosing the navigator. Three options with non-obvious tradeoffs:

1. `expo-router/ui` headless tabs — `TabSlot` and the bar are flex siblings, so
   screens are laid out *above* the bar and no inset plumbing is needed at all.
   But it is marked experimental, and it interacts badly with shared array
   groups: `TabTrigger href` must resolve to exactly one route, so every href
   needs its group spelled out (`/(tabs)/(shop)/shop`).
2. React Navigation JS tabs — stable, and keeps `Tabs.Screen name="(index)"`
   identical to the `NativeTabs` wiring it replaces. Cost: every behavior that
   lives on the default tab *button* has to be rewritten.
3. Keep `NativeTabs` and accept four tabs — not what was asked for.

I took (2). The deciding factor was that the array-group clone stacks are the
load-bearing part of this app's routing, and (1) would have required rewriting
every tab's route reference in a form the docs themselves recommend against.
Worth noting that I chose (2) partly on a belief that turned out false — that it
would need inset plumbing (1) avoids. Both actually lay screens out above the
bar, so that consideration should not have counted at all; the routing argument
was the only one that mattered.

The second hard part was **which glyph means "Shoe Finder,"** and the answer was
decided by the indicator rather than by semantics. The sprite has no quiz or
discovery icon. I picked `#icon-filters` — the site's own three-bar funnel, which
reads as "narrow this down," exactly what the quiz does, and whose encoded weight
lands on the shared 2.2px target unaided. On device it failed: the funnel's top
bar is a 21px horizontal rule, the focus rule is an 18px horizontal rule 8px
above it, and together they read as a four-bar stack. The indicator stopped
indicating. **A tab bar with a rule above the glyph disqualifies every glyph whose
top edge is a long horizontal** — which is not a constraint I would have predicted
from either the glyph or the rule in isolation. Shoe Finder wears `#icon-search`
instead: a ring cannot be mistaken for a rule, and since Search is a pushed
screen the tab bar is the only place that glyph names a destination.

## Comparative friction

Not observed — this task has no Exact-app counterpart.

## Improvement ideas

- **`js-tabs` should carry its own reference page,** or `sdk/router` should link
  it from the `Tabs` entry. Right now the deprecation of the documented export
  lives only in a JSDoc tag, so a reader following the reference lands on the
  deprecated import.
- **Surface `tabBar` (and the rest of `BottomTabNavigationOptions`) on the
  generated `Tabs` reference.** The current output expands inherited generics
  into hundreds of lines of `Omit<...>` unions in which no individual prop is
  findable. A short "commonly used props" table would have saved the detour
  through `node_modules`.
- **Write down the custom-`tabBar` contract.** Three separate sharp edges here
  are discoverable only by reading `BottomTabView.js` / `BottomTabBar.js`, and a
  short "writing a custom tab bar" page would cover all of them: (1) a
  non-absolute custom bar shortens the screen — do NOT add its height as padding,
  despite the `absoluteFill` on each screen suggesting otherwise; (2) you must
  reimplement tab switching yourself, and the exact dispatch is
  `{...CommonActions.navigate(route), target: state.key}`; (3) if you want
  pop-to-top on re-tap you must target the nested stack's key, because an
  untargeted `StackActions.popToTop()` bubbles up and silently no-ops.
- **`useBottomTabBarHeight()` should warn, not guess.** With a custom `tabBar`
  that never calls `BottomTabBarHeightCallbackContext`, it returns a UIKit
  estimate for a bar it knows nothing about. A dev-mode warning would be more
  useful than a plausible wrong number.
- **A migration note for `NativeTabs` → JS tabs.** The two have genuinely
  different layout models — the native bar is edge-to-edge with content under it,
  the JS bar is a flex sibling — so padding that was correct under `NativeTabs`
  becomes over-padding, and vice versa. That difference is the main source of
  visual breakage in a swap like this and it is not written down anywhere.

## Follow-ups

- Shoe Finder and Search now share the magnifier (tab bar vs. the Browse header
  field). Defensible, but if it reads as duplication the fix is one line in
  `tab-icon.tsx` — the blocker is that the sprite has no better glyph and only 30
  of its 81 symbols are ported, with the rest behind Akamai.
- `minimizeBehavior="onScrollDown"` (the iOS 26 shrink-on-scroll the native bar
  gave for free) is not reimplemented. It would be a scroll-offset-driven height
  animation on the bar; worth doing only if the bar starts feeling heavy.
- Android has not been checked; the bar is platform-neutral but the hairline and
  52px row height were tuned against iOS.

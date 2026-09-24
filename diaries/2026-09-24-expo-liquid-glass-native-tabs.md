# Native tabs on Liquid Glass devices

**Date:** 2026-09-24
**Agent:** Claude Opus 5.5 (Claude Code)
**System:** Expo
**Scope:** Use `NativeTabs` where Liquid Glass is available; keep the app-drawn
`BrooksTabBar` everywhere else.

## Outcome

- `app/(tabs)/_layout.tsx` picks the bar once, from `NATIVE_TABS =
  isLiquidGlassAvailable()` in the new `utils/native-tabs.ts`. Glass devices get
  five icon-only `NativeTabs` triggers with SF Symbols (labels `hidden`, names
  kept as `accessibilityLabel`). Other devices get the
  unchanged JS bar. `expo-glass-effect` is now a direct dependency. It was
  already linked natively through `expo-router`.
- Screens clear the floating bar through `useTabBarOverlap()`. It is 0 under the
  JS bar, so that layout does not change. Changed: `Screen` / `ScreenScrollView`,
  Home, Browse, Browse search results, Cart (checkout bar and undo toast), and
  the Shoe Finder checkpoint.
- LLP 0003 has a new section, *Liquid Glass devices get the system tab bar*.
- Evidence: `bun run typecheck` clean. Verified on iPhone 17 Pro, iOS 26.5
  simulator: all five tabs, scroll ends on Home and Browse, the empty and
  one-item cart, search empty state with the keyboard up, search results, tint
  on light and dark glass, scroll-to-top on Home. The JS fallback was checked on
  the same simulator by forcing `NATIVE_TABS = false` for one reload (Home, Cart).
  Android and iOS 18 were not run.

## What worked well

- Reading `NativeTabsView.ios.js` and `RNSScrollViewHelper.mm` before writing
  any layout code. They showed the two facts the design turned on: each tab is
  wrapped in its own `SafeAreaProvider`, and the "automatic content insets"
  feature rewrites `never` to `automatic` on the first scroll view.
- Using `contentInset.bottom` for the overlap, not content padding. Caller
  padding kept its meaning, so no screen had to change what it passes.
- A module-constant switch made the fallback check cheap: flip one line, reload,
  look, flip back.

## Friction and blockers

- **iOS 27 simulators crash this build at launch.** The trap is in
  `_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`: the generated
  `Info.plist` has no `UIApplicationSceneManifest`. This is unrelated to the
  change and was there before it. Testing moved to an iOS 26.5 simulator.
- The only simulator with the app installed had a build older than
  `react-native-keyboard-controller`, so a full native rebuild (~5 min) came
  first. `expo run:ios --no-bundler` then opened the dev client on port 8081,
  another project's Metro, not on this workspace's 8091.
- `stim start` failed twice with `STIM_SUPERVISOR_EXITED`. Expo reported the
  supervisor's own port as busy and asked, non-interactively, to move to
  another port. I used a manual `expo start --port 8091` instead.
- `bunx expo install expo-glass-effect` installed 57.0.4 at the root and left
  `expo-router`'s nested 57.0.1. The pod is linked at 57.0.1. It works because
  `isLiquidGlassAvailable` is a native constant, but the next `pod install`
  will move the native version.

## What was hard

- **The two bars have opposite layout models.** The JS bar shortens the screen.
  The glass bar floats over it. One hook with two meanings (0, or the provider's
  bottom inset) covers both, but only if it knows it is inside a tab. The
  `SafeAreaProvider` bottom outside a tab is only the home indicator. That is
  why `InTabContext` exists, provided by the shared array-group layout.
- **`disableAutomaticContentInsets` is needed for correctness, not taste.** The
  name reads like an opt-out of a convenience. Here the default would have
  doubled every screen's top padding, because every screen already pads the top
  safe area itself.
- **Badge `hidden` is ignored when the badge has text.** An empty cart showed a
  "0" badge until the text was removed.
- **A fixed tint fails on glass.** Over Shoe Finder's navy panel the glass goes
  dark, and an ink selected tint almost disappeared. `DynamicColorIOS` follows
  the glass's appearance, but it throws off iOS, so it needs a platform guard
  in a module that loads everywhere.

## Comparative friction

Not observed. This task has no Exact-app counterpart.

## Improvement ideas

- **`NativeTabs.Trigger.Badge`: make `hidden` win over `children`,** or warn
  in dev when both are set. Today `hidden` works only without text.
- **Document what `disableAutomaticContentInsets` rewrites.** The docs call it
  "automatic safe area insets". In practice it changes
  `contentInsetAdjustmentBehavior` from `never` to `automatic` on the first
  scroll view in each screen of the tab's stack. An app that manages its own
  insets gets them twice with no warning.
- **Expose a "tab bar overlap" value from `NativeTabs`.** The skill says the bar
  height "cannot be measured programmatically". The per-tab `SafeAreaProvider`
  already carries it, but that is an implementation detail an app should not
  have to find in the source.
- **`expo install` for a package already nested under `expo-router`** could
  reuse the linked version, or say that it adds a second copy.
- **Expo prebuild on iOS 27** should emit a scene manifest, or `expo doctor`
  should flag its absence. The failure is a SIGTRAP at launch with no JS
  output.

## Follow-ups

- Add UIScene lifecycle support so the app launches on iOS 27.
- Scroll-to-top on re-tap does not reach Browse's scroll view. Home works. The
  JS bar never had scroll-to-top, so this is not a regression.
- `minimizeBehavior="onScrollDown"` is not on. It would leave a gap under the
  cart's checkout bar when the glass bar shrinks.
- The native tabs code runs against react-native-screens 4.25.2 native, but
  `expo-router` ships its own nested 4.27.0 JS. `expo install --check` expects
  ~4.26.0. It worked here; align the versions before relying on newer tab props.

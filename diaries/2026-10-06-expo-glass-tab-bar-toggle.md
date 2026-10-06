# Liquid Glass tab bar as a Profile toggle

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5 (Claude Code)
**System:** Expo
**Scope:** Add a Profile switch that turns the Liquid Glass tab bar on or off
on glass devices. The app-drawn JS bar is the default.

## Outcome

- `utils/native-tabs.ts`: the `NATIVE_TABS` constant is now `LIQUID_GLASS`
  (can the device draw glass?) plus a stored choice (`brooks.glassTabs.v1`)
  read through `useNativeTabs()`. The default is false, so every device opens
  on `BrooksTabBar`. `useTabBarOverlap()` reads the same store.
- `app/(tabs)/_layout.tsx` swaps `BrooksTabs` / `GlassTabs` live, then
  navigates back to Profile.
- Profile has a *Liquid Glass tab bar* switch on the guest pitch and the member
  screen. It is drawn only where `isLiquidGlassAvailable()` is true.
- The guest pitch scrolls on short screens now (see below).
- Follow-up request, same day: Browse wears the sprite magnifier and Shoe Finder
  a drawn shoe, on both bars (`tab-icon.tsx`; glass Browse is
  `magnifyingglass`). The first shoe draft was 12 units tall and read small
  next to the house and person in a full-resolution crop of the bar. I made it
  15.6 units tall. Previews came from `qlmanage -t` on a standalone SVG, which
  was faster than reloading the app for each draft.
- LLP 0003: new section *Liquid Glass is a Profile toggle*. The September
  section is marked superseded where it says "decided once at launch".
- Evidence: `bun run typecheck` clean. On an iPhone 17 Pro on iOS 26.5: the
  default is the JS bar; on and off both swap live with Profile still focused;
  the choice holds over an app restart, and the cold launch opens on Home; the
  member screen's scroll end clears the glass bar. On an iPhone SE (3rd
  generation) on iOS 26.5: the guest pitch scrolls and the button rests above
  both bars. Android and web were not run. There the row is not drawn, and the
  only change is that the guest pitch can scroll.

- Second follow-up, same day: the glass bar now shows the Brooks glyphs, not
  SF Symbols. `tools/tab-icons/render.js` writes PNGs to `assets/tab-icons/`.
  `NativeTabs` accepts only `VectorIcon` as a React element for `src`, so the
  react-native-svg glyphs had to become rasters. No rasterizer was installed
  (`rsvg-convert`, ImageMagick, `cairosvg` were all absent), but macOS `sips`
  reads SVG and keeps alpha. Checked on light and dark glass.

## What worked well

- `kv-storage` is synchronous, so the stored bar is the one the first frame
  mounts. There is no flash of the wrong bar at launch.
- `useSyncExternalStore` as the store, the same as `store/member.ts`. Every
  screen that calls `useTabBarOverlap()` re-renders with the bar.

## Friction and blockers

- Most of the time went to getting a runnable build, not to the feature:
  - The only installed copy of the app (on another session's simulator) had
    native `react-native-worklets` 0.10.1, and this checkout has JS 0.10.0. It
    aborted in `JSIWorkletsModuleProxy::toOptimizedObject` (a `jsi::Value::getString`
    assert) right after the bundle loaded, with no JS error.
  - The local `ios/` was older than `node_modules`. `pod install` failed on
    `ExpoModulesWorklets` and then other pods ("differs from the version stored
    in Pods/Local Podspecs"). After a fresh lock, Swift failed on
    `cannot find type 'ExpoReactNativeFactoryProvider'` in the old
    `AppDelegate.swift`. `expo prebuild --clean -p ios` fixed both.
  - The iOS 27.2 simulator still hits the scene-lifecycle SIGTRAP from the
    September diary (`_UIApplicationEvaluateRuntimeIssueForNoSceneLifecycleAdoption`).
    Testing moved to iOS 26.5.
- `expo run:ios` rejects `--port` together with `--no-bundler`, and then opens
  the dev client on 8081. I opened the 8093 URL by hand.
- `expo start` with `CI=1` turns off reloads, so Fast Refresh did not work
  until I restarted Metro without it.

## What was hard

- **A new navigator opens on Home.** Swapping the bar unmounts one navigator
  and mounts the other, so the reader lands off the screen that holds the
  switch. `initialRouteName` works for JS `Tabs`, but `NativeTabs` drops it: the
  prop is not in its types, and `NativeBottomTabsNavigator` does not pass it to
  `useNavigationBuilder`. A one-shot `router.navigate` in the layout's effect
  works for both.
- **`flexGrow` and the glass overlap.** The guest pitch needed to scroll on an
  SE. With `flexGrow: 1` the content fills the whole frame, which runs under the
  glass, so `contentInset.bottom` left the button under the bar at rest on the
  17 Pro. That screen takes the overlap as padding instead.

## Comparative friction

Not observed. This task has no Exact-app counterpart.

## Improvement ideas

- **`NativeTabs` should accept `initialRouteName`** like the JS `Tabs`, or say
  in its docs that it does not.
- **`expo run:ios --no-bundler --port N`** should open the dev client on port N,
  not reject the pair and fall back to 8081.
- **Native/JS version mismatch in worklets** should fail with a clear message.
  Today it is a C++ assert in a debug dylib.
- **`expo run:ios` could detect a stale `ios/`** (Podfile.lock pods that differ
  from `node_modules`) and suggest `prebuild --clean` before the CocoaPods error.

## Follow-ups

- The iOS 27 scene manifest is still missing (see the September diary).
- Toggling resets Profile's scroll position and any stacks pushed inside other
  tabs. That is acceptable for a settings switch. Keeping them would need the
  navigator state carried across the swap.

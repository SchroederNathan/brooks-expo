# Launch splash on Reanimated, Lottie removed

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5 (Claude Code)
**System:** Expo
**Scope:** Remove `lottie-react-native` and play the same launch splash with
Reanimated, matching the Lottie frame for frame.

## Outcome

- `components/animated-splash.tsx` draws the chevron with `react-native-svg`
  and moves it with one Reanimated playhead (0→60 frames, linear, 1000 ms).
  A worklet turns the frame into the SVG `matrix` of an animated `G`. The
  path, keyframes, cubic-bezier(0.5, 0, 0, 1) easing, 3.9% × 3.87% null
  scale, (40.5, 17) anchor and `#00388A` fill are copied from the Lottie JSON.
  `preserveAspectRatio="xMidYMid slice"` stands in for `resizeMode="cover"`.
- Removed `lottie-react-native` and `assets/lottie/brooks-splash.json`.
- LLP 0000: the Expo Go paragraph is marked superseded for the splash. New
  section *Splash animation*.
- Evidence, iOS 26.5 simulator (iPhone 17 Pro), before Lottie was removed: a
  temporary route rendered the Lottie with `progress = frame / 60`, then the
  SVG port at the same frame. Full-resolution screenshots (1206 × 2622) were
  compared for frames 0, 15, 30, 38, 42, 46, 50, 55 and 60:
  - 0, 15, 30, 42: only edge anti-aliasing differs (max channel delta ≤ 45).
  - 50, 55, 60: identical (both plain white).
  - 46: the only difference was the status bar clock changing minute.
  - 38 (fastest part of the scale-up): edges up to 1.6 device px (≈ 0.5 pt)
    apart.
- After removal: the debug simulator `.app` went from 167,352 KB to
  160,764 KB, and `EcommerceDemo.debug.dylib` from 65.3 MB to 58.6 MB. A
  release build was not measured.
- A screen recording of a cold load showed the shrink over 0.5 s, the sweep,
  then the fade to Home. Android and web were not run (no AVD on this machine;
  web does not mount the splash).

## What worked well

- The Lottie was small (one path, two animated transforms on one null), so a
  direct port was possible without a general Lottie interpreter.
- Lottie's `progress` prop plus a global state setter that `debugger-evaluate`
  could call gave exact, repeatable frames on both sides. No timing races.
- Animating `matrix` on the SVG group redraws the vector every frame. Scaling
  a `View` instead would rasterise the SVG once and blur it at 100×.

## Friction and blockers

- `node_modules` in the fresh worktree was partial (`react-native-svg` had no
  `package.json`). `rm -rf node_modules` left folders behind on the first try;
  a second clean install worked.
- `CI=1 expo start` disables Metro's file watcher, so edits were not served
  and the harness appeared to be missing. Start Metro without `CI`.
- `expo run:ios` with `CI=1` skips the dev server and opens the app on 8081 or
  8097, which other workspaces use. `--port` and `--no-bundler` cannot be
  combined.
- `ecomdemo://` deep links raise an "Open in …?" prompt and race with the
  route mount; driving state through `debugger-evaluate` was simpler.

## What was hard

- Getting the Lottie transform chain exactly right: precomp size, shape-layer
  133.33% scale, a non-uniform null scale, and the anchor all had to be
  multiplied into one matrix in the right order.
- The 0.5 pt edge offset on one frame most likely comes from Lottie's easing
  solver, not from the port. [inferred; not checked in lottie-ios]

## Comparative friction

Not observed.

## Improvement ideas

- `expo run:ios --port <n>` should also open the dev client on that port when
  `CI=1` is set, or warn that the dev server is skipped.
- `expo start` in CI mode could log once that file watching is off when a file
  under the project root changes.

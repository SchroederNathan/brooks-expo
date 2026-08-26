# Profile and fix the laggy home hero pull-to-stretch

**Date:** 2026-08-26
**Agent:** Claude Fable 5 (Claude Code)
**System:** Expo
**Scope:** Profile the home hero's pull-down stretch, remove the main-thread work, and try a header inset for the hero.

## Outcome

`StretchyParallaxScrollView` now animates transforms only. The media scales
about its top edge inside a fixed, oversized clip; the foreground lost its
animated style entirely because it moves with the following content in both
directions. [observed] Before: Instruments listed
`VideoView.safeAreaInsetsDidChange()` (131 ms, 108 samples) and
`LinearGradientLayer.display()`/`draw(in:)` (126 + 121 ms) on the main thread
during four pulls, all reached from `RCTMountingManager` layout-metric updates.
After: neither symbol appears in the hotspot list for the same gesture. The
Hermes profile was idle both times (1 React commit before, no hot commits).

A `topInset` prop was added and tried on Home so the video started under the
bar's lower edge. The user rejected it: the half-speed drift opened white space
between the bar and the media in too many scroll positions. Home reverted to
running the hero under the bar; the prop remains, default `0`.

## What worked well

Argent's paired React + native profiling made the split clear in one pass: the
JS thread was idle, so the lag had to be layout or drawing on the main thread,
and the native call chains named the two views paying for it.

## Friction and blockers

- Port 8081 again belonged to another project's Metro (speech-companion).
  Brooks ran on 8082; the dev-client launcher listed it as "Ecommerce Demo".
- `debugger-connect` needed the Metro `logicalDeviceId`, not the simulator
  UDID, because an Android emulator was also attached to the same Metro.
- The native report was ~76–198 KB of JSON and had to be sliced with Python.
- [observed] Both traces contain a train of ~1.25 s "hangs" at a fixed period
  with no gesture correlation (present before, during, and after the pulls).
  They look like a detector artifact under the simulator with the debugger
  attached, and were not used as evidence.
- `src/screens/home/index.tsx` was being edited concurrently by another
  session during this task (overscroll fill under the footer); those hunks were
  left alone.

## What was hard

Reasoning about which per-frame styles trigger layout. `height` and `top` go
through Yoga and re-mount layout metrics on every native child; `transform`
does not. A top-anchored stretch without a `height` change needs a
centre-scale plus a half-growth translate, and a clip that is already tall
enough to hold the stretched media.

## Comparative friction

Not observed.

## Improvement ideas

- Argent's `native-profiler-analyze` could return the summary tables first and
  keep call chains behind a drill-down; the default payload exceeded the tool
  result limit twice.
- A Reanimated lint that flags animating `height`/`width`/`top` on a view with
  native children (video, gradient) would have caught this at write time.

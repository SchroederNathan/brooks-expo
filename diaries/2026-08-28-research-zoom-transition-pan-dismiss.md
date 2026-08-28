# Zoom transition: pan-to-dismiss does not follow the finger

**Date:** 2026-08-28
**Agent:** Claude Fable 5
**System:** Research
**Scope:** Why dragging a zoomed screen (PDP opened via `Link.AppleZoom`) does not
move the screen with the finger. iPhone 17 Pro Max simulator, iOS 27.0,
expo-router 57.0.4, react-native-screens 4.25.2, RN 0.86.0.

## Outcome

[observed] The app uses the API from
https://docs.expo.dev/router/advanced/zoom-transition/ : `Link.AppleZoom`
(via `components/zoom-source.tsx`) on five sources and `Link.AppleZoomTarget`
on the PDP gallery. Push and non-interactive pop both zoom correctly.

[observed] One-finger drag on the zoomed PDP:
- The screen does not move, scale, or rubber-band while the finger is down.
- The vertical `ScrollView` does not bounce either, so some recognizer owns
  the touch.
- On finger release, a normal (non-interactive) zoom-out pop plays into the
  source tile (~0.25 s).
- Same result for a diagonal drag, a pure vertical drag, a drag that starts on
  the horizontal gallery `FlatList`, and a drag that starts below it.
- Same result with `fullScreenGestureEnabled: false` on `product/[id]`, so
  react-native-screens' iOS 26 `interactiveContentPopGestureRecognizer` path
  is not the cause. (Diagnostic edit reverted.)

[observed] Two-finger pinch on the same screen IS interactive: the PDP shrinks
with the fingers, follows them, and lands on the tile. UIKit's interactive
zoom therefore works in this app; only the pan recogniser fails to drive it.

[observed] No `[expo-router]` warnings in the JS console during these runs.
No newer expo-router 57.x (up to 57.0.17) changelog entry mentions zoom.

[inferred] Root cause is an interaction between UIKit's pan-based zoom
dismissal ("swipe down when scrolled to top", per Expo docs) and the React
Native `ScrollView` / react-native-screens screen view. Not pinned to a line.

## What worked well

- argent `screen-recording-start/stop` + `ffmpeg fps=4..20` contact sheets
  made the mid-gesture state visible; single screenshots could not.
- `gesture-custom` with long `delayMs` holds gave a controlled slow drag.
- Reading `node_modules/expo-router/ios/LinkPreview/LinkZoomTransition.swift`
  and `react-native-screens/ios/RNSScreenStack.mm` confirmed which gesture
  delegates exist.

## Friction and blockers

- Two apps were attached to Metro 8081; `debugger-connect` needed the
  `logicalDeviceId` of `com.exponathan.ecommercedemo`, not the sim UDID.
- WebFetch of `raw.githubusercontent.com` for expo/skills returned 404;
  `gh api ... -H "Accept: application/vnd.github.raw"` worked.
- `xcrun simctl ... log show` found no expo-router lines; JS warnings only
  reach Metro / the CDP console.

## What was hard

Distinguishing "gesture not recognised" from "recognised but not rendered".
The scroll view's missing bounce plus the pop on release show the pan is
claimed; the pinch shows the interactive machinery renders. Only the pan path
is broken.

## Comparative friction

Not observed.

## Improvement ideas

- Expo docs list "swipe down when scrolled to top" as an interactive dismissal.
  A note on `ScrollView` destinations (RN ScrollView pan vs. UIKit zoom pan)
  would set expectations, or a fix in expo-router / react-native-screens.
- A minimal repro (zoom target = plain `ScrollView`) filed against expo/expo
  with the pinch-vs-pan comparison video would help maintainers.

## Follow-ups

- Reproduce in a bare Expo SDK 57 app to confirm it is not Brooks-specific.
- Test on a physical iOS 18/26 device; only the iOS 27.0 simulator was used.

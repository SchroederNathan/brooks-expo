# PDP gallery on the stretchy parallax primitive

**Date:** 2026-08-28
**Agent:** Claude Fable 5
**System:** Expo
**Scope:** Reuse `StretchyParallaxScrollView` for the product detail gallery.

## Outcome

`src/screens/product/index.tsx` replaced its plain `ScrollView` with
`StretchyParallaxScrollView`. The horizontal gallery `FlatList` is the `header`;
the pagination dots are the `foreground`. `foreground` became optional on the
primitive. No new component was needed — the Home primitive already covered
both cases.

Verified on the iPhone 17 Pro Max simulator (iOS 27.0): a 200pt scroll moved
the title block ~141px (screenshot scale) and the shoe ~70px, so the photo
drifts at half speed and the title paints over it; the dots stayed with the
title; a horizontal swipe on the gallery still paged to image 2.

## What worked well

- The primitive's `foreground` layer is `pointerEvents="box-none"`, so a
  scrollable `header` keeps its gestures without any change.
- `useAnimatedRef<Animated.ScrollView>()` still exposes `scrollTo` for the
  "pick a size first" scroll, so the existing imperative code stayed as is.
- Fast Refresh applied the change; `tsc --noEmit` passed first try.

## Friction and blockers

- Two Metro servers for this project were up (8081 and 8082). The app was
  attached to 8081, and two dev apps share that Metro, so `debugger-connect`
  needed the `logicalDeviceId` from its error. The first
  `debugger-reload-metro` hit the wrong app (Clarity dev) before the right id
  was used.

## What was hard

Deciding where `Link.AppleZoomTarget` lives. It now wraps the gallery inside
the absolutely positioned media view. At push time the offset is 0, so the
target rect equals the layout frame; on pop after a scroll the rect is the
drifted photo, which is what is visible anyway.

## Comparative friction

Not observed.

## Improvement ideas

- Argent: `debugger-reload-metro` could refuse to reload when `device_id` is
  a UDID that maps to several CDP targets, instead of picking one.

## Follow-ups

None.

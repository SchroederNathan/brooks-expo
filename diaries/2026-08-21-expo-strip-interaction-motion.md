# Strip interaction motion ahead of overhaul

**Date:** 2026-08-21
**Agent:** Cursor Grok 4.6
**System:** Expo
**Scope:** Remove press, enter/exit, layout, and screen-transition animations; keep home parallax

## Outcome

Interaction motion is off across the app so a later overhaul can start from a still baseline. Home's stretchy parallax hero (`StretchyParallaxScrollView`) is unchanged. Press still fires haptics; `scaleTo` remains on the API but does nothing. Stack pushes, the login modal, and the PLP filter sheet now appear with `animation: 'none'`. Cart swipe-to-delete still tracks the finger because that is the gesture, not decorative motion. Splash Lottie and skeleton pulse were left as loading, not interaction.

## What worked well

A grep for Reanimated entering/exiting/layout plus `scaleTo` found every decorative call site. Shared `Press` and `Button` were the highest-leverage cuts.

## Friction and blockers

None. Reanimated stays in the app for parallax, splash fade-out, skeleton, and cart swipe.

## What was hard

Not observed. Distinguishing "interaction motion" from loading and from a required swipe transform was a judgment call, not a tooling problem.

## Comparative friction

Not observed.

## Improvement ideas

None specific to Expo. A future motion pass will reintroduce press and screen transitions from this still baseline.

## Follow-ups

Re-apply press, enter/exit, and navigation motion as part of the planned overhaul. Home parallax is already the reference for scroll-driven work.

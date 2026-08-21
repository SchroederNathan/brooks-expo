# Scroll-linked product gallery pagination

**Date:** 2026-08-21
**Agent:** Codex
**System:** Expo
**Scope:** Animate the PDP gallery indicator with Reanimated and extract it as a reusable component.

## Outcome

[observed] The product gallery now writes fractional horizontal page progress
to a Reanimated shared value. `AnimatedPaginationDots` consumes that value on
the UI thread, continuously transferring width and color from the outgoing dot
to the incoming dot during a swipe. System reduced-motion preference snaps the
indicator instead of morphing it.

## What worked well

[observed] `useAnimatedScrollHandler`, `SharedValue<number>`, and interpolation
made the component independent of the gallery's images and avoided React state
updates during scrolling. Expo SDK 57 already includes the compatible
Reanimated and Worklets packages with no configuration change.

## Friction and blockers

[observed] Port 8081 was already serving a different project, so the local iOS
build selected port 8083 for its verification bundle. This did not affect the
implementation, but an initial debugger check against 8081 could not prove that
the installed app contained the current source.

## What was hard

[observed] Bounce can produce page progress outside the valid range, so the
component clamps progress before measuring each dot's distance from the active
page. Endpoint screenshots also cannot establish whether a scroll-linked
animation is continuous; a 30 fps simulator recording was sampled frame by
frame to verify the intermediate widths.

## Comparative friction

Not observed.

## Improvement ideas

[inferred] A versioned Expo example for scroll-linked pagination would make the
UI-thread data flow easier to discover than the package's basic timing example.

## Follow-ups

None.

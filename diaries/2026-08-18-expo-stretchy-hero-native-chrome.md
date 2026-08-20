# Stretchy hero and native navigation chrome

**Date:** 2026-08-18
**Agent:** Codex
**System:** Expo
**Scope:** Reusable home hero overscroll, branded Stack toolbar, and progressive navigation blur

## Outcome

The home video now stretches during top-edge overscroll while remaining pinned
to the screen top. Native tab routes share a nested Stack whose leading toolbar
item is the Brooks wordmark; progressive blur backs the header without adding a
color scrim, while the native tab bar keeps only its system material.

## What worked well

Expo Router's array route groups let five tabs share one Stack layout without
duplicating route components. Reanimated's UI-thread scroll handler was enough
for the pull interaction, and Argent's slow settled swipe captured the stretched
state directly in the simulator.

## Friction and blockers

Fast Refresh preserved an old Shop scroll offset after its top inset changed,
which briefly made the new spacing look wrong. A full Metro reload proved the
clean-launch layout. The search-role tab also suppressed its toolbar until its
Stack screen set `headerShown: true` explicitly.

## What was hard

The stretch needed a fixed-height layout frame plus an overflowing absolute
header. Animating the header's layout height directly would have moved the next
section twice during UIScrollView bounce and opened a gap.

## Comparative friction

Not observed.

## Improvement ideas

Expo Router's native-tabs documentation could call out how a search-role tab
interacts with `Stack.Toolbar` and when `headerShown` must be explicit.

## Follow-ups

Verify Android's masked blur appearance on a running emulator when Android
visual QA is next in scope.

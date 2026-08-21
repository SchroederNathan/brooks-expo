# Sliding colorway underline

**Date:** 2026-08-21
**Agent:** Cursor Grok 4.6
**System:** Expo
**Scope:** Replace boxed selected-swatch borders with a reusable sliding ink underline on the catalog tile and PDP

## Outcome

`UnderlineRail` measures each child once via `onLayout` and moves a 2px ink bar with a Reanimated CSS transition (`transform` + `width`, 200ms ease-in-out). Catalog tiles and the PDP color rail share it. The first paint is un-animated so the line does not fly in from `x = 0`; reduced motion jumps. The PDP rail also scrolls the focused swatch toward center.

## What worked well

The animate-expo tab-indicator recipe plus the Reanimated 4 CSS-transition decision tree. Selection is a discrete A→B state change, so CSS transitions beat shared values — no worklet, no `scheduleOnRN`.

## Friction and blockers

None. Reanimated 4.5 is already in the app; this is the first CSS-transition call site after this morning's motion strip.

## What was hard

Arming the transition after the first layout. Without that, the underline animates from the origin on mount, which reads as a bug on every tile in a grid.

## Comparative friction

Not observed.

## Improvement ideas

Reanimated CSS transitions need an explicit "don't animate the first value" pattern. A `transitionDuration: 0` until measured is the workaround; it would be nicer if the first committed value were skipped automatically.

## Follow-ups

Feel-check on device: tap across the four tile swatches, then across a 16-color PDP rail (interrupt mid-slide, reverse, reduced-motion). Press-scale is still stripped; this indicator is a targeted exception, not the motion overhaul.

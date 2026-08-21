# Square PDP gallery

**Date:** 2026-08-21
**Agent:** Codex
**System:** Expo
**Scope:** Make every product-detail gallery page fill a screen-width 1:1 frame.

## Outcome

The PDP gallery height now equals the screen width, and its product photos use
Expo Image's `cover` fitting. Every carousel page therefore has an exact 1:1
viewport without client-side letterboxing.

## What worked well

Argent made the source of the layout issue visible: the gallery was 0.92 times
the screen width and used the shared `ShoeImage` default of `contain`. The Expo
SDK 57 Image reference made the intended clipping behavior of
`contentFit="cover"` explicit.

## Friction and blockers

The simulator restored the gallery on its final page and the outer scroll view
away from its top, so reproducing the portrait-image case required navigating
backward through the carousel. A CDN `sm=fit` versus `sm=cut` check produced
byte-identical square assets for the rear angle, confirming that its generous
white space is part of Brooks's square product composition rather than UI bars.

## What was hard

The shared `ShoeImage` default must remain `contain` for product tiles and color
swatches. The fill behavior therefore belongs at the PDP gallery call site.

## Comparative friction

Not observed.

## Improvement ideas

Add stable accessibility labels or test IDs to gallery pages so interactive QA
can identify the current product-photo angle without relying on pagination dots.

## Follow-ups

None.

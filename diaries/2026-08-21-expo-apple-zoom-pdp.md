# Restore stack push with Apple Zoom on PDP

**Date:** 2026-08-21
**Agent:** Cursor Grok 4.6
**System:** Expo
**Scope:** Drop `animation: 'none'` on the root stack; zoom the product-tile photo into the PDP gallery on iOS 18+

## Outcome

Root stack screens use the platform default transition again. Product tiles navigate with `Link` + `Link.AppleZoom` around the photo; the PDP gallery is a `Link.AppleZoomTarget`. Older iOS and Android keep the default push. Tab stacks still use `animation: 'none'`. Search and cart product rows still `router.push` (skinny list rows look unnatural as zoom sources per Expo's zoom-transition docs).

## What worked well

Expo Router's v57 Link API (`AppleZoom` / `AppleZoomTarget`) matches the documented gallery pattern. Wrapping a host `View` avoids Slot/ref issues with `ShoeImage`. Gallery size is known on first paint (`window` width × 0.92), which the docs call out as required.

## Friction and blockers

None. Zoom is iOS 18+ only and degrades without extra branching.

## What was hard

Choosing the zoom source: the whole tile vs the photo. The photo is the shared element; badges stay outside `AppleZoom` so they are not part of the morph.

## Comparative friction

Not observed.

## Improvement ideas

Expo's zoom docs should mention that `Link.AppleZoom` children must accept a ref (host views or `forwardRef`). Wrapping a custom image component silently drops native zoom props.

## Follow-ups

Search hits and cart line images still use the default push. Home parallax and stripped press-scale are unchanged.

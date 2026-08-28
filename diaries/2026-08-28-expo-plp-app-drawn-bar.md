# PLP: replace the native header buttons with Browse's outlined squares

**Date:** 2026-08-28
**Agent:** Claude Fable 5
**System:** Expo
**Scope:** Category (PLP) screen chrome — header buttons, control row, filters

## Outcome

The category screen no longer shows the Expo Router native header. It hides
the bar (`headerShown: false` on `category/[id]`) and draws its own row: a
`caretLeft` `OutlineIconButton` for back and Browse's `FilterButton` on the
right, the same 48pt squares Browse puts beside its search field. The collapsed
title fades in between them on the same 64pt scroll threshold. The chip control
row and the PLP's own `FilterSheet` are deleted; the PLP opens Search's
`/search-filters` form sheet and reads `store/search-filters`. `header.plain`
and `headerIcon.search` are removed. LLP 0003 records the change as superseding
the "native header" decision for the PLP only; the PDP keeps its native bar.

## What worked well

- `OutlineIconButton` already carried the shape, rule weight and press state,
  so the change was composition, not new styling.
- `useScreenTopPadding()` gave the bar the same safe-area rhythm as the
  headerless anchors without repeating `insets.top + gap`.

## Friction and blockers

- `header.ts` referred to a `bodyStrong` type step that did not exist in the
  ramp. Added `type.barTitle` (17pt Heavy) instead.
- The search sheet facets and counts from `candidates` in the store, which
  Browse's results set on mount. Because those results stay mounted under the
  pushed PLP, the PLP sets `candidates` on the button press instead.

## What was hard

Deciding how far the supersession goes. The LLP argued for the native bar on
both pushed screens; the PLP now leaves it while the PDP stays. The LLP marks
the PLP passage superseded and keeps the PDP rationale intact.

## Comparative friction

Not observed.

## Improvement ideas

- Hiding a native-stack header keeps the back gesture on iOS. The docs could
  state this plainly next to `headerShown`, since an app-drawn back button
  raises the question every time.

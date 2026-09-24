# PLP and sheets: custom header buttons become `Stack.Toolbar` items

**Date:** 2026-09-24
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** PLP chrome, `Filter & sort` form sheet, Run Club modal

## Outcome

The PLP shows the native bar again (`header.plain`). It has the system back
chevron and a `Stack.Toolbar.Button` for `Filter & sort`, and the filter count
is a native `Stack.Toolbar.Badge`. On iOS, the `Filter & sort` sheet and the
Run Club modal use the native bar (`header.sheet`) with the system `xmark` as a
toolbar button. Android still draws its own title and cross, because its form
sheet renders no stack header. I checked all of this on an iOS 26.5 iPhone 17
Pro simulator: back, collapsing title, filter badge after Apply, sheet close,
modal close. LLP 0003 records the change.

## What worked well

- `Stack.Toolbar.Button` accepts an `icon` prop and a `Stack.Toolbar.Badge`
  child together, so the count needed no custom view.
- Setting `headerTitle` through `<Stack.Screen options>` from the page brought
  back the 64pt title collapse in one line.

## Friction and blockers

- With the native bar, the form sheet does not inset its content. The first
  two sort rows sat under the bar until the `ScrollView` used
  `contentInsetAdjustmentBehavior="automatic"`.
- When the in-content head was removed, the list became the first native
  subview. react-native-screens then sized it to the whole sheet
  (`RNSScreen.mm`, first-subview walk), so the last rows scrolled under the
  footer. An empty first `View` fixes it.
- A fling had not settled when I read the tree, so the list end looked
  clipped when it was not. A slow `momentum: false` swipe gave a reliable
  reading.
- The worktree had no iOS 26 iPhone simulator. iOS 27 builds crash at launch
  (see memory), so I created one on iOS 26.5.

## What was hard

The first-subview heuristic in react-native-screens is invisible from JS. Any
change to the order of a sheet's children can move the scroll view into or out
of that chain.

## Comparative friction

Not observed.

## Improvement ideas

- Expo's modal docs could say that on iOS a form sheet with `headerShown`
  does not inset its content, and that a scroll view needs
  `contentInsetAdjustmentBehavior="automatic"`.
- react-native-screens could expose an explicit opt-out (or a marker) for the
  "size the first scroll view to the sheet" behavior, instead of relying on
  view order.

## Follow-ups

- Android is not tested. Its toolbar `icon` takes only image sources, so the
  PLP's SF Symbol filter button may show no glyph there. This was already
  true for the PDP share button.

# Shop the look sheet fits its content

**Date:** 2026-10-09
**Agent:** Claude Code (claude-opus-5-5)
**System:** Expo
**Scope:** Make the PDP's `Shop the look` form sheet as tall as its content
instead of a fixed `0.92` detent.

## Outcome

`src/app/_layout.tsx` now gives `shop-the-look` the detent
`'fitToContents'`. `src/screens/product/shop-the-look-sheet.tsx` lost its
`flex: 1` root, caps its height at 0.92 of the screen below the status bar,
and puts the footer in the layout flow instead of floating it over a list
padded by the footer's measured height. LLP 0003#shop-the-look records the
behaviour and the measurements.

Evidence (iOS 26.5, iPhone 17 Pro simulator, Metro 8094): `bun run typecheck`
clean. With four checked rows the sheet stops at the cap and the list scrolls
to a last row that clears the button. Unchecking rows and the one-row
`Added to your bag` state shrink the sheet. `Add N to bag` and
`Keep shopping` take taps. A recording of the opening showed one slide up to
the final height. Android was not run (no AVD on this machine).

## What worked well

- Argent's `native-find-views` gave the frames that explained the extra
  height: `RNSModalScreen` 765pt, `RNSScreenContentWrapper` 677pt, the
  sheet's `UINavigationBar` 54pt at y 16, and the 0.96 scale transform on the
  floating sheet's `UIDropShadowView`. Screenshots alone gave numbers that
  were off by that scale.
- A temporary fixed cap (400pt) made the sheet-versus-content difference easy
  to read.
- Reading `react-native-screens` source (`RNSScreenContentWrapper.mm`,
  `RNSScreen.mm`) showed where the bar's height is added and that the detent
  is clamped to `maximumDetentValue`.

## Friction and blockers

- The worktree had no `node_modules` and no build of its own; the only
  DerivedData build belonged to another worktree and was incomplete. A fresh
  `expo run:ios` on a new simulator was needed.
- The first deep link opened the dev launcher's server list, with a second
  `Ecommerce Demo` Metro (8095) from another session listed beside this one.

## What was hard

- With a native header in a form sheet, react-native-screens adds the bar's
  frame height to the measured content, and UIKit adds the bottom safe area
  to a custom detent. This sheet's content already starts under the bar and
  pads for both, so the sheet was 88pt taller than its content. The fix is a
  negative bottom margin. `useHeaderHeight()` (70pt) is not the bar's frame
  height (54pt): it also counts the 16pt gap under the grabber, so the
  compensation leaves the sheet 16pt shorter than the view.
- On iOS 26 a sheet below the large detent floats and is scaled by about
  0.96. Pixel measurements need that factor.

## Comparative friction

Not observed.

## Improvement ideas

- Expo Router docs: say that with `fitToContents` and a visible header on
  iOS, the sheet's height is the content plus the bar plus the bottom safe
  area, and that content which pads itself under the bar is counted twice.
- react-native-screens: expose the measured sheet height (or the added
  errata) to JS, so a screen can fit itself without hard-won constants.

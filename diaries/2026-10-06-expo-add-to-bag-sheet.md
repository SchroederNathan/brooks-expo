# Add-to-bag: the purchase button grows into a sheet

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** `src/screens/product/added-sheet.tsx`, `src/screens/product/also-like.ts`,
`src/screens/product/index.tsx`, `src/components/button.tsx`,
`src/theme/shadows.ts`, LLP 0003

## Outcome

The PDP's sticky bar lost its white panel, hairline and shadow; the page fades
to white behind the button. Pressing `Add to cart` now grows the button into an
`Added to your bag` sheet (added line, `Keep shopping` / `Bag (n)`, and a
`You might also like…` rail), replacing the dark toast. Closing folds it back
into the button; a downward drag slides it off. `tsc --noEmit` passes.

Checked on a dedicated iPhone 17 Pro simulator (iOS 26.5, Debug dev client on
Metro port 8097): open, `Keep shopping` fold, drag dismiss, a rail tile opening
that product's PDP, and `Bag (n)` switching to the Cart tab. Screen recordings
were cut into frame strips to check each motion.

## What worked well

- Reanimated shared values let the PDP's sticky bar and the sheet read one
  `progress` value, so the bar's fade and the shell's growth stay in step with
  no React renders.
- Recording the simulator at 30fps and diffing consecutive frames (PIL) found
  the motion segments without guessing timestamps.

## Friction and blockers

- Every booted simulator belonged to another session. Copying the existing
  dev-client `.app` onto a fresh simulator and running Metro on a free port
  avoided a native build.
- The first deep link into the dev client showed the launcher; the bundle was
  in fact loading. The launcher view does not say it is connecting.

## What was hard

- Clipping. The first version drew the content as a sibling over the shell,
  so it showed outside the shell before the shell finished growing (caught in
  user review). Making the shell an `overflow: hidden` container and pinning
  the content to the screen by undoing the shell's offsets fixed it.
- Exits. `Bag (n)` and the rail tiles first unmounted the sheet and navigated
  in the same tick, so the sheet vanished (also caught in user review). They
  now fold into the button and navigate once the fold lands (an animated
  reaction at under ~2pt of travel). Waiting for the spring's completion
  callback cost about 200ms of sub-pixel creep: 573ms from tap to navigation,
  against 322ms now.
- The transparent native header sits above RN content, so an overlay view
  cannot dim it. A transparent RN `Modal` covers it.

## Comparative friction

Not observed.

## Improvement ideas

- An Expo Router or `@expo/ui` primitive for "a sheet that grows out of its
  trigger" (iOS zoom-style presentation for sheets) would remove the
  hand-built shell.
- The dev-client launcher could show "Connecting to <url>…" when opened by a
  deep link.

# Capture Brooks's real icon set and adopt it via react-native-svg

**Date:** 2026-08-17
**Agent:** Claude Fable 5
**System:** Expo
**Scope:** Replace hand-drawn/text-glyph icons with the site's own SVG icons

## Outcome

Captured brooksrunning.com's inline SVG sprite (81 symbols) with a warmed
Playwright Chrome session — the same Akamai workaround `tools/harvest` uses —
and ported 34 glyphs verbatim into `src/components/icons.tsx` (`BrooksIcon`
registry + `InfoIcon` + `CushionMeter`). Adopted across the app:

- `BrooksWordmark` now renders the real `#icon-logo` paths, replacing the
  hand-traced approximation its own doc comment asked to be replaced.
- Tab bar: finder/bag/account tabs use the site's real search/cart/account
  header glyphs; home and shop stay hand-drawn (no site equivalent exists).
- `Stars` renders the site's three-state border-star instead of ★ text.
- `Squiggle` renders the real `icon-squiggle-1` geometry instead of a flat bar.
- All text-glyph icons (`‹ › ✕ ✓ ⌕`) across home, shop, category, product,
  search, account, login, and finder screens replaced with real glyphs.

Verified on the iPhone 17 Pro simulator: tab bar, shop rows, category grid
(full/half/empty stars at 4.0/4.5/5.0), PDP back caret, account rows, and the
search screen (input glyph, clear ✕, result carets). `tsc --noEmit` clean.

**Weight normalization (same day, after user feedback).** The sprite's glyphs
encode different native line weights (search ring ≈1.9 viewBox units, cart
≈1.3, account ≈1.4), so equal render sizes read as unequal stroke widths.
Fills cannot be thinned, but they can be fattened: `BrooksIcon` gained a
`thicken` prop that strokes the fill in the same color by N rendered pixels.
Applied: cart +0.85 and account +0.6 in the tab bar to match search's ≈2.2px;
hand-drawn home/shop now stroke at a constant 2.2 (active state is color-only,
like the real icons); in-screen chevrons and the clear ✕ moved from 12 to
14px, and the login checkmark thickened +0.7, landing everything near ≈1.6px.
Verified with full-resolution screenshot crops of the tab bar, shop rows, the
search input, and the login modal.

## What worked well

- The Akamai finding in LLP 0002 made the capture path obvious: no time lost
  trying `curl`/WebFetch against a 403 wall. A ~90-line Playwright script
  (homepage + PLP + PDP, extract every `<svg>` with ancestor labels) got the
  entire icon system in one pass because SFRA inlines the sprite in the header.
- `react-native-svg` accepted every captured construct (evenodd/nonzero fill
  rules, `Polygon` with SVG transform strings, stroked paths) without rework.
- Argent loop (restart-app → debugger-reload-metro → component-tree → tap →
  screenshot) verified 6 screens quickly; `debugger-component-tree` showed the
  `BrooksIcon` nodes directly, confirming adoption rather than inferring it
  from pixels.

## Friction and blockers

- The sprite's symbol ids appear in inconsistent attribute order
  (`id` before/after `viewBox`), which broke the first extraction regex;
  `icon-filters` was reported missing until the regex was loosened.
- One RN API slip: `StyleSheet.absoluteFillObject` does not exist in RN 0.86's
  types (`absoluteFill` does). Caught by typecheck.
- A stale `describe` (AX) tree after navigation caused one mis-tap that opened
  a PDP instead of a tab. Component-tree re-discovery per screen avoided a
  repeat.

## What was hard

- Animated icon color: the home header glyph tinted via animated `color` on a
  `Text`. SVG `fill` can't take a Reanimated color directly, so the icon is
  stacked twice (ink under surface) with animated opacity — worth knowing as
  the standard pattern for theme-crossing SVG icons.
- Judgment calls, not mechanics: which of 81 symbols are Brooks's design
  language vs. third-party (TurnTo's 40-symbol sprite was excluded), and what
  to do about tabs with no site equivalent (kept hand-drawn, documented).

## Comparative friction

Not observed — this task did not touch the Exact app.

## Improvement ideas

- An `svg-to-react-native-svg` transform (attribute casing, `<g>` flattening,
  class/style stripping) would remove the manual conversion step; the manual
  pass is where transcription errors could creep in.
- `debugger-component-tree` was more reliable than `describe` for RN tap
  targets after navigation; the argent docs could steer RN users there harder.

## Follow-ups

- `icon-star-half`'s two-tone colors (`#d3d0cd`/`#0363f7`) and the megaphone /
  envelope illustrations were not ported; add them if a screen needs them.
- The captured raw sprite lives only in the session scratchpad; re-capture is
  cheap if more glyphs are needed (script pattern documented in LLP 0003).

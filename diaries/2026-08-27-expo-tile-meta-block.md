# Product tile meta block matches the site

**Date:** 2026-08-27
**Agent:** Claude Opus 5
**System:** Expo
**Scope:** Restructure `ProductTile`'s text block to the site's order and
content, from a human-supplied crop of a live Ghost Amp tile.

## Outcome

The tile's text block was title / `Balanced cushion · White/Black` / price /
`4.5 (60)`. The site's is title / price / `Men's - Road Running, Walking` /
`Widths - Medium, Wide` / `(60)`. It now matches.

Three changes fell out of the reference image beyond the reordering:

- **Prices print cents.** `fmt()` and `formatPrice()` both stripped `.00`.
  LLP 0002's captured `Cart-AddProduct` payload carries `"$200.00"`, so the
  site formats money with cents everywhere, not just on the tile. Both
  formatters changed, which moved the PDP price and the add-to-cart bar too —
  wider than the tile, but leaving them split would have shown `$150.00` on the
  grid and `$150` one tap later.
- **The rating line drops the average.** The tile shows `(60)` alone. `Stars`
  gained a `summary: 'rating' | 'count'` prop; the PDP keeps `4.4 (280)`.
- **The separator is a hyphen**, not the en dash LLP 0003 recorded from the
  earlier full-page capture.

Two divergences from the site, both forced by the phone: the widths line and
the rating are hover-only on the site and show at rest here, and the meta lines
wrap to two lines on the ~175pt grid tile (they fit on one at the 244pt home
rail).

Verified on the iPhone 17 Pro Max simulator via Fast Refresh: `/category/
mens-shoes-road-running-shoes`, the home New arrivals rail, and the Ghost 18
PDP.

## What worked well

The catalog snapshot made the derivation checkable in one shot. A throwaway
`bun run /tmp/check.ts` importing the real `labels.ts` against `catalog.json`
confirmed all 37+ shoes resolve both meta lines and that apparel resolves
neither, before the app was ever reloaded. Running the app's own TS directly
with `bun` — no build step, no test harness — is the cheapest verification
loop in this repo.

Fast Refresh over the already-running dev client made the two layout
iterations (one line vs. two) about 20 seconds each.

## Friction and blockers

The reference crop was 229x141, small enough that the hyphen-vs-en-dash and
`$180` vs `$180.00` questions were unreadable. `sips -z` to upscale 4x settled
both. `sips --cropOffset` did not crop where expected (it returned the title
when asked for the meta line), so the whole-image upscale was the reliable move.

`launch-app` on the already-installed dev client came up white and stayed
white for two minutes; `await-ui-element` timed out at 90s against an empty
accessibility tree. The fix was the recorded one — re-open the dev-client deep
link at `localhost:8082` — after which the same selector matched in 107ms. The
white screen was the launcher failing to pick a bundle URL, not a slow splash.

## What was hard

**Brooks has no activity field.** The card's `Road Running, Walking` looks like
product data and is not. `bestFor` is the obvious candidate and is wrong — for
Ghost 17 it reads `["Balanced support", "Everyday running", "Walking"]`, which
is marketing copy in a different vocabulary. The activity *is* the shop
category, so the line has to be derived from the `mens-shoes-road-running-shoes`
Constructor group ids. That also means the reading order has to be imposed
(group order is arbitrary: Addiction GTS 15 lists walking before road running).

Width availability varies per colorway, so the honest set is "stocked in any
colorway", falling back to the full range when nothing is stocked. Ghost 17
men's lists Medium/Wide/Extra Wide but stocks only Medium and Wide — the
filtered line reads `Widths - Medium, Wide`, which is what the site shows for
the same shoe.

## Comparative friction

Not observed.

## Improvement ideas

`sips --cropOffset` silently cropping the wrong region cost a round trip. For
agent work on screenshots, a crop that names its origin explicitly (or an
error when the rect leaves the image) would be worth more than the current
tolerant behaviour.

## Follow-ups

The tile lost its `cushion · colorway` line. The colorway name is now only
inferable from which swatch is underlined; if that reads as a regression in
use, the swatch rail may need a label.

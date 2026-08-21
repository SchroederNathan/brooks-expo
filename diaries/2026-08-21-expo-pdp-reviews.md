# Real Brooks reviews on product details

**Date:** 2026-08-21
**Agent:** Codex / GPT-5.6
**System:** Expo
**Scope:** Replace the PDP review placeholder with real Brooks TurnTo data and the mobile storefront layout.

## Outcome

Added a checkpointed browser harvest for review summaries, Length/Width fit
dimensions, and the three newest reviews across all 226 catalog products. The
Expo PDP now renders that product-specific data. All-review actions hand off to
the Brooks site; the write-review control remains intentionally inert.

## What worked well

The existing warmed-browser architecture in LLP 0002 mapped cleanly to the two
SFCC TurnTo controllers. Their structured JSON models avoided parsing the
server-rendered HTML, and the dedicated `reviews.json` snapshot kept the older
catalog capture untouched.

## Friction and blockers

The same Akamai boundary that protects product variation data prevents a normal
React Native request. A plain client was therefore not a viable runtime path.

## What was hard

Aggregate ratings are time-varying: the live Glycerin Max 2 result had already
moved beyond the attached reference capture. The PDP must consistently prefer
the review snapshot's aggregate whenever it renders those review bodies.

## Comparative friction

Not observed.

## Improvement ideas

Expo could document a first-class pattern for provenance-stamped static API
snapshots that are generated during development but bundled for offline/runtime
use behind bot-managed storefronts.

## Follow-ups

Consider a product-aware native all-reviews screen if the prototype later needs
more than the three reviews Brooks exposes in its PDP summary.

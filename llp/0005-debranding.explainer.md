# LLP 0005: De-branding for App Store Review

**Type:** Explainer
**Status:** Active
**Systems:** Expo App, Data, Design
**Author:** Claude Opus 5
**Date:** 2026-08-24
**Related:** LLP 0000, LLP 0002, LLP 0003

## Summary

[observed] Apple rejected the TestFlight submission under App Store Review
guideline 4.1(a) — Copycats. The rejection was correct. This document records
what the app was carrying, what replaced it, and which earlier LLPs are now
describing removed code.

The work lives on the `debrand` branch. `main` keeps the branded build for
internal use, where TestFlight needs no Beta App Review.

## Why the rejection was right

[observed] The rejection text cites three example factors, and the app met all
three: metadata creating a misleading association, third-party references, and
"copying the content, features, and user interface of popular apps."

What the binary actually contained:

| Item | Source |
|---|---|
| App name `Brooks`, scheme `brooks` | `app.json` |
| The wordmark, path-for-path | Their inline SVG sprite (LLP 0003#icons-and-the-logo) |
| 34 UI glyphs, path-for-path | The same sprite |
| Two PDP shoe diagrams | Their standalone SVG assets |
| Filson Pro, five weights | Licensed Monotype OTFs, bundled |
| The palette, including `#003789` and `#ECF000` | Their production stylesheet (LLP 0003#brand) |
| Square-cornered chrome | A deliberate trait of their brand |
| 226 product names, 54 franchise names | The harvest (LLP 0002) |
| Marketing copy, brand heritage, a named athlete | The harvest |
| 4,894 photo URLs | Their Demandware image CDN |
| 624 reviews by 557 named people | Their TurnTo controllers |
| A live query with their client-side search key | `ac.cnstrc.com` |
| A campaign video and lifestyle crops | Bundled in `assets/home/` |

[inferred] The single most identifying element was the photography, not the
name. Their shoes are recognisable, so renaming products while still streaming
their product shots would have failed again.

## What replaced it

[observed] `tools/debrand/` is a transform, not a manual scrub. This matters
because the catalog is re-harvested: a hand-edited JSON file would be silently
undone by the next `bun run harvest`, and nobody could audit what had changed.
The replacement vocabulary is data in `tools/debrand/names.js`, so the whole
substitution is readable in one file.

Pipeline order is load-bearing — **harvest → debrand → sync**:

```sh
bun run harvest                 # optional; re-captures the source snapshot
node tools/debrand/debrand.js   # catalog
node tools/debrand/reviews.js   # reviews
python3 tools/debrand/icons.py  # launcher icons
bun run sync                    # packages/catalog -> assets/ + src/data/
```

[observed] Running `sync` straight after `harvest` re-introduces the branded
data. `packages/catalog` is the source of truth and the transform rewrites it in
place, so the de-branded state is what gets copied — but only if `debrand` ran.

### Decisions worth recording

[observed] **Descriptions are generated, not rewritten.** Token-swapping left
sentences like "first launched in 1976" and a named ultrarunner intact. Those
are third-party facts, and the prose is copyrighted whether or not the brand
name survives in it. `tools/debrand/copy.js` composes copy from `cushion` /
`support` / `experience` / `bestFor` instead, and signs each description as
demo data.

[observed] **Colourways became the swatch.** The app draws each colourway from
the colours its name describes, so the `images` array keeps one entry per
original photo and the PDP gallery, thumbnail rail, and pagination dots all
still work against real counts. Recognised colour words use real hex; the ~250
marketing names ("Spellbound", "Nightlife") hash to a stable hue, so the
transform is complete without curating a 330-entry table.

[observed] **Colourway names are regenerated from the stops, not edited.** That
guarantees the label always matches what is drawn, and that no brand colour
name can survive.

[observed] **Ratings, prices, and stock were kept.** They are numbers, not
expression or marks, and they make the review and size UI exercise real
layouts. Flagged here because it is a judgement call rather than an oversight.

[observed] **The palette and corner radius changed too.** 4.1 names user
interface alongside name and icon. Matching a distinctive treatment for no
reason is the kind of detail that makes two apps look like one, so the navy and
lime became teal and amber, and `radius.sm` went from 2 to 4.

[observed] **Search stayed the same shape.** `constructor.ts` still exports
`search`, `autocomplete`, `SearchHit`, `Suggestions`, and `setInstallId`, so the
search screen kept its structure including the "index unreachable" fallback.
Only the implementation moved on-device.

[observed] **The app now makes no image requests.** Removing the CDN removed
`expo-image`; removing the campaign video removed `expo-video`; drawing the
splash removed `lottie-react-native`.

## Superseded guidance

[observed] These sections describe code this branch deleted. They remain
accurate as history and as an account of how the data was obtained.

- **LLP 0002** — `#constructor-io`, `#image-cdn`, `#turnto-reviews`. The live
  search client, the CDN sizing helpers, and the harvested reviews are gone.
  `#normalized-schema` and `#variant-id` still hold: the schema and the variant
  id format are unchanged.
- **LLP 0003** — `#brand`, `#icons-and-the-logo`, `#the-header-collapses-on-scroll`
  (the chrome description only), `#editorial`. The tokens, the sprite, the
  logo, and the home feature are all replaced. The screen *patterns* still
  hold; only their brand attribution is void.
- **LLP 0000** — `#live-brooks-data`. Nothing is live any more.

[inferred] Neither LLP is tombstoned, because the reasoning about native
commerce patterns — what a PDP owes a shopper, why width sits at equal rank
with size — is independent of whose catalog filled it.

## Open questions

- [observed] `tools/harvest/` still targets the real storefront. It is the
  provenance record for the snapshot's shape, so it is kept, but on this branch
  it is a footgun. See the pipeline order above.
- [inferred] The invented family names in `names.js` were checked informally
  against known running-shoe models. They are not trademark-cleared, which is
  fine for a demo and would not be if the app ever sold anything.

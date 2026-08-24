# Ecommerce Demo

A native mobile commerce demo built with Expo SDK 57 — home feature, product
listing and detail, a shoe-finder quiz, live search, and a cart. The point is
the interface: what a genuinely native shopping experience can feel like on a
phone.

Everything in it is synthetic. There is no store behind it, no network calls to
anyone's API, and no third-party imagery, copy, or branding.

## Running the app

```sh
bun install
bun run ios       # expo run:ios — build + launch on the iOS simulator
bun run android   # expo run:android — build + launch on the Android emulator
bun run start     # Metro only; press i / a
bun run web       # run in a browser
```

## History, and why the data looks the way it does

This started as a prototype of a specific retailer's storefront, built from a
snapshot of their real catalog. Submitted to TestFlight, it was rejected under
App Store Review guideline 4.1(a) — Copycats — which was the correct call: the
app carried their name, logo, typeface, palette, product names, photography,
customer reviews, and a live query against their search index.

`tools/debrand` is the transform that removed all of it, and it is checked in so
the result is reproducible rather than a one-time manual scrub:

```sh
node tools/debrand/debrand.js   # catalog: families, copy, colourways, images
node tools/debrand/reviews.js   # reviews: titles, bodies, authors
python3 tools/debrand/icons.py  # launcher icons
bun run sync                    # copy packages/catalog into assets/ + src/data
```

What each piece does:

| Was | Now |
|---|---|
| Retailer name, logo, licensed typeface | Generated mark, Archivo (OFL) |
| Their palette and square-cornered chrome | Own teal/amber palette, rounded |
| 226 real product names, 54 franchises | Invented families (`tools/debrand/names.js`) |
| Marketing copy, brand heritage, an athlete | Copy generated from product attributes |
| 4,894 photos from their image CDN | Colourway swatches, drawn on device |
| 624 real customer reviews, 557 real names | Generated reviews and initials |
| Live query to their search index | On-device search over the bundled catalog |
| Icon set lifted from their SVG sprite | 34 glyphs drawn for this project |

`brand.config.js` holds the app's identity — display name, bundle identifier,
Android package, scheme — in one place, so a swap is a single-file edit. The
bundle identifier is deliberately brand-neutral, because it cannot be changed
once a build is uploaded.

## Project structure

```
src/
  app/          # expo-router routes only (thin files)
  screens/      # screen bodies the routes render
  components/   # shared primitives (button, chip, product-tile, swatch, …)
  data/         # generated copies of packages/catalog + editorial content
  store/        # cart + membership (expo-sqlite key-value storage)
  theme/        # design tokens: colors, spacing, typography, radius, shadows, motion
  utils/        # kv-storage, haptics, price formatting
packages/catalog/   # source of truth for the data layer
tools/debrand/      # the de-branding transform
tools/harvest/      # the original catalog harvester, and `sync`
llp/                # design rationale (Linked Literate Programming)
diaries/            # AI-agent development diaries
```

`packages/catalog` is the source of truth. The copies under `src/data/` and
`assets/catalog.json` are generated — edit the package, not the copy.

## Scope

Browsing, product detail, variant selection, search, the finder quiz, and a
device-local cart. Checkout, payment, and placing an order are out of scope and
the UI says so.

## Project documentation

The project uses [Linked Literate Programming](https://github.com/ccheever/llp)
to keep code connected to design rationale. Note that LLP 0002 and 0003
document the original prototype's data and design sources; they describe what
this branch removed.

- [LLP 0000](./llp/0000-brooks.explainer.md) — product and system entry point
- [LLP 0001](./llp/0001-mobile-shoe-commerce-design.research.md) — benchmarks and rubric
- [AGENTS.md](./AGENTS.md) — working instructions for AI agents

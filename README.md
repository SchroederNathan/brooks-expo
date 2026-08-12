# Brooks Mobile Commerce Prototype

An exploration of what a best-in-class native shopping experience for
[Brooks Running](https://www.brooksrunning.com) could feel like, built with
Expo SDK 57. Ported from a research monorepo into this standalone repository;
the design goal is unchanged: distinctively native, refined, and compelling
enough to show Brooks executives why Expo is a strong foundation for their
mobile app.

| | |
|---|---|
| ![Home](./docs/expo-home.png) | ![PDP](./docs/expo-pdp.png) |

More screenshots in `docs/`: PLP, cart, shoe finder, live search.

## Running the app

```sh
bun install
bun run ios       # expo run:ios — build + launch on the iOS simulator
bun run android   # expo run:android — build + launch on the Android emulator
bun run start     # Metro only; press i / a, or scan with Expo Go
bun run web       # run in a browser
```

The app boots through an animated Brooks splash into the Project 222 home
screen, with real Brooks products throughout. Search is live against Brooks's
own Constructor.io index; everything else works offline from the bundled
snapshot. It targets Expo Go as well as dev builds.

## The one thing to know about the data

[LLP 0002](./llp/0002-brooks-commerce-api.research.md) is the load-bearing
document. In short:

**brooksrunning.com is behind Akamai Bot Manager and returns `403` to every
non-browser HTTP client.** An app cannot call its product or cart APIs at all.
Two Brooks surfaces *are* open to a phone, and the architecture follows from
that:

- **Live:** Constructor.io search (`src/data/constructor.ts`) and the Brooks
  image CDN, which resizes on demand — so the app streams real Brooks
  photography.
- **Snapshotted:** products, prices, and per-size stock, captured by
  [`tools/harvest`](./tools/harvest) driving a real browser session, committed
  as `packages/catalog/catalog.json`.

The full journey — browse → product → variant → **add to a real Brooks cart** —
was driven end-to-end against the live endpoints and is documented in LLP 0002.
No order was placed. The in-app cart is device-local and builds the real Brooks
variant ids.

## Project structure

```
src/
  app/          # expo-router routes only (thin files)
  screens/      # screen bodies the routes render
  components/   # shared primitives (button, chip, product-tile, …)
  data/         # generated copies of packages/catalog + editorial content
  store/        # cart + Run Club membership (expo-sqlite key-value storage)
  theme/        # design tokens: colors, spacing, typography, radius, shadows, motion
  utils/        # kv-storage, haptics, price formatting
packages/catalog/   # source of truth for the data layer
tools/harvest/      # captures the catalog from brooksrunning.com (Playwright)
llp/                # design rationale (Linked Literate Programming)
diaries/            # AI-agent development diaries
```

Design tokens keep the values read out of Brooks's own production stylesheet
([LLP 0003](./llp/0003-brooks-design-system.research.md)) in the
expo-design-system file layout. Code links back to rationale with
`@ref LLP NNNN#section` comments.

## Re-harvesting the catalog

```sh
cd tools/harvest && bun install && cd ../..
bun run harvest   # slow, checkpointed, polite — drives a real browser
bun run sync      # copy packages/catalog into assets/ and src/data/
```

`packages/catalog` is the source of truth. The copies under `src/data/` and
`assets/catalog.json` are generated — edit the package, not the copy.

## Scope

The intended experience mirrors the commerce-focused Brooks website: the
Josh Kerr / Project 222 home feature, Men's, Women's, New Arrivals, Shoe
Finder, Run Club login, product shopping, live search, and cart. Completing
checkout, submitting payment, and placing an order are out of scope.

## Project documentation

The project uses [Linked Literate Programming](https://github.com/ccheever/llp)
to keep code connected to design rationale.

- [LLP 0000: Brooks](./llp/0000-brooks.explainer.md) — product and system entry point
- [LLP 0001: Mobile Shoe Commerce Design Survey](./llp/0001-mobile-shoe-commerce-design.research.md) — benchmarks and rubric
- [LLP 0002: The Brooks Commerce API](./llp/0002-brooks-commerce-api.research.md) — **read this before touching data**
- [LLP 0003: Brooks Design System and Screen Patterns](./llp/0003-brooks-design-system.research.md) — brand tokens, voice, screen specs
- [LLP 0004: Building on Exact Today](./llp/0004-building-on-exact.research.md) — historical research from the original monorepo
- [AGENTS.md](./AGENTS.md) — working instructions for AI agents

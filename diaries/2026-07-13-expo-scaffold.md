# Expo app scaffold (handed off mid-build)

**Date:** 2026-07-13
**Agent:** Claude Fable 5
**System:** Expo
**Scope:** Scaffold the Expo app on SDK 57 and build the data layer, design system, and home screen. **Stopped and handed off before the app was finished**, at Charlie's request, so another model could build the screens.

## Outcome

A working, verified Expo SDK 57 scaffold that boots in Expo Go and on web, renders
the real Brooks catalog, and ticks a live countdown to Josh Kerr's July 18 record
attempt. Screenshot: [`docs/expo-home.png`](../docs/expo-home.png).

**Built and verified:**

- Expo SDK 57 / RN 0.86 / React 19.2, expo-router, Expo Go–compatible library set
  only (nothing requiring a custom dev client).
- `src/data/` — the shared catalog layer: 226 real products, 821 colorways, real
  prices, per-size stock, ratings, specs. Plus `constructor.ts`, a live client for
  Brooks's public search API, and `images.ts`, which sizes photography through the
  Brooks CDN so a 170pt tile never downloads a 2500px master.
- `src/theme/tokens.ts` — brand tokens read from Brooks's own stylesheet
  ([LLP 0003](../llp/0003-brooks-design-system.research.md)).
- `src/store/cart.tsx` — persisted cart that builds the real Brooks variant id.
- `src/components/` — `primitives.tsx`, `ProductTile`, `Countdown`, `Wordmark`.
- Screens: **Home** (parallax hero, collapsing blurred header, staggered entrance,
  live countdown, product rails, editorial) and **Shop**.

**Not built:** PLP, PDP, Shoe Finder, Cart, Login, Search. Those routes exist as
`NotBuilt` stubs so the app boots and navigates cleanly; each one names its spec
and the helpers already waiting for it.

Verified by `npx expo export --platform web`, then rendering the bundle in a real
browser: no console errors, countdown ticking, real Brooks photography loading.

## What worked well

- **Deriving the design system from the site's CSS instead of screenshots** caught
  two things I would otherwise have got wrong, and both are load-bearing: Brooks
  **zeroes `border-radius` sitewide** (square corners are a brand trait — rounding
  them is what makes a commerce app look generic), and its buttons press against a
  **hard offset shadow**, not a soft Material elevation. An app that gets those two
  details right reads as Brooks before a single word is read.
- **The Brooks image CDN resizing on demand** means the app streams live product
  photography at exactly the size each surface needs, from a bundled catalog of
  bare URLs. Real imagery, no asset pipeline, no server.
- **The countdown.** Brooks's own hero is a static banner; the record attempt is
  five days out. Making it tick cost ~40 lines and is the best beat in the app.

## Friction and blockers

- The SDK 57 template ships an `AGENTS.md` that says, in effect, *"Expo has
  changed, read the versioned docs before writing any code."* Heeding it was
  right, but the docs index does not actually summarise what changed in 57 — I had
  to find the changelog separately to learn it is a low-risk RN 0.86 bump. A
  "what's new / what breaks" section on the versioned index would have saved the
  detour.
- Small type friction, all mine, all caught by `tsc`: `expo-image` takes an
  `ImageStyle`, not a `ViewStyle`; Reanimated 4 exports `SharedValue` as a
  top-level type rather than off the `Animated` namespace.
- `create-expo-app` refuses to create a directory named `expo` ("would conflict
  with a dependency of the same name") — had to scaffold under another name and
  rename.

## What was hard

Nothing technically, which is itself the finding: **every "wow" item on the design
list had a first-class, Expo Go–compatible answer.** Parallax and collapsing
headers from Reanimated's scroll handlers, blur from `expo-blur`, haptics from
`expo-haptics`, on-demand image sizing from `expo-image`, brand fonts from
`@expo-google-fonts`. The hard part of this app was never the runtime; it was
knowing what Brooks actually looks like, which is why the research phases were
worth more than the code.

## Expo and Exact comparison

Not directly observed — the Exact app was not started. But the Expo scaffold is a
useful control for the comparison [LLP 0004](../llp/0004-building-on-exact.research.md)
predicts: the home screen leans on a parallax hero, a scroll-driven collapsing
blurred header, staggered entrance animations, and haptics. Exact today rejects
gesture events at compile time, has no animation DSL, and forbids
`position: sticky`. So this exact screen is not portable, and the Exact app will
have to earn its quality through information design and real data rather than
motion. That contrast is the most useful thing the two-app experiment can produce,
and it is worth building the Exact app specifically to document it.

## Improvement ideas

- **Expo:** an official recipe for "remote image + CDN resize params" would make
  the single biggest perceived-performance lever discoverable. It is currently
  folklore.
- **Expo:** the versioned docs index should lead with a changed/removed summary for
  the SDK, since its own template tells agents to read it first.
- **Exact:** see LLP 0004. The headline needs are gestures and any animation
  primitive at all.

## Follow-ups

- Build PLP, PDP, Shoe Finder, Cart, Login, Search. Every stub names its spec and
  the helpers that already exist.
- The `NotBuilt` component and its stub routes should be deleted as each screen
  lands.
- `packages/catalog` is the source of truth; `npm --prefix tools/harvest run sync`
  copies it into the apps. The Expo copies under `src/data/` are generated — edit
  the package, not the copy.

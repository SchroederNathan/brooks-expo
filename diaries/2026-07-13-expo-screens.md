# Expo app: all remaining screens (PLP, PDP, Cart, Shoe Finder, Search, Login, Account)

**Date:** 2026-07-13
**Agent:** Claude Fable 5
**System:** Expo
**Scope:** Completed the Expo app from the handed-off scaffold (see
`2026-07-13-expo-scaffold.md`): built the seven stub routes, deleted `NotBuilt`,
verified the full journey end-to-end in a real browser.

## Outcome

The Expo app is **feature-complete against LLP 0000's required surfaces** and
verified: home → shop → PLP (filter sheet with live result counts, franchise
quick-chips, sort) → PDP (swipeable gallery, colorway thumbnails, width at equal
rank with size, per-size stock strikethrough, cushion/support meters, sticky
add-to-bag) → cart (real Brooks variant ids, quantity steppers,
swipe-to-delete + undo, free-shipping meter, checkout scope note) → Shoe Finder
(branching auto-advance quiz with the barefoot checkpoint, reasons-first
results) → live Constructor search (debounced type-ahead joined to local prices)
→ Run Club join/account. 16-step Playwright run: **all pass, zero console
errors**. Screenshots in `docs/expo-*.png`.

- `tsc --noEmit` clean; `expo export --platform web` clean.
- The cart's proof-of-fidelity beat: every line renders its real variant id
  (e.g. `#1104761D163.070` — the exact string `Cart-AddProduct` accepts,
  LLP 0002).

## What worked well

- **The scaffold's prep paid off exactly as intended.** Every screen found its
  data already shaped (`productsIn`, `facetsFor`, `applyFilters`, `variantId`),
  its tokens already extracted, and its cart store already persisted. The seven
  screens took one session with almost no research.
- **`facetsFor()` driving the filter sheet** means the sheet can never offer a
  zero-result option, and the Apply button's live count ("Apply · 23 results")
  costs one `useMemo`.
- **Playwright against `expo export` output** catches real bugs cheaply. It
  found that RN 0.86 removed `StyleSheet.absoluteFillObject` (the template's
  AGENTS.md warning to read versioned docs was not decorative).

## Friction and blockers

- **RN-web keeps unmounted screens in the DOM** (react-native-screens keeps
  scenes attached), so Playwright's `text=` selectors kept matching invisible
  copies of the same string on other screens. Every wait/click needed
  `.filter({ visible: true })`. Lost ~30 minutes to this pattern across six
  test failures; worth knowing before writing any RN-web E2E test.
- `StyleSheet.absoluteFillObject` is gone in RN 0.86; `tsc` caught it.

## What was hard

Nothing in the runtime. The care went into brand fidelity: keeping lime a spark
and never a surface (the Shoe Finder checkpoint screen wanted to be lime and
was wrong), striking through out-of-stock sizes rather than hiding them, and
error states in Brooks's voice (the size-grid shake + "Pick a size first").

## Expo and Exact comparison

Built the Exact app the same night — see `2026-07-13-exact-app.md`. The short
version: the Expo app's motion (shake, flying toast, swipe-to-delete, blurred
collapsing headers, haptics) has no Exact equivalent today, and LLP 0004
predicted that correctly. The data layer, however, ported almost verbatim.

## Improvement ideas

- **Expo:** an official "E2E testing RN-web with Playwright" note about
  screens remaining attached would save every agent the `.filter({ visible })`
  discovery tax.
- **Expo:** `expo export --platform web` + `npx serve` + Playwright is an
  excellent verification loop for agents; documenting it as a recipe would
  make it discoverable.

## Follow-ups

- The add-to-cart "flying shoe" (wow-list #2) is implemented as a spring-in
  toast rather than a cross-screen arc into the tab bar; a shared-element arc
  would need the tab bar visible on the PDP, which the current navigation
  structure doesn't provide. Revisit if the PDP moves inside the tab navigator.
- Order history and saved runs on Account are labeled prototype-scope.

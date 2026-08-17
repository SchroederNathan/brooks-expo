# Native tabs with a detached search tab

**Date:** 2026-08-17
**Agent:** Claude Fable 5 (Claude Code)
**System:** Expo
**Scope:** Replace the JS `Tabs` bar with `NativeTabs` and move search from a
modal route into a `role="search"` tab, matching the Nike app's tab-bar layout.

## Outcome

- `src/app/(tabs)/_layout.tsx` now uses `NativeTabs` (SDK 57 syntax). Four
  regular triggers (Home, Shop, Bag, Account) plus a `role="search"` trigger,
  which iOS 26 detaches into the standalone trailing search button.
- Search moved from a root modal (`app/search.tsx`) to a tab group
  `app/(tabs)/(search)/search.tsx` with its own stack. The screen's custom
  `TextInput` bar was replaced by `Stack.SearchBar`; the URL stayed `/search`,
  so no call site changed. Trending chips write back into the native field via
  the `SearchBarCommands` ref (`setText`). Web keeps an in-body input because
  it has no native header search bar.
- Shoe Finder left the tab bar (see friction below): it is a pushed
  full-screen route (`app/finder.tsx`) entered from a new card on Shop and the
  existing Account row, and its intro gained a back button.
- Tab screens dropped their manual `insets.bottom + ~100` scroll padding; the
  native tab bar insets the first ScrollView automatically.
- Verified on the iPhone 17 Pro simulator (iOS 27): detached search button,
  bar-morphs-into-search-field, live Constructor.io results, chip → `setText`,
  result → PDP push, blue cart badge, bottom spacing on all four tabs, finder
  entry points. Android and web were not run this session.

## What worked well

- `NativeTabs` + `role="search"` delivered the Nike layout with no custom
  code — liquid glass, the detached button, and the bar-to-search-field morph
  are all system behavior.
- `Stack.SearchBar` rendered inside the screen composes cleanly with screen
  state; the existing debounced Constructor.io hook needed no changes.
- Keeping the route path `/search` stable through the move meant every
  existing `router.push('/search')` kept working, now switching tabs instead
  of presenting a modal.

## Friction and blockers

- **Six triggers silently became a "More" tab.** 5 regular + 1 search
  overflowed UITabBarController; Account and Search vanished into "More" and
  the search role stopped detaching. Nothing warned; only a screenshot showed
  it. Cost one product decision (Shoe Finder off the bar) plus new entry
  points, a back affordance, and padding fixes on the finder screen.
- **Old absolute-bar padding doubled.** Screens padded `insets.bottom + 96..120`
  for the old translucent JS bar; with the native bar's automatic content
  insets that produced ~130pt of dead space at every scroll end. Each tab
  screen needed a manual pass.
- `badgeBackgroundColor` looks per-trigger in `NativeTabOptions` but is only
  accepted at the `NativeTabs` level; the trigger prop typechecks nowhere.
  Found by reading `types.d.ts` in `node_modules`.

## What was hard

- The brand casualty list is real: `NativeTabs.Trigger.Icon` takes SF
  Symbols / Material Symbols / raster images only, so the site's sprite
  glyphs and the two hand-drawn tab icons (LLP 0003) could not survive the
  migration, and the iOS system badge's white text killed the lime badge.
  Both trade-offs are recorded in LLP 0003.

## Comparative friction

Not observed.

## Improvement ideas

- `NativeTabs` should warn (dev-mode) when trigger count exceeds what the
  platform can show without a "More" tab, especially when a `role="search"`
  trigger is present — the failure is silent and visual-only.
- A documented recipe for "screens previously padded for an absolute JS tab
  bar" in the NativeTabs migration guide would have saved a pass; the skill
  covers safe-area handling but not un-doing the old compensation.
- `NativeTabs.Trigger.Icon` accepting a local SVG/vector component (even
  rasterized at build time) would let brand icon sets survive native-tabs
  migrations.

## Follow-ups

- Android: verify Material 3 bottom nav (search renders as a regular fifth
  tab there) and the `md` icon names; web: verify the headless tab layout and
  the web search input path.
- The home header's magnifier and Shop's fake search bar still push `/search`;
  consider whether both should stay now that search is one tap away.

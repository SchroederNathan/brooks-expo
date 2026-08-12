# Port the Expo app to a standalone repo

**Date:** 2026-08-12
**Agent:** Claude (Fable 5)
**System:** Expo
**Scope:** Port `apps/expo` + data tooling from the brooks monorepo (ae45ef3) into this standalone repo; modernize per the expo skills while staying visually 1:1.

## Outcome

Eight commits: verbatim import → bun → theme split (expo-design-system layout,
values byte-equal) → expo-sqlite storage → routes-only `src/app` +
`src/screens` bodies → boxShadow tokens → retargeted harvest tooling → Lottie
splash. Verified against full-resolution Phase-0 baselines on the iOS
simulator and a Pixel 9 emulator; iOS home diffed 0% after the theme split.

## What worked well

- The expo-design-system skill's "Adopt Before You Build" rule made the 1:1
  requirement easy to honor: keep the existing token values as source of
  truth, adopt only the file layout, naming, and component contract.
- Synchronous `expo-sqlite/localStorage/install` storage deleted the cart's
  `hydrated` flag and its blank first frame — hydration now happens in the
  reducer's lazy initializer.
- Baseline screenshot diffing caught real problems cheaply (see below), and
  proved the boxShadow conversion pixel-safe on both platforms: the feared
  iOS `shadowRadius` → CSS blur mismatch produced zero changed regions.
- Frame-extracting `simctl recordVideo` / `adb screenrecord` was the only
  reliable way to verify a 0.9s splash animation; single screenshots always
  missed the window.

## Blockers and unexpected difficulty

- **Metro incremental corruption:** after an 18-file rename that deleted
  `src/theme/tokens.ts`, Metro served "1 module" delta bundles — iOS silently
  kept OLD code (looked correct!) while Android rendered a half-applied graph
  with collapsed margins. A `--clear` restart fixed both. Lesson: after
  multi-file renames with deletions, cold-start Metro before trusting any
  visual verification.
- **Entrance-animation nondeterminism:** Reanimated `FadeInDown` on Android
  settles a few px differently between runs, so the hero pill produced
  persistent 0.2–0.4% diffs against baseline. Layout math (gap = exactly
  16dp) proved the code correct; one baseline had frozen a mid-settle frame.
- **Block-comment landmine:** writing `shadow*/elevation` inside a JSDoc
  comment terminates the comment (`*/`) and broke the bundle. Embarrassing,
  quickly caught by the red box.
- Two background `expo run:android` gotchas: `--device` wants a device NAME,
  not an adb serial; and gradle needs `ANDROID_HOME`/`local.properties` even
  when adb is on PATH.

## Comparative friction

- Expo Go compatibility drove the storage decision: MMKV v4 (nitro modules)
  would have forced dev-client-only; `expo-sqlite`'s localStorage polyfill is
  in Expo Go and is synchronous.
- TanStack Query was considered and deliberately deferred (user call): the
  app has exactly two live fetches (Constructor.io search + autocomplete),
  already well-served by fetch + AbortController + debounce.

## Notes for future work

- The 24 `@ref LLP NNNN#section` anchors are loose shorthand (e.g. `#brand`
  for "Brand tokens") — pre-existing in the monorepo, kept as-is.
- The harvest output gap is replicated, not fixed: `harvest.js` writes
  `tools/harvest/catalog.json`, `sync.js` reads `packages/catalog/catalog.json`.
  A manual copy stands between them, as in the source repo.
- Cart/member data did not migrate from AsyncStorage; state reset once.
- The native splash is now plain white to hand off seamlessly into the white
  Lottie animation; the old ink splash icon assets remain in `assets/` but
  are unreferenced.

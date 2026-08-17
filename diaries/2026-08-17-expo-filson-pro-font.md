# Replace Figtree with licensed Filson Pro

**Date:** 2026-08-17
**Agent:** Claude Fable 5 (Claude Code)
**System:** Expo
**Scope:** Swap the app's typeface from the Figtree substitute to the real, licensed Filson Pro OTFs.

## Outcome

- Bundled five Filson Pro weights in `assets/fonts/` (Regular 400, Medium 500,
  Bold 700, Heavy 800, Black 900).
- `src/app/_layout.tsx` now loads the local OTFs with `useFonts` from
  `expo-font`; the `@expo-google-fonts/figtree` dependency is removed.
- `src/theme/typography.ts` maps the ramp to `FilsonPro-*` names. The unused
  `font.semibold` key was removed — Filson Pro has no 600 weight.
- LLP 0003 type section updated: the Figtree substitution paragraph is marked
  `[superseded 2026-08-17]`.

## What worked well

- The theme routed every `fontFamily` through one `font` map, so the swap
  touched two source files plus the loader.
- Reading `usWeightClass` from each OTF's OS/2 table gave observed weight
  values (Book is 350, Regular is 400) instead of guessed ones. This corrected
  the initial assumption that Book was the 400 body weight.
- Metro bundled 1970 modules with the new `require('../../assets/fonts/*.otf')`
  asset paths on the first try.

## Friction and blockers

- The installed `Brooks.app` on the booted simulator is a release build with an
  embedded `main.jsbundle`. Restarting it silently showed stale JS with zero
  requests to Metro — easy to mistake for a verified change.
- Expo Go 57.0.8 crashed natively (SIGSEGV in
  `worklets::JSIWorkletsModuleProxy::toOptimizedObject`) right after the bundle
  loaded, twice. Crash report:
  `~/Library/Logs/DiagnosticReports/Expo Go-2026-08-17-142120.ips`. This is a
  react-native-worklets / Expo Go binary mismatch, unrelated to fonts, and it
  makes Expo Go unusable for QA on this project.
- Visual verification therefore required a full `expo run:ios` debug rebuild.

## What was hard

- Filson Pro's weight naming does not match CSS conventions: Book = 350,
  Regular = 400, and there is no 600. Mapping by file name alone would have
  shifted the whole ramp one step light.

## Comparative friction

Not observed.

## Improvement ideas

- Expo Go could surface a JS-visible error instead of a native SIGSEGV when a
  project's worklets version mismatches the client binary.
- `expo start` could log a warning when a launched app renders without ever
  requesting a bundle, to flag the stale-embedded-bundle trap.

## Follow-ups

- Italic Filson Pro styles exist in the source folder but are not bundled;
  nothing in the app uses italics today.
- The Caveat script accent remains a substitute for the site's Biro Script.

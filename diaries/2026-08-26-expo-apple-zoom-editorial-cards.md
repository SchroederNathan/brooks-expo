# Apple Zoom on every picture-that-opens-a-screen

**Date:** 2026-08-26
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** Extend `Link.AppleZoom` from the catalog tile to the Home editorial rails and the Browse franchise cards; fix the header inset that made the PLP jump under a zoom

## Outcome

Five card types now zoom into their destination on iOS 18+: Home's
`GearCard` ("Summer's hottest new gear"), `UseCaseCard` ("Wherever the day takes
you"), and `StoryCard`, plus Browse's franchise cards — all into the PLP — and
the catalog tile, which already zoomed into the PDP. List rows, the Shoe Finder
card, and the typographic hero CTAs are deliberately excluded; see LLP
0003#zoom-transitions for the reasoning per source.

The four new sources had to be converted from `router.push` to `<Link asChild>`:
`Link.AppleZoom` reads its destination from the surrounding `Link` through
context and throws outside one. `components/zoom-source.tsx` now holds the two
easy-to-forget constraints (single host child with `collapsable={false}`; frame
known on first paint) so the call sites read as geometry, and `ProductTile` was
refactored onto it too.

One real regression surfaced and was fixed. Verified on iPhone 17 Pro (iOS 27.0)
by frame-stepping screen recordings at 10–24fps: the zoom grows from the card's
own rect, and the PLP's first painted frame is now its final layout.

## What worked well

Frame-stepping a `screen-recording` with `ffmpeg -vf tile` is the right tool for
this. A zoom transition is ~0.4s; a screenshot before and after proves nothing,
and "it looks fine" is not a claim you can hold. A 6×3 contact sheet made both
the zoom itself and the layout bug obvious at a glance.

Running a **control experiment** was what turned a suspicion into a diagnosis. I
pushed into the same PLP from a Browse list row (still a plain `router.push`) and
tiled that too. The filter row was present in the first frame there and absent
for ~0.35s under the zoom, which located the bug in the transition rather than in
the screen.

The graceful degradation is genuinely free. `LinkAppleZoom` returns a `Slot` when
zoom is unavailable, so `ZoomSource`'s sizing `View` survives on Android and web
with no platform branch anywhere in app code.

## Friction and blockers

`useHeaderHeight` is only reachable at `expo-router/react-navigation`, which
`node_modules/expo-router/package.json` does not declare in `exports` — I found
it by listing the package's root `.js` shims. Nothing in the zoom docs, the Link
docs, or the header docs mentions needing it, and it is the hook the fix depends
on.

Saving screen recordings into `.argent/` inside the project root retriggers
Metro's file watcher, so every `screen-recording-stop` reloaded the running app
and cost a ~60s Lottie-splash wait mid-QA. Added `.argent/` to `.gitignore`,
which stops the git noise but not the watcher; a Metro `blockList` entry would be
the real fix.

## What was hard

The PLP's layout jump, and specifically believing it was worth fixing rather
than accepting.

Expo's docs say "avoid zoom transitions when navigating between screens that have
a header" and leave it there. That is accurate but not actionable — the PLP has a
header for good documented reasons (LLP
0003#pushed-screens-wear-the-native-header). Understanding *why* the header
breaks it is what produced a fix: with an opaque bar, UIKit owns the content
inset, and under a zoom that inset is applied a beat after the screen first
paints. The pushed screen paints at full-window height, so the sticky control row
lands in the band the bar occupies, hidden behind it, then re-lays out and shoves
the large title down.

The fix is to stop depending on the inset: make the bar transparent and let the
screen pad its own control row up behind it with `useHeaderHeight()`. The
control row's white *becomes* the bar's surface. Nothing is lost, because the
control row is sticky and opaque — the grid never reaches that band either way.

The generalisable version is worth stating: **a zoom destination must not learn
its geometry from the transition.** A slide hides the destination's first frames
off-screen and forgives a late inset; a zoom shows the first frame at full
fidelity in the middle of the screen and does not.

## Comparative friction

Not observed.

## Improvement ideas

1. **`useHeaderHeight` needs a documented public import path.** It is the escape
   hatch for exactly the case the zoom docs warn about, and today it is reachable
   only via `expo-router/react-navigation`, an undeclared subpath.
2. **The zoom docs' "avoid headers" warning should say what to do instead.** The
   pattern that works is one sentence: make the header transparent and pad the
   destination's top inset in JS, so the first painted frame is the final layout.
   As written, the warning reads as "do not use this feature on most real
   screens."
3. **The single-host-child requirement deserves a runtime error, not a doc note.**
   Passing a composite component to `Link.AppleZoom` silently drops the native
   zoom props and the transition degrades to a push with no warning. This was
   already flagged in `diaries/2026-08-21-expo-apple-zoom-pdp.md`; it cost time
   again here, which is what makes it worth repeating.
4. **`Link.AppleZoom` outside a `Link` throws at render.** For a component whose
   whole job is progressive enhancement, a dev-only warning plus a `Slot`
   fallback would be kinder than crashing the screen.
5. **Document the no-`AppleZoomTarget` case.** All four new sources land on a
   grid with no shared element, so they rely on the destination filling the
   frame. That is the right default and Apple's own behaviour, but the docs
   present `AppleZoomTarget` as the normal path and never say what happens
   without it.

## Follow-ups

- Rebased onto `main` after PR #1 (`Add Longer Days banner to the home screen`),
  which replaced the Run Club block and dropped the `Shop all new arrivals` link.
  Only `src/screens/home/index.tsx` conflicted, in three hunks: upstream's
  deletions stood, upstream's `LongerDays` component and my card doc comment were
  both kept, and the `runClub*` styles died with their block. The zoom work
  itself did not conflict — it lives inside `GearCard` / `UseCaseCard` /
  `StoryCard`, which PR #1 never touched.
- The `Longer days. Longer runs.` banner is now the photograph-with-text-CTA case
  the Run Club block used to be, and it stays out of the zoom for a stronger
  reason: two actions over one collage give a zoom no single source rect. See
  LLP 0003#zoom-transitions.
- Argent 0.22.1 is available (0.21.0 installed) — not updated, no consent asked.

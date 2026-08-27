# Browse becomes the search screen, with a collapsing field and a filter form sheet

**Date:** 2026-08-26
**Agent:** Claude Fable 5
**System:** Expo
**Scope:** Replace the pushed `/search` screen with search-in-place on Browse;
reusable `SearchBar` and `FilterButton`; `Filter & sort` as a native form sheet;
`react-native-keyboard-controller` app-wide.

## Outcome

- `src/components/search-bar.tsx` and `src/components/filter-button.tsx` are new
  design-system primitives (size/state contract, caller style last).
- `useCollapse` was extracted from `BrooksHeader`'s animated style into a hook
  that publishes `translateY` and `opacity`; `useHeaderScroll` takes a `travel`.
  Home's header behaviour is unchanged (it reads the same two values).
- Browse: fixed `Shop` title, collapsing search field, focus transition (field
  rises over the title, filter button slides in from the right, browse content
  cross-fades to live results). One progress shared value, eased with the tab
  bar's indicator bezier.
- `Filter & sort` is `/search-filters`, `presentation: 'formSheet'`; state
  crosses through `store/search-filters` (useSyncExternalStore).
- `react-native-keyboard-controller` 1.22.4: `KeyboardProvider` at the root,
  Login on `KeyboardAwareScrollView`, results list padded by
  `useReanimatedKeyboardAnimation`.
- Verified on iPhone 17 Pro Max (iOS 27.0), Metro 8082: collapse, flick reveal,
  focus transition, live results for "ghost", filter sheet, apply (badge `1`,
  "4 results · Price (High to Low)", the live-only GTX row dropping out).
- LLP 0003 gains *Browse is the search screen*.
- Follow-up in the same session: `Button` flattens on press-in — the face
  travels the shadow's 4pt offset on a native CSS transition over the new
  `motion.press` token (70ms). The idle `FilterButton` wears the chips'
  hairline; ink is the applied state.
- Bug found by the user: the clear cross unfocused the field but left the
  text. iOS emits a change event carrying the old text as the field resigns,
  after the empty string. `SearchBar` now blurs first, clears natively, and
  ignores non-empty changes for 150ms while clearing.

## What worked well

- The header's "publish shared values, let the screen compose" split made the
  focus motion a one-line mix: `translateY * (1 - p)`.
- Reanimated `useAnimatedReaction` reproduced the old style-side-effect logic
  exactly (the mapper fires on every input change; no equality check to fight).
- `bun run typecheck` caught both real mistakes: a CSS `cubicBezier` handed to
  `withTiming`, and an animated style handed to a non-animated component.

## Friction and blockers

- brooksrunning.com returned 403 to `WebFetch` (Akamai, as LLP 0002 predicts),
  so the site's filter button and panel could not be re-read live. The panel
  was built from the user's screenshot; swatch hexes are inferred.
- `expo run:ios --no-bundler` left the dev client pointed at 8081 (another
  project's Metro) and reported an RN 0.85/0.86 version mismatch red box. The
  Brooks Metro on 8082 had also died at some point during the build. Restarted
  with `nohup bunx expo start --port 8082 … & disown` and deep-linked to
  `localhost:8082`.
- react-native-screens form sheets: (1) the content root must be
  `collapsable={false}` or the sheet gets eight children and warns; (2) a
  `ScrollView` as a direct child triggers a special layout that put the list
  under the header. Wrapping the scroll view in a `View` fixed it.
- The sheet's list stopped short of its last section. Cause: `zIndex: 1` on
  the head reordered native subviews, which put the list on the first-subview
  path `RNSScreen.tryFindDescendantScrollView` walks; RNScreens then forced the
  scroll view's frame to the full sheet height. Removing the `zIndex` fixed it.
- Every Fast Refresh dismissed the open form sheet, so each sheet fix cost a
  re-open. Another dev app on the same simulator also stole the foreground
  once and raised an "Open in Clarity (Dev)?" prompt mid-test.

## What was hard

- Layering: the collapsed field has to hide *under* the fixed title, yet on
  focus it has to sit *over* where the title was. Solved by clipping the field
  inside its own band (`overflow: hidden`) and translating the band, rather than
  fighting z-order between the two.

## Comparative friction

Not observed.

## Improvement ideas

- Expo Router docs for `presentation: 'formSheet'` should state the
  `collapsable={false}` root requirement and the direct-child-ScrollView layout
  rule; both are only discoverable from a runtime warning.
- `expo run:ios --no-bundler` could warn when the URL it opens points at a Metro
  serving a different project root.

## Follow-ups

- The old `screens/category/filter-sheet.tsx` (Modal, chips) is still the PLP's
  sheet; it could adopt the form-sheet route with the PLP's facets.
- Android and web untested this session.

## Addendum — suggestion chips as a rail

[observed] The trending terms and the live suggestion terms were both a
`flexWrap: 'wrap'` block. With six trending terms the block ran two rows; with a
long autocomplete response it ran three, which pushed the product hits below the
fold at the moment the typist was closing in on them. Replaced both with one
`ChipRail` — a horizontal `ScrollView`, `keyboardShouldPersistTaps="handled"`,
gutter padding moved from the scroller to `contentContainerStyle` so the first
chip lines up with the gutter and the last scrolls clear of the edge. Verified on
the iPhone 17 Pro Max simulator: one row in both states, and the rail scrolls to
reveal `Sports bra`.

## Addendum — the header glyph never opened the keyboard

[confirmed] Home's header search glyph navigated to Browse but left the field
unfocused, so the screen arrived in its browse state and the runner had to tap
the field anyway. The intent channel was already right — `focus: '1'` as a route
param, consumed by an effect in `Shop` that calls `barRef.current?.focus()` after
60ms.

[observed] Proved with a temporary `console.log` in that effect, read back
through `debugger-log-registry`: the param arrives as `"1"`, then immediately as
`""`. The effect body schedules the 60ms timer and *then* calls
`router.setParams({ focus: '' })` to consume the param. That re-render changes
`focus`, React runs the effect's cleanup, and the cleanup's `clearTimeout`
cancels the focus it had just scheduled — every time, because the setParams
round trip is far shorter than 60ms.

[confirmed] First fix: move the timer into a ref and tear it down only on
unmount, so consuming the param cannot cancel the pending focus. This made the
first press work reliably from both a cold start and a warm one — **and it was
not the bug the user was hitting.** See the correction below.

## Improvement ideas (addendum)

- A one-shot route param that an effect must clear is a footgun in exactly this
  shape: the clear re-runs the effect that owns the pending work. A monotonic
  token (`focus: String(counter)`) would need no clearing at all. Worth
  considering if a third caller appears.

## Correction — the param clear is a no-op, and repeat presses never worked

[confirmed] The `clearTimeout`-in-cleanup race above is real, but it was not why
the glyph failed. The user reported it still only navigating. It did.

What I got wrong was **stopping at the first green test.** I verified press one
from a warm start and press one from a cold start, saw the keyboard both times,
and reported the fix as done. I never pressed the glyph *twice*. That is the only
sequence that fails, and it is the ordinary one — a runner searches, browses,
searches again.

[observed] Evidence, from a render-body `console.log` read back through Metro's
CDP log registry across a two-press run:

```
render, focus = "1"     <- press 1
effect, focus = "1"
render, focus = "1"     <- AFTER router.setParams({ focus: '' })
timer fired, ref = true
isFocused after = true  <- press 1 works
render, focus = "1"     <- press 2: unchanged, so no effect, no focus
```

Two findings in one trace. `router.setParams({ focus: '' })` never reaches
`useLocalSearchParams` — the very next render still reads `"1"`. And because the
param therefore stays `"1"` forever, a second `navigate` carrying `focus: '1'` is
not a change, the effect never re-runs, and the glyph navigates in silence. The
first press worked because the param genuinely changed then (undefined → `"1"`),
which is exactly what made this look like a timing bug rather than a state bug.

[confirmed] Real fix: drop the param. `store/search-focus` is a one-shot signal —
`requestSearchFocus()` before navigating, `consumeSearchFocus()` on the other
side. Nothing to clear, nothing to go stale, nothing in the URL. Same shape as
`store/search-filters`, which already exists here for the same reason: handing
state to a screen you cannot parent.

[observed] Then a second, genuinely-timing failure surfaced — one I only found
because I tested the *other* caller. The PLP's toolbar button pops a screen off
Browse's own stack rather than switching tabs, so Browse was already mounted and
the request fired 60ms before the pop had settled; iOS resigned first responder
on the way out and the keyboard never appeared. Fixed by hanging the read on
`useFocusEffect` (gaining navigation focus is the one event a tab switch and a
stack pop share) plus a short retry ladder that stops as soon as `isFocused()`
is true, instead of one guessed delay sized for the worst case.

Verified on the iPhone 17 Pro Max simulator, all five cases: glyph from a cold
start; glyph pressed a second and a third time; the PLP toolbar button; and the
negative case — an ordinary back-navigation onto Browse must *not* open the
keyboard, and does not, because the signal was already consumed.

## What was hard (correction addendum)

- Nothing about the code was hard. The failure was in how I tested: one happy
  path, once, and a confident report. A state bug that only bites on the second
  identical action is invisible to a single-pass check.

## Improvement ideas (correction addendum)

- `router.setParams` silently doing nothing is the sharp edge here. It has no
  return value and logs no warning, so "consume a one-shot param" reads as
  correct and fails quietly. Expo Router could warn when `setParams` is called
  on a route whose params are not what the caller then observes.
- Repeat the action. For anything reached by a button that a user will press
  more than once, the second press is part of the test, not a nicety.

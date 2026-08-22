# App-drawn Brooks header that collapses on scroll

**Date:** 2026-08-21
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** Port the `instagram-header-on-scroll-animation` study to a reusable
Brooks header with per-screen trailing controls; replace the native
`Stack.Toolbar` wordmark on all four scrolling tabs.

## Outcome

`src/components/brooks-header/` — one hook, `useBrooksHeader({ actions })`,
returns the header element plus the scroll props that animate it, so a screen
wires the whole thing in three lines and cannot half-wire it. Built-in actions
(`search`, `account`, `cart`, `menu`, `filters`) resolve to the site's own sprite
glyphs, weights, and destinations; a screen may pass a config object for anything
else. Home carries search only; Browse, Cart, and Profile each drop the glyph
that points at themselves. Rationale is in LLP 0003 *The header collapses on
scroll*.

Verified on the iPhone 17 Pro simulator (iOS 27.0): collapse, flick-reveal, snap,
cart badge (lime on blue, count from the store), status-bar flip on all four
tabs, and the native `Stack.SearchBar` still coming up on the pushed search
screen. `bun run typecheck` clean.

## What worked well

- Reanimated's `scrollTo` worklet replaced the study's `scheduleOnRN` +
  `setTimeout` + pointer-events-blocking snap with two lines that never leave the
  UI thread. Strictly less code and strictly less to go wrong.
- Returning the element *and* the scroll props from one hook removed the study's
  context provider entirely. There is no provider to forget to mount and no
  shared values to thread, which is what made wiring four screens mechanical.
- `useAnimatedRef` typed cleanly against `Animated.ScrollView`, so the snap
  needed no `any` and no ref-shape union.
- The existing `BrooksIcon` `thicken` prop meant the header's glyphs matched the
  tab bar's line weight by reusing the tab bar's own numbers.

## Friction and blockers

- **Reanimated allows one scroll handler per scrollable.** Home's
  `StretchyParallaxScrollView` already owned its handler, so the header could not
  attach one; two processed handlers do not compose. Fixed by having the parallax
  view accept the header's three worklets as a `scrollHandlers` prop. This is
  easy to get wrong silently — the second handler simply wins and the first one's
  animation dies.
- **`React Native` resolves the status bar from the last mounted `StatusBar`
  entry, not the focused screen.** Tab screens stay mounted, so switching from
  Cart back to Browse left Cart's light status bar over Browse's white content —
  an invisible clock. Gating on `useIsFocused` fixed it. Nothing in the
  `StatusBar` docs suggests mount order is the tie-breaker.
- Two false readings of downscaled screenshots cost a few minutes each: a
  mid-animation frame looked like a permanent blue remnant, and a white clock
  read as dark at 0.3 scale. Full-scale captures plus PIL pixel reads settled
  both. Consistent with what this project's memory already says about 2px chrome.
- **Two scroll artifacts came from the same root cause and were only found by
  fast flinging, not by the deliberate swipes used to verify the animation.** The
  study's snap runs on `onEndDrag` unconditionally, and `scrollTo` cancels iOS's
  deceleration — so a fast flick got replaced by a short programmatic scroll, or
  yanked backwards by the to-top branch. Separately, the study re-reads
  end-of-drag velocity every frame, and that value outlives its gesture: the
  rubber-band at the end of a list flipped direction while the stale velocity
  still read as a flick, slamming the header open with no finger down. Fixed by
  gating the snap on a resting lift and by deciding the flick once per gesture.
  Both are latent in the original study.

## What was hard

The study's two-regime design is the load-bearing part and the least obvious.
Near the top, header offset is a pure function of scroll offset; deeper in, it is
a function of the offset the drag *began* at, plus a velocity-gated instant
reveal. The subtlety is that the regimes fight: a flick-reveal at offset 200 is
overwritten on the very next frame by the near-top formula, which concludes
"offset 200, therefore hidden". The `skipTopInterpolation` latch is what keeps
the reveal alive, and removing it looks harmless right up until a flick produces
a one-frame flash.

Second: making the block full-bleed instead of a static safe-area cap plus a
sliding row. The cap version is easier (the status bar never changes style) but
leaves a blue band behind when minimized and clips the wordmark against it. Once
the whole block moves, the status-bar style has to follow the header, which is
what dragged in both the animated reaction and the focus gating.

## Comparative friction

Not observed — no equivalent work in another system this session.

## Improvement ideas

- Reanimated could make the one-handler-per-scrollable rule loud. A dev-mode warn
  when a second `useAnimatedScrollHandler` binds to a scrollable that already has
  one would have saved the Home investigation outright.
- A composition helper (`composeScrollHandlers(...handlers)`) would beat every
  app inventing a `scrollHandlers` passthrough prop for the same reason.
- `expo-status-bar` could offer a focus-aware variant, or document that RN
  resolves by mount order — the tab-screen case is not exotic and the failure is
  silent (an invisible clock, not an error).
- `expo-router`'s `Stack.Toolbar` cannot express a collapsing app-drawn bar, so
  any app whose brand chrome collapses leaves the native header entirely. Worth
  knowing when weighing toolbar API investment.

## Follow-ups

- Category and Product still draw their own bars. Both are candidates for this
  header with a `caretLeft` config action, but neither was in scope.
- Verified against fast flings on both a short screen (Browse, which reaches its
  end) and a long one (Home). Worth re-testing on a real device: simulator fling
  velocities are not the same instrument as a thumb.

# Always-present dismiss button beside Browse's search field

**Date:** 2026-08-27
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** `screens/shop`, `components/search-bar`, `components/filter-button`,
new `components/outline-icon-button`; LLP 0003 *Browse is the search screen*

## Outcome

Browse's search band now gives up a 48pt slot on *both* sides when the field is
focused. `Filter & sort` still slides in from off the right; a dismiss cross now
slides in from off the left on the same progress value with the sign flipped.
The cross inside the field stays, and still appears only once there is text.

Before this, the only way out of search mode was the in-field cross — so an
empty focused field had no visible exit at all. The left square is present for
the whole of search mode, which fixes that.

Two supporting changes:

- The 48pt outlined square moved into `components/outline-icon-button`
  (hairline rule, square metric, ink-outline active state). `FilterButton`
  composes it and passes its count badge as children.
- `SearchBarHandle` gained `reset`, which runs the in-field cross's own routine.
  That routine holds a 150ms guard against iOS's resign-time `onChangeText`
  (documented in the 2026-08-26 entry: the event carries the *old* text and
  arrives *after* the empty string). The bare `TextInput.clear` already on the
  handle does none of that guarding, so an outside dismiss calling `clear` +
  `setQuery('')` would have re-opened that bug.

Verified on the booted iPhone 17 Pro Max against Metro on 8082: focus, type
`ghost` (both crosses visible, `Close search` and `Clear search` distinct in the
AX tree), tap the left square, land back on Browse with the field empty and the
keyboard down. Direction confirmed frame-by-frame from a 30fps recording — the
mid-flight frame shows the cross clipped by the band's left edge while the
filter button is clipped by the right.

## What worked well

The screen already had exactly one shared progress value for the whole focus
transition, so adding a mirrored control was three lines of animated style plus
a `marginLeft` on the field — no new timing, no new state, and no risk of the
two buttons drifting apart. The band's existing `overflow: 'hidden'` clipped the
new button off the left edge for free.

Reading the frame strip out of `screen-recording-start`/`stop` with
`ffmpeg -vf crop,fps + vstack` was the only way to actually *see* the slide-in
direction. A settled screenshot cannot distinguish "animated in from the left"
from "faded in place".

## Friction and blockers

None material. `tsc --noEmit` was clean first try.

## What was hard

Nothing technically hard, but one judgement call was load-bearing: whether the
in-field cross should become clear-only now that a dedicated exit exists. Kept
its current behaviour (clear + blur + hand back), because the brief said "keep"
and because that path carries the iOS resign-time guard that took a previous
session to find. The two crosses therefore overlap when there is text. Flagged
for the human rather than changed unasked.

## Comparative friction

Not observed.

## Improvement ideas

`screen-recording-stop` returns a duration but no frame-extraction helper, so
verifying a direction of motion means dropping to `ffmpeg` by hand. An argent
tool that returned an N-frame contact sheet across a time window would make
"did this animate from the right side?" a one-call question.

## Follow-ups

Confirm with the human whether the in-field cross should become clear-only
(stay in search mode, keep focus) now that the left square owns the exit.

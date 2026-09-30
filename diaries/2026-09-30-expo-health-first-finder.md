# Shoe Finder leads with Apple Health; the quiz waits for Next

**Date:** 2026-09-30
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** `src/screens/finder/index.tsx`, LLP 0005, LLP 0003

## Outcome

On devices with Health, the Finder intro is now a Health screen ("Connect
Apple Health"), and the quiz is a text link below it. After the read, a
summary shows up to four headline numbers and the answers they fill, then the
quiz asks only the rest. Results repeat the numbers under the title. Quiz
answers no longer auto-advance: a tap selects, and a Next button (disabled
until a choice exists) moves on.

Checked on an iPhone 17 Pro simulator (iOS 26.5, Debug build, seeded Health
data from the 2026-09-29 session): intro → summary (23 runs, 21 mi/week,
13.1 mi longest, 8,700 steps a day; Road, half marathon, 10–25 filled) → 4
steps → results. The fallback quiz showed 1 of 7, grew to 8 on Trail, and Back
from the first question returned to the intro. Back from the first
Health-path question returned to the summary. `tsc --noEmit` passes.

A second pass simplified the screens after user feedback ("too much"). The
intro now follows a user-supplied reference: the Apple Health and Brooks app
icons with a link badge, "Link to Apple Health", a lock line and one button,
on flat navy instead of the reference's gradient. The summary lost its grid of
numbers, and results lost the numbers line; the evidence rows and result
reasons already quote them. Checked again on the same simulator through to
results.

## What worked well

- The change was JS only, so a running Debug build plus Metro and Fast
  Refresh was enough. No native rebuild.
- `run-sequence` with `await-ui-element` gates walked the quiz in a few calls
  and failed fast if a step did not appear.

## Friction and blockers

- Port 8095 was held by another workspace's Metro, and `expo start --port`
  in non-interactive mode printed "Skipping dev server" instead of failing.
  Check the port with `lsof` first.

## What was hard

- Deciding what to cut. The first pass showed the same numbers three times
  (stat grid, evidence rows, result line). The user saw it as noise at once.

## Comparative friction

Not observed.

## Improvement ideas

- `expo start` could exit non-zero when the requested port is busy in
  non-interactive mode, instead of printing "Skipping dev server".

## Follow-ups

- The "Nothing to go on yet" and "Not quite enough to go on" states were not
  checked on a device in this session: the simulator's Health store had
  seeded data.

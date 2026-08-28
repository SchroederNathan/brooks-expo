# Unify border widths on the PDP fit-grid rule

**Date:** 2026-08-27
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** Promote the PDP size/width border treatment to an app-wide `border`
token class and apply it to every border in the app.

## Outcome

The human confirmed the PDP `Select US size` / `Select width` grid as the
correct border treatment: a 1pt `colors.controlBorder` rule at rest that
strengthens to a 2pt `colors.ink` outline on selection. That pair is now the
app-wide rule for outlined controls.

Added `src/theme/border.ts` (`rule: 1`, `emphasis: 2`, `heavy: 3`) and exported
it from `src/theme/index.ts`. Every `border*Width` literal in `src/` now comes
from it — 22 declarations across 8 screens and 6 components. Documented the
width↔color pairing in `border.ts`, in the `colors.hairline` and
`colors.controlBorder` docstrings, and in a new **Border widths** section in
LLP 0003.

Six surfaces changed visibly, all verified on the booted iPhone 17 Pro Max
against a live Metro on 8082:

- PDP fit grid — unchanged (it was the reference).
- Browse's dismiss / `Filter & sort` squares, PLP chips, category filter sheet,
  quantity stepper, login fields: resting rule 1.5pt `hairline` → 1pt
  `controlBorder`; thinner but darker, so they read as controls.
- `Filter & sort` applied state and the login error state: now double the rule
  as well as changing its color, matching the PDP's selection gesture.
- Finder answer rows: 2pt `hairline` → 1pt `controlBorder`. These were the
  worst offender — a wide pale 2pt edge read as a filled box, not a choice.

Two roles keep an off-rule width, each commented at the use site: the finder's
14pt tick (a single rule vanishes at that size) and the sold-out slash's
`strokeWidth` (viewBox units in a stretched 100×100 box, so it is not a point
value at all).

`bun run typecheck` is clean.

## What worked well

- Two `grep` passes over `border*Width:` and `borderColor` gave a complete,
  reviewable inventory in one shot, before any edit. That inventory is what
  turned "match it elsewhere" from a guess into a decision per call site.
- The existing `src/theme/` layout meant adopting a new token class was one
  file plus one export line. The `expo-design-system` "adopt before you build"
  check paid off immediately: there was already a source of truth to extend.
- Argent's `describe` → `gesture-tap` loop on the already-booted simulator with
  Fast Refresh made verification nearly free — no rebuild, and every changed
  surface was reachable in ~15 taps.

## Friction and blockers

Little. One self-inflicted error: tokenizing the sold-out slash's SVG
`strokeWidth` to `border.rule`, which is wrong because the `<Svg>` uses
`viewBox="0 0 100 100"` with `preserveAspectRatio="none"` — the value is in
viewBox units stretched over the chip, so it renders sub-point. Caught it on
re-read before running anything. A second slip: the replacement comment was
first written as `{/* … */}` inside the `<Line>` attribute list, which is not
valid JSX; it belongs in child position.

## What was hard

Deciding scope, not writing code. "Match it in other places where border width
is used" has two readings: every border, or every *control* border. Repainting
dividers from `hairline` to the darker `controlBorder` would have darkened
every ruled row in the app, which is a different change from the one asked
for. The split taken — tokenize width everywhere, unify *color* only on
outlined controls — rests on a role distinction that the code did not record
anywhere, so it is now written down in both `colors.ts` docstrings.

The other judgement call: what "selected" means per component. The PDP grid
selects by doubling its rule; the filled chip and the finder row select by
filling with ink. Doubling the rule on a filled control shows nothing and moves
the label 1pt, so those keep the resting width and only follow the fill with
their border color. That exception is commented in both places, since the
obvious reading of the token names would say otherwise.

## Comparative friction

Not observed — no web-side equivalent of this change was made.

## Improvement ideas

- The `expo-design-system` skill enumerates `colors`, `spacing`, `typography`,
  `radius`, `shadows`, `motion` as the token classes, and `border`/stroke width
  is absent. It is a small scale (2–4 values) with an outsized effect on
  whether controls read as controls, and it drifts silently because 1 vs 1.5 vs
  2 all look plausible in isolation. Worth adding to the skill's file list and
  to `references/audit.md`'s grep checks (`border[A-Za-z]*Width:\s*[0-9]`
  catches every case).
- The skill's audit guidance covers hardcoded colors and spacing but not paired
  tokens — cases where a width is only correct alongside a specific color. A
  short note on documenting the pairing (a table in the token file, as done in
  `border.ts`) would help; a bare `border.rule` with the wrong color is still
  drift.

## Follow-ups

None. Argent reported an available update (0.21.0 → 0.22.1); not applied, as
that needs the human's explicit go-ahead.

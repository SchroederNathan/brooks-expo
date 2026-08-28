# Shop menu rows: `h3` → `navRow`

**Date:** 2026-08-28
**Agent:** Claude Fable 5
**System:** Expo
**Scope:** Reduce the type weight of the Shop screen's gender / featured lists and record it in the design system.

## Outcome

The Shop and Account list rows were set in `h3` (Filson Heavy 20/24). LLP 0003
already specified 16px medium for these rows, so the code had drifted from the
spec. Added a `navRow` ramp step (Filson Medium 16/22) to `src/theme/typography.ts`,
applied it to both screens, and added the row to the LLP type table with an
`[observed]` drift note. Verified on the iPhone 17 Pro Max simulator.

## What worked well

The single `Txt` primitive with `variant` keys made the change a token addition
plus two one-word edits. `tsc` and a Metro restart were enough to verify.

## Friction and blockers

None.

## What was hard

Nothing technical. The only judgment call was adding a new ramp step rather than
changing `h3`, because `h3` is still correct for real headings (cart totals,
empty states, finder options).

## Comparative friction

Not observed.

## Improvement ideas

A lint that flags `@ref`-governed values whose code no longer matches the LLP
table would have caught this drift earlier.

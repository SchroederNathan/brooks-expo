# Tab focus indicator moves onto the bar's top edge

**Date:** 2026-08-21
**Agent:** Claude Opus 5 (Claude Code)
**System:** Expo
**Scope:** `src/components/tab-bar.tsx` follow-up to "Replace native tabs with a
Brooks-drawn five-tab bar" (80a863a); see also
`diaries/2026-08-21-expo-app-drawn-tab-bar.md`

## Outcome

The bottom tab bar's focus dash used to float 6pt above a `borderTopWidth`
hairline. It now rides that top edge: the border is gone, replaced by an explicit
2pt track `View`, and the dash is absolutely positioned inside the track at the
same 2pt height. One thickness for both, so the moving ink reads as the same
stroke as the line it travels along. Follow-ups in the same pass: the dash went
18pt → 32pt wide, and the track went `hairline` (#E5E5E5) → `surfaceSunken`
(#F2F2F2), because doubling a hairline's thickness also doubles its weight.

Verified on the iPhone 17 Pro simulator at `scale: 1` with PIL. On Home the
track occupies rows 2370–2375 (6px = 2pt @3x) and is 1110 light px + 96 ink px
across a 1206px screen — the dash exactly replaces the segment of track under it
rather than covering a line of a different weight. After tapping Shoe Finder the
same 96px of ink sits at x 555–650, centred on the third slot. [observed]

## What worked well

- Dropping the border for a sibling `View` kept the dash inside a normal
  flex-column layout, so the item `onLayout` x-origins still map straight onto
  the track. No coordinate translation, no negative offsets, no clipping risk
  from drawing a child over a border. [observed]
- `INDICATOR_MS` / `INDICATOR_EASING` stayed imported from `underline-rail.tsx`,
  so the geometry change did not touch the motion at all. [observed]
- Full-resolution screenshots plus a pixel scan settled "is it the same
  thickness" in one step. A downscaled capture cannot answer a 2pt question.
  [confirmed — same lesson as the previous tab-bar entry]

## Friction and blockers

- The first pixel scan looked at the bottom 200 rows and found no track. The
  bar's chrome is above that window: the row's bottom padding plus the 34pt home
  inset put ~136px of blank surface below the glyphs. Widening the window found
  it immediately. [observed]

## What was hard

Nothing technically hard. The judgement call was which of the two thicknesses to
keep. RN gives no way to make a 2pt dash out of a `StyleSheet.hairlineWidth`
border, so the dash's visibility set the track's thickness, and the colour had to
absorb the extra weight. [inferred]

## Comparative friction

Not observed.

## Improvement ideas

- A border and a positioned child cannot be co-planar in RN without giving up the
  border, because borders draw inside the frame and children lay out inside the
  border box. An indicator that must sit _on_ a divider is common enough
  (tab bars, segmented controls, sticky-header underlines) that it is worth a
  documented recipe: use a track `View`, not `borderTopWidth`.

# PDP purchase control styling

**Date:** 2026-08-21
**Agent:** Codex
**System:** Expo
**Scope:** Match the PDP size, width, and purchase controls to a Brooks mobile reference.

## Outcome

Added reusable outlined product-option and blue purchase-action variants, then
applied them to five-column size and four-column width grids on the PDP.
`bun run typecheck` passed, and an iPhone 17 Pro simulator walkthrough confirmed
the selected outline, diagonal unavailable states, one-line Medium width label,
wrapped Extra Wide label, and split action/price CTA.

## What worked well

The existing `Chip`, `Button`, color palette, and typography ramp made the
reference treatment an incremental design-system extension rather than a
screen-local restyle. Argent provided an immediate device-sized comparison.

## Friction and blockers

The original request's attachment was not exposed on the first pass, so the
reference could not be distinguished from the repository's older PDP image
until it was reattached with a filesystem path.

## What was hard

The web reference uses separate selection semantics from the app's existing
filled filter chips. Preserving both required explicit component variants and
screen-owned column geometry rather than changing the global selected state.

## Comparative friction

Not observed.

## Improvement ideas

Surface user attachments to coding agents with a stable path on the first turn
so visual implementation can begin without a reattachment round trip.

## Follow-ups

None.

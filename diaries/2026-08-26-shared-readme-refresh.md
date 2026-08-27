# README refresh

**Date:** 2026-08-26
**Agent:** Codex (GPT-5.6)
**System:** Shared
**Scope:** Replace the stale project README and its two lead screenshots with documentation of the current app.

## Outcome

The root README now documents the current Ghost Amp home, in-place Browse search, Shoe Finder, product and cart behavior, data boundaries, local setup, catalog maintenance, and TestFlight workflow. The Home and PDP images were recaptured from the current iOS development build on an iPhone 17 Pro Max simulator. [observed]

## What worked well

Reading `package.json`, app and EAS configuration, LLP 0000, the relevant LLP 0003 sections, and recent diary outcomes gave a reliable map without reverse-engineering every screen. Argent produced full-resolution screenshots from the same build used to verify the current UI. [observed]

## Friction and blockers

The old README was only two weeks old but described a superseded Project 222 home and pushed search screen. The simulator also restored Home at a previous scroll position, so it had to be returned to the top before capture. No blocker remained. [observed]

## What was hard

The concise explanation had to preserve three distinct boundaries: bundled catalog data, live search and imagery, and device-local member and cart state. Collapsing those into "real Brooks data" would imply live product, auth, or cart APIs that the app cannot call. [observed]

## Comparative friction

Not observed.

## Improvement ideas

Add a small repeatable screenshot flow for the README's Home and PDP states. It would make visual documentation drift obvious when navigation or campaigns change.

## Follow-ups

Refresh the remaining historical images under `docs/` if another document begins linking to them.

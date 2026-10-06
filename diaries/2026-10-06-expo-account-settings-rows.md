# Account settings rows for guests

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** Show the Account settings rows without a login; remove rows with no action and the bag row.

## Outcome

`src/screens/account/index.tsx` has a `SettingsRows` component (Shoe Finder,
Check for updates, Liquid Glass switch). The member screen and the guest pitch
both render it. *Your bag*, *Order history*, and *Run Happy Promise* are gone.
LLP 0003 *Liquid Glass is a Profile toggle* records the change. [observed] On
the iPhone 17 Pro simulator (iOS 26.5) both states render the three rows.

## What worked well

- Argent `open-url` with the dev-client URL loaded the bundle from a second
  Metro port (8091) without a rebuild.
- The element tree that each Argent action returns gave tap targets without
  extra describe calls.

## Friction and blockers

- The worktree had no `node_modules`; `bun install` was necessary before
  `tsc` and Metro could run.
- The first Argent taps failed with "CoreDevice HID transport is dead".
  `stop-simulator-server` on the device fixed it.
- Each custom-scheme `open-url` shows the iOS "Open in …?" alert, so every
  deep link costs one more tap.

## What was hard

Not observed.

## Comparative friction

Not observed.

## Improvement ideas

- Argent could restart a dead HID transport by itself and retry once.

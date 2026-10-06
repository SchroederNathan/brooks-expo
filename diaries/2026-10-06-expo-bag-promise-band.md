# Bag: remove the shipping meter, reuse the PDP promise band

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5 (Claude Code)
**System:** Expo
**Scope:** Bag screen redesign. Remove the free-shipping card and the
text-only Run Happy Promise box. Show the PDP's returns band instead.

## Outcome

- The PDP's private `RunHappyPromise` moved to
  `src/components/run-happy-promise.tsx`. The PDP and the Bag both use it.
- The Bag lost the free-shipping progress card and the outlined promise box.
  The returns band sits under the totals. `freeShippingRemaining` left the
  cart store because nothing reads it now.
- The sticky checkout bar lost its white fill and its top hairline. The
  button now floats over the rows.
- Cart lines no longer print the `#<variant id>` line. The id stays in the
  cart data.
- `Checkout` no longer opens the navy "Prototype note" box. The button
  has no action.
- LLP 0003: the Cart line is marked superseded, and *PDP detail sections*
  names the shared component.
- Evidence: `bun run typecheck` clean. On a new iPhone 17 Pro (iOS 26.5)
  simulator, one Addiction GTS 15 was added from the PDP. The PDP still shows
  the band. The Bag shows the line, the totals, then the band, with no
  shipping card.

## What worked well

- The band already had no PDP-only dependencies, so the move needed only a
  `style` prop for the top margin.

## Friction and blockers

- The first `bun install` in this worktree put `react-native-worklets` 0.10.1
  in `node_modules`, while `bun.lock` pins 0.10.0. The app showed a Worklets
  JS/Babel version mismatch red box, then quit on the next load. Removing the
  folder and running `bun install --force` gave 0.10.0, and the cairo-v1
  dev build (native 0.10.0) then ran.

## What was hard

- Finding which installed dev build matched the JS. The DerivedData folder
  name does not show the workspace; `info.plist`'s `WorkspacePath` and that
  workspace's `Podfile.lock` did.

## Comparative friction

Not observed.

## Improvement ideas

- Make the Worklets version check name both the installed package path and
  the lockfile version, so a stale package-manager cache is the first
  suspect.

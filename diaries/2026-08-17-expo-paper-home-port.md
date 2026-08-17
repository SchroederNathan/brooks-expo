# Paper home screen port

**Date:** 2026-08-17
**Agent:** Codex (GPT-5.6)
**System:** Expo
**Scope:** Port the Paper `Home` artboard into the Expo app, including its real Brooks hero video and exported visual assets.

## Outcome

The Expo home screen now matches the Paper composition while retaining the
existing native Home, Shop, Bag, Account, and Search tabs. The Ghost Amp hero
plays Brooks's mobile Brightcove MP4 as a muted loop, and the Paper lifestyle,
Run Club, story, and promise artwork is bundled under `assets/home/`.

`bun run typecheck` passes. React Doctor reports no findings in the new home
screen. The screen was rebuilt and checked on an iPhone 17 Pro simulator from
the hero through the final promise band; the runtime debugger log was empty.

## What worked well

Paper's JSX and computed-style exports provided exact dimensions and spacing.
`expo-video` 57 handled a bundled MP4 with a small native surface, and local
assets made the visual check deterministic. Horizontal `FlatList`s preserved
the Paper rails without expanding the vertical page hierarchy.

## Friction and blockers

Several Paper sections used crops from a composite website capture rather than
standalone named images, so the Run Club fill needed a clean crop from the
exported source. Adding `expo-video` required a native iOS rebuild and CocoaPods
update before the view existed in the simulator.

## What was hard

Reanimated 4 zero-delay entering transitions left the first hero label and the
first product tile transparent under the native tabs host even though both were
present in the component tree. Removing nonessential hero entrance motion and
starting product staggering at the first nonzero delay made painting reliable.
The looping footage already supplies the page's meaningful motion.

## Comparative friction

The Paper source made visual values easier to recover than a screenshot alone,
but composite image fills were harder to export than a design assembled from
individually named assets.

## Improvement ideas

Expo's versioned `expo-video` documentation could call out that adding the
module to an existing development build requires rebuilding the native client.
A Paper command that exports a fill at its rendered crop would remove a manual
asset-preparation step.

## Follow-ups

Replace the bundled campaign MP4 when Brooks rotates the homepage campaign.

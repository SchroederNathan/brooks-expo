# General image optimization repairs

**Date:** 2026-07-14
**Agent:** Codex (GPT-5)
**System:** Shared
**Scope:** ENG-24862 — repair denied editorial assets and bound initial image work

## Outcome

[observed] Three CMS story-image URLs returned HTML denial bodies even with a
successful HTTP status. They now use related Brooks catalog photography, and
the harvest workflow validates committed editorial URLs by content type and
image signature. [verified] All four editorial sources pass that check.

[verified] Exact category grids contain 24–97 products. The Contract surface
now mounts 12 at first, exposes 12 more per action, and marks only the first
four grid images eager/high. The home hero and detail main image are also
eager/high; other grid images are lazy/auto.

## What worked well

The existing `brooksImage()` resize boundary made it possible to validate the
same small request shape the apps use. Contract's pure helpers kept pagination
small and preserved stable product-row identities.

## Friction and blockers

Bare Demandware master URLs can return `200 text/html`, while the resized CDN
form returns real image bytes. Status-only validation initially produced a
false sense of success. Full Exact app typecheck is also noisy from linked
framework-source errors; the changed route was instead compiled directly with
its real `.contract-meta.ts` descriptors on Exact `origin/main`.
The local Exact dev server reached ready state, but no in-app browser was
connected in this session, so a fresh request waterfall could not be captured.

## What was hard

Image reachability was not a property of the hostname alone: CMS paths, bare
catalog masters, and resized catalog requests behave differently. The validator
had to model the actual app request rather than probe only the stored URL.

## Expo and Exact comparison

Expo already uses a virtualized two-column category list and `expo-image`'s
memory/disk cache. Exact's wrapping row needed explicit pagination to bound node
and request fan-out; after Exact gained `loading` and `priority`, both apps can
express the critical-image intent directly.

## Improvement ideas

Exact should eventually derive image priority from viewport/list visibility so
apps do not encode a widest-layout row count. Shared content pipelines should
validate response bytes whenever CMS/CDN URLs are harvested.

## Follow-ups

Run the native field benchmark after the Xcode host gate is available; the
data-level benchmark already proves the initial Exact source count drops from
24–97 to 12, with four eager/high candidates.

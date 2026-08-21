# Continuous home parallax

**Date:** 2026-08-21
**Agent:** Codex
**System:** Expo
**Scope:** Extend the reusable home parallax through normal positive scrolling

## Outcome

The reusable `StretchyParallaxScrollView` now moves its leading media at half
the content speed for the complete positive scroll range, with no interpolation
clamp. Pull-down overscroll still stretches the media while pinning its top edge,
and reduced-motion users retain the direct stretch without passive parallax. A
separate animated foreground keeps the hero copy and CTA above incoming page
sections while those sections paint over the media. The foreground scrolls at
normal content speed, so its bottom inset from the next section stays constant.

## What worked well

Reanimated's UI-thread scroll handler could express positive parallax and
negative overscroll as two branches of one transform. Argent made the layer
ordering issue visible immediately at the same partial-scroll position.

[observed] An Argent Hermes profile of a controlled 1.2-second parallax scroll
recorded two React commits, neither over the 16 ms frame budget. During the
3.5-second interaction window, Hermes was idle for 3479.5 ms (99.4%); the only
sampled work was 12.74 ms of young-generation garbage collection and 7.75 ms
in the host `queueMicrotask` function. No app-owned JavaScript hotspot appeared.

## Friction and blockers

Port 8081 belonged to another project's Metro process, so the Brooks development
build used Expo's offered port 8083. The first visual pass showed that the old
header `zIndex` placed the slower media over the incoming section. A later
`expo start --port 8083` also added `expo-device-hub` to `package.json` and
`bun.lock` without an installation prompt; those unrelated edits were reverted.
[observed] Argent's iOS native-profiler trace completed, but Xcode could not
export either a recognized CPU time-profile schema or a `potential-hangs`
table. The five-minute export timeout also cleared the paired React analysis
cache, so a shorter React-only pass was captured and analyzed separately.

## What was hard

The parallax transform was straightforward, but the reusable header's existing
stacking order only became wrong once positive scroll compensation created an
overlap. Splitting media and foreground into independent animated layers creates
the intended media → page content → hero copy stack without coupling the
primitive to a particular background color. The two layers cannot share the
same positive-scroll transform: only the media parallaxes; the foreground must
move with the following content to preserve their spacing.

## Comparative friction

Not observed.

## Improvement ideas

Expo's Reanimated example could include a scroll-driven parallax case that
demonstrates both unclamped positive motion and sibling stacking order. Expo CLI
should ask before persisting optional development-tool dependencies.
[inferred] Argent could preserve the React half of a dual-profiler session when
the native export times out, and its analyzer could resolve both the simulator
UDID and Metro logical device ID to the same stored session automatically.

## Android boundary hardening

[confirmed] Android requires the transformed media to live inside a separate
animated clipping container. `overflow: hidden` on the transformed media itself
clips its children but does not prevent that view from painting beyond the hero
frame. The foreground also clips its children to the same moving lower boundary,
so large text cannot overlap the following section.

## Follow-ups

None.

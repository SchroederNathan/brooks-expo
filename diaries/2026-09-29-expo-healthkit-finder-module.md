# Shoe Finder starts from Apple Health through a local Expo module

**Date:** 2026-09-29
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** `modules/brooks-activity` (iOS), Shoe Finder Health entry point, LLP 0005

## Outcome

A local Expo module reads running, walking and hiking workouts and daily step
totals from HealthKit. The Finder has a "Start from my Apple Health activity"
link. It fills the answers the data supports, shows why, and asks the rest.
Checked end to end on an iPhone 17 Pro simulator (iOS 26.5) with seeded data:
the quiz dropped from 7 steps to 4, and the results quoted the shopper's
longest run. LLP 0005 records the design and the thresholds.

## What worked well

- `create-expo-module --local --platform apple` gave a working, autolinked
  scaffold in one command. `expo prebuild` picked up the local config plugin
  from a relative path in `app.config.ts` with no build step.
- Swift `async` closures in `AsyncFunction` and `Record` return types needed
  no glue. HealthKit's async descriptors (`HKSampleQueryDescriptor`,
  `HKStatisticsCollectionQueryDescriptor`) fit that model directly.
- Argent's `debugger-evaluate` against `globalThis.expo.modules.BrooksActivity`
  made it possible to call and check native functions without any UI.

## Friction and blockers

- `debugger-evaluate` does not await promises. It returned the raw Hermes
  promise object (`{_x: 0, ...}`). Workaround: store the result on
  `globalThis` in `.then`, and read it with a second call.
- `expo run:ios` prints `❌ error: the following command failed with exit code
  0 but produced no further output` during the ExpoModulesJSI xcframework
  step, and then the build succeeds. The red cross looks like a failure.
- The simulator's Health store starts empty, and HealthKit has no simctl
  command to seed it. A write-access path with a build-time plugin option was
  necessary just to test a read-only feature.

- [observed 2026-09-30] The first TestFlight workflow build failed: the
  stored App Store profile had no HealthKit capability. The workflow build
  does not sync capabilities; a local `eas build` with an Apple sign-in does.
  I had guessed in LLP 0005 that sync would handle it, and that was wrong for
  workflow builds.
- [observed 2026-09-30] The next upload was rejected with ITMS-90683 for a
  missing `NSHealthUpdateUsageDescription`. The plugin had left the key out
  of production builds to keep them read-only. The fix keeps the key in every
  build and compiles the write code out of Release with `#if DEBUG`.

## What was hard

- HealthKit does not report read denials, so "denied" and "no data" are the
  same state. The UI must present an empty result as normal.
- Keeping the store build read-only while development builds can write
  sample data. The first version removed the write usage string from
  production builds, and App Store Connect rejected that. The version that
  works keeps the string and compiles the write code out of Release.

## Comparative friction

Not observed. No library-based version was built for comparison.

## Improvement ideas

- `debugger-evaluate` (Argent) could await a returned promise, or have an
  option to await it.
- `create-expo-module` could offer a HealthKit (and Health Connect) template:
  the entitlement, usage-string plugin and a read-permission example. This
  module needed all three before it could read anything.
- The Expo docs have no page on reading health data. A search for "HealthKit
  Health Connect steps workouts" returned only `expo-pedometer`.

- EAS could warn before a workflow build when the app's entitlements include a
  capability that the stored provisioning profile lacks. The failure came only
  at the fastlane step.
- The Expo HealthKit guidance (or the config-plugin docs) could say that
  App Store Connect requires `NSHealthUpdateUsageDescription` for a read-only
  HealthKit app.

## Follow-ups

- Android reader on Health Connect (LLP 0005#android).
- Check the production sheet text without `NSHealthUpdateUsageDescription`.
- Check the LLP 0005 thresholds against real runners' data.

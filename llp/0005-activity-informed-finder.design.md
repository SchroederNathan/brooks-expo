# LLP 0005: Activity-Informed Shoe Finder

**Type:** Design
**Status:** Draft
**Systems:** Expo App
**Author:** Claude Opus 5.5
**Date:** 2026-09-29
**Related:** LLP 0000, LLP 0002, LLP 0003

## Summary

The Shoe Finder can start from the shopper's Apple Health data. It reads
running, walking and hiking workouts and daily step totals from the last eight
weeks. From these it fills in the quiz answers the data supports clearly, shows
the shopper what it filled in and why, and then asks the remaining questions.
Results quote the shopper's own numbers in their reasons.

The reader is a local Expo module, `modules/brooks-activity`. It is iOS only
today. On Android and web, the module resolves to `null` and the Finder shows no
Health entry point.

## Why a local module

[observed 2026-09-29] Two maintained libraries exist:
`@kingstinct/react-native-healthkit` 16.0.0 (iOS, Nitro Modules) and
`react-native-health-connect` 4.1.3 (Android). We need about 5% of either
surface: read-only access to three data types.

[inferred] A local module is the smaller dependency and gives better defaults:

- It needs only `expo-modules-core`, which the app already has. The HealthKit
  library also needs `react-native-nitro-modules`.
- By default, the HealthKit library's config plugin adds the background-delivery
  entitlement and `NSHealthUpdateUsageDescription`. We want neither in a store
  build.

The cost is that we maintain the native code ourselves.

## Native returns summaries, JS decides

[observed] The Swift module (`BrooksActivityModule.swift`) has five read
functions: `isAvailable`, `shouldRequestAccessAsync`, `requestAccessAsync`,
`getWorkoutsAsync(days)` and `getDailyStepsAsync(days)`. It also has the
development-only `seedSampleDataAsync` (see below). It returns one small
record per workout (`kind`, `start`, `durationMinutes`, `distanceMeters`,
`elevationGainMeters`, `indoor`) and one step total per day. This is at most a
few hundred records.

Daily steps come from an `HKStatisticsCollectionQuery`, not a sample sum.
[inferred — Apple's documented statistics behavior, not tested here] HealthKit
removes duplicate samples when both an iPhone and an Apple Watch
count the same walk. A plain sum would count that walk twice.

Workout distance comes from `workout.statistics(for: .distanceWalkingRunning)`.
`HKWorkout.totalDistance` is deprecated from iOS 18.

All interpretation is in TypeScript (`src/data/activity.ts`,
`src/screens/finder/from-activity.ts`). Thresholds can change with Fast
Refresh, and an Android reader only has to return the same two record shapes.

## Answer only what the data shows

`answersFromActivity` fills an answer only when the data points at one option
clearly. Every threshold below is `[inferred]` and has not been checked against
real runners' data.

| Answer | Rule | Evidence shown |
|---|---|---|
| `use: 'road'` | 4 or more runs in the window (one every two weeks), and fewer than half are trail runs | "18 runs in 8 weeks, mostly on the road", or "Most of your N runs were on a treadmill" |
| `use: 'trail'` | Half or more of the runs climb 40 m or more per mile | "N of your M runs climbed like trail runs" |
| `trailType` | `mountain` when half or more of the trail runs climb 80 m or more per mile, otherwise `light`. Never `speed`: nothing in the data shows racing. | "Most of them climbed steeply" |
| `mileage` | Weekly run miles under 10, under 25, or 25 and up, which are the quiz's own bands | "About 22 miles a week" |
| `race` | Longest run of 16 mi or more → marathon, 9 mi or more → half. Otherwise the step is asked: Health cannot separate a 5K plan from running for fun. | "Your longest run was 13.1 miles" |
| `use: 'walk'` | Fewer than 4 runs, and 4 or more walks or 7,500 or more steps a day | "About 9,400 steps a day" |

The data cannot see how the ground should feel, the barefoot balance test, or
fit, so those steps stay in every flow. A walker's race and mileage steps also
stay: "Just running for me" is not an answer the data can give for someone who
does not run.

The summary screen lists each filled answer with the quiz's own eyebrow and
option label, so the shopper can check it against the question it replaces.
"Answer every question instead" drops the Health answers entirely.

## Nothing leaves the device

[observed — LLP 0002] The app has no Brooks backend. The profile is computed
when the shopper taps "Start from my Apple Health activity", held in Finder
screen state, and dropped on "Start over" or "Retake the quiz". It is never
written to storage and never sent over the network. The `NSHealthShareUsageDescription`
string says so.

The app never asks for Health access at launch. It asks only after the tap.

## Read-only by default

The config plugin (`modules/brooks-activity/app.plugin.js`) adds
`com.apple.developer.healthkit` and `NSHealthShareUsageDescription`. Its
`sampleData` option also adds `NSHealthUpdateUsageDescription`, so that
`seedSampleDataAsync` can write eight weeks of road-runner data to an empty
simulator. `app.config.ts` turns `sampleData` on for every build except the EAS
`production` profile. `seedSampleDataAsync` throws when the key is absent, so a
store build cannot write to Health even if the JS calls it.

`seedSampleDataAsync` deletes only samples this app wrote, then writes the new
set, so it can run more than once. It is not called from any screen. Call it
from a debugger:

```js
await globalThis.expo.modules.BrooksActivity.seedSampleDataAsync()
```

## Verified on a simulator

[observed 2026-09-29, iPhone 17 Pro simulator, iOS 26.5, Debug build]

- The read sheet lists Steps, Walking + Running Distance and Workouts, and shows
  the `NSHealthShareUsageDescription` text. In this development build, the
  sheet header says the app wants to "access and update" Health data.
  [inferred] The cause is the `NSHealthUpdateUsageDescription` key in this
  build, and a production build without it would say "access" only. Neither
  is checked yet.
- With an empty Health store, the Finder shows "Nothing to go on yet" and
  the full 7-step quiz.
- After `seedSampleDataAsync`: 23 runs and 8 walks, 55 days with steps. The
  newest run read back as 21,082 m with 104.8 m of climb, so
  `statistics(for:)` and the elevation metadata both work for
  builder-saved workouts. The summary filled Road, A half marathon and 10–25
  ("About 21 miles a week"). The quiz dropped to 4 steps. The results said
  "Loved for long runs like your 13.1-miler".

## HealthKit hides read denials

[inferred — Apple's documented privacy behavior, not tested here] HealthKit
never tells an app whether read access was denied. A denied request returns the same empty results as a Health
store with no workouts. So the Finder treats an empty profile as a normal
state: "Nothing to go on yet", with a pointer to the Health app, and the full
quiz.

## Android

Not built. [observed 2026-09-29] `android/` is generated by prebuild and
gitignored, and it has not been generated in this worktree, so no Android
build has been tried. The Health Connect work is:

- A Kotlin reader for `StepsRecord` (aggregate), `ExerciseSessionRecord` and
  `DistanceRecord`, returning the same two record shapes.
- The permission request through `RegisterActivityContracts` (in
  `expo-modules-core`, used by `expo-file-system`).
- The manifest entries that `react-native-health-connect`'s plugin adds: the
  `androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE` intent filter (Android 13
  and earlier) and the `ViewPermissionUsageActivity` alias (Android 14 and
  later), plus a privacy-policy screen.
- `minSdkVersion` 26, and the Google Play health-permissions declaration.

## Open questions

- Should the thresholds above be checked against real runners' data before a
  demo?
- A store build needs the HealthKit capability on the App ID. [inferred] EAS
  capability sync should add it from the entitlement on the next build.
- Should the Finder remember that the shopper connected Health, and offer the
  Health start by default next time?

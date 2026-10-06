# Android store build and OTA in the deploy workflow

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5 (1M context)
**System:** Expo
**Scope:** Diagnose the failed Android production build
`f8635835-5422-42fc-b923-14a24c46aeb8`, then add Android jobs to
`.eas/workflows/deploy-to-testflight.yml` and rename it to
`.eas/workflows/deploy.yml`.

## Outcome

The build failure was local, not in the repo. [observed] EAS failed in
`CONFIGURE_EXPO_UPDATES` with "Runtime version calculated on local machine not
equal to runtime version calculated during build" (`850f1334…` local,
`6027f0e6…` on EAS). The fingerprint diff named one changed source,
`node_modules/@react-native-masked-view/masked-view`. Its local
`android/src/main/AndroidManifest.xml` had lost `package="org.reactnative.maskedview"`
compared with the published 0.3.2 tarball. A clean
`bun install --frozen-lockfile` restored it, and the local Android fingerprint
then equalled the EAS value `6027f0e65c6315df07a5a8ae27c3a94164898805`.
[observed] No script in the repo writes that file; the tool that changed it is
unknown.

The workflow now runs a parallel Android branch: `get_android_build` →
either `build_android` → `play_internal` (a `submit` job), or
`publish_android_update`. `eas.json` gives the production submit profile
`android.track: internal`. [observed] `eas workflow:validate` reports the YAML
valid.

The file is now `.eas/workflows/deploy.yml`, because it no longer only
targets TestFlight. The `concurrency` group uses `workflow.filename`, so runs
of the old and new file names do not cancel each other during the switch.

## What worked well

- The fingerprint diff in the build log pointed at one package directory.
  Hashing the published tarball's files against the local copy found the one
  changed file in a single step.
- `@expo/fingerprint`'s own CLI (`fingerprint:generate --platform android
  --debug`) ran even while `expo config` was broken, and its per-file hashes
  confirmed the fix against the EAS value.
- The iOS branch transferred to Android with only the platform and the
  store-upload job changed.

## Friction and blockers

- `eas build:view <id> --json` failed with only
  "`expo config --json` exited with non-zero code: 1", because the local
  `@expo/cli` could not resolve `debug`. From outside the project it says
  "Run this command inside a project directory." The Expo MCP `build_info` and
  `build_logs` tools read the same build without a working local project.
  [observed]

## What was hard

- The fingerprint diff shows the changed directory and two hashes, not the
  changed file. Finding the file needed a second, debug fingerprint run and a
  comparison with the npm tarball.

## Comparative friction

Not observed.

## Improvement ideas

- On a runtime version mismatch, EAS could print the per-file difference for
  each changed `dir` source, or suggest a clean install when the source is
  under `node_modules`.
- `eas build:view` only reads remote build data; it should not need a
  resolvable local app config to print it.

## Follow-ups

- [inferred] The Android Play submission needs the app in Google Play Console
  and a Google Service Account key in EAS. Neither was checked in this task.
- [inferred] The first Android run makes a native build and a Play
  submission, because build `f8635835…` errored and no other completed Android
  store build with this fingerprint was seen.

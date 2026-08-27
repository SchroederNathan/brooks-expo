# Repack build number read back from EAS

**Date:** 2026-08-27
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** Fix the `repack` build-number hook in
`.eas/workflows/deploy-to-testflight.yml`. Every push run since the repack
branch became reachable has failed at TestFlight upload.

## Outcome

The `SOURCE_BUILD_NUMBER + 1` hook recorded in
[2026-08-26-expo-eas-workflow-testflight.md](./2026-08-26-expo-eas-workflow-testflight.md)
is wrong for a structural reason, not an off-by-one. `SOURCE_BUILD_NUMBER` comes
from `get_ios_build`, which is pinned to a fingerprint. Every repack of the same
native layer resolves to the *same* source build, so the expression returns a
constant. [observed]

Run `01a043d7` proves it: `get_ios_build` returned build `5485a9ff`
(`app_build_version: 6`), the hook logged `Repacking 6 as build number 7`, and
App Store Connect rejected the upload with
`ENTITY_ERROR.ATTRIBUTE.INVALID.DUPLICATE`, `previousBundleVersion: 7`. Run
`01a043ca` before it failed the same way from the same source build. [observed]

The number that is already correct is the one EAS assigns. A repack consumes a
remote increment like any other build: records 8 and 9 are both repacks, and
`eas build:version:get --platform ios --json` returns `{"buildNumber": "9"}`
after run `01a043d7`. [observed] The build record carries that number before
the `after_install_node_modules` hook runs, so the hook can read it back instead
of deriving it.

`tools/eas/pin-ios-build-number.js` now shells out to
`eas build:version:get --platform ios --profile production --json
--non-interactive` and writes the result into `expo.ios.buildNumber`. The
workflow hook is one line. `eas workflow:validate` passes. [observed]

## What worked well

- `EXPO_TOKEN` is present in the repack job environment (masked in the build
  log as `EXPO_TOKEN=********`), so `eas-cli` authenticates on the builder with
  no extra wiring. [observed]
- The workflow run detail exposes each job's resolved `outputs`. Seeing
  `get_ios_build.outputs.app_build_version: "6"` next to
  `repack_ios.outputs.app_build_version: "9"` made the two-counter problem
  obvious without reading a single log line. [observed]
- The build log embeds the full job spec, including the hook's `run` script and
  the `builderEnvironment.env` map. Confirming `SOURCE_BUILD_NUMBER: "6"` was
  actually delivered took one grep. [observed]

## Friction and blockers

- The EAS build record and the shipped artifact disagree, and the record is the
  one surfaced everywhere in the dashboard and the API. `build_list` reports
  `appBuildVersion: "9"` for an IPA whose `CFBundleVersion` is `7`. Any
  diagnosis that trusts the record concludes the workflow is fine. [observed]
- Nothing in the failure names the build number as a workflow concern. The
  `testflight` job reports `UNKNOWN_ERROR`; the real message is Apple's, several
  hundred lines into an altool dump.

## What was hard

Finding a number that is monotonic across *both* branches of the workflow. The
alternatives considered — a timestamp, a git commit count, the latest store
build from an unfiltered `get-build` — each introduce a second counter running
alongside the EAS remote one, and the two drift the moment the branches
alternate. Reading the remote counter back keeps one counter, which is also why
the fix leaves `appVersionSource: remote` and `autoIncrement` alone.

`git rev-list --count HEAD` was ruled out early: the repack worker gets a
project archive rather than a clone, and no git invocation appears anywhere in
the build log. [observed]

## Comparative friction

Not observed.

## Improvement ideas

- `repack` should apply remote versioning to the regenerated Info.plist. It
  already consumes the increment; not writing it is the whole defect. Failing
  that, `repack` should refuse to emit a store-distribution artifact whose
  `CFBundleVersion` does not match the build record.
- The repack job's `pre-packaged-jobs` section documents `js_bundle_only` as
  skipping "app metadata" updates, but does not say that the default path
  regenerates the version from app config. That sentence is the whole trap.
- A build record whose `appBuildVersion` provably differs from the artifact's
  `CFBundleVersion` should be flagged in the dashboard.

## Follow-ups

- Verify on the next repack run by reading `CFBundleVersion` out of the IPA, not
  the EAS build record.
- Report the repack versioning defect to Expo. Two diary entries now describe it.
- Repack docs still warn it is unsuitable for production submissions
  ("correct symbolication and app signing"). Unresolved for App Store releases;
  TestFlight-only is the current scope.
- Consider a `typecheck` gate job before `build_ios`.

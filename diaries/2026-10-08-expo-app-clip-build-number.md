# The App Clip's build number in workflow builds

**Date:** 2026-10-08
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** EAS build `49b851e7` (deploy workflow, PR #23) failed: App Clip `CFBundleVersion` 1 against the app's 35; `plugins/with-target-versions.js`, LLP 0007#build-numbers

## Outcome

The first store build with the App Clip failed in Xcode's
`ValidateEmbeddedBinary`: "The CFBundleVersion of an App Clip ('1') must
match that of its containing parent app ('35')". The widget logged the same
mismatch as a warning. A new config plugin adds a run-script phase to the
widget and the Clip that copies both versions from the app's Info.plist file
at build time. See LLP 0007#build-numbers.

Checked with EAS simulator build `730cdbd9`. Its environment had
`EAS_BUILD_IOS_BUILD_NUMBER=35`, so apple-targets gave the Clip
`CURRENT_PROJECT_VERSION = 35`, while the app's Info.plist file said 1 (a
simulator build has no credentials, so EAS does not update the files). The
Xcode log shows "PhaseScriptExecution Match the app version" for the widget
and the Clip, and all three built bundles read `1` / `1.0.0`. So the phase
ran after Xcode's Info.plist step and its value won. A store build was not
run; there EAS writes the real number into the app's file, which the phase
then copies.

## What worked well

- The EAS log named the step that writes versions ("Updating versions in
  .../targets/clip/Info.plist"), and `npm pack @expo/build-tools` gave the
  code behind it in a minute.
- The earlier simulator build was the control. Its environment had
  `EAS_BUILD_IOS_BUILD_NUMBER=34` and its Clip had 34, which pointed at the
  one variable the workflow build lacked.
- `expo prebuild --no-install` on Linux, plus both pbxproj parsers (`xcode`
  and `@bacons/xcode`), checked the new phases without a Mac.

## Friction and blockers

- The first theory (Info.plist generation always overrides the file) did not
  fit the simulator build, where the Clip took 34. Only the environment
  dumps of the two builds explained it.
- `eas build:view` only works inside a project directory; from `/tmp` it
  printed "Run this command inside a project directory." The Expo MCP
  `build_info` tool gave the log URLs instead.

## What was hard

- Three tools each own part of the number: EAS writes Info.plist files after
  prebuild, Xcode's generated Info.plist prefers `CURRENT_PROJECT_VERSION`,
  and apple-targets fills that setting from an environment variable that
  only some EAS builds have.
- Plugin order: `withMod` actions run newest first, and apple-targets edits
  the project in a custom mod that runs after `xcodeproj`. A regular
  `withXcodeProject` plugin would run before the Clip target exists. A
  finalized mod runs after all of them.

## Comparative friction

Not observed.

## Improvement ideas

- EAS Build: export `EAS_BUILD_IOS_BUILD_NUMBER` to later phases when the
  number is incremented on the build machine (workflow builds), as it is for
  builds the CLI starts.
- EAS Build: when updating versions, also set `CURRENT_PROJECT_VERSION` and
  `MARKETING_VERSION` for targets with `GENERATE_INFOPLIST_FILE = YES`;
  writing the Info.plist file has no effect there.
- `@bacons/apple-targets` and `expo-widgets`: do not hard-code
  `CURRENT_PROJECT_VERSION = 1` for embedded targets; inherit or copy the
  app's version.

## Follow-ups

- Merge the fix; the deploy workflow then builds iOS again.

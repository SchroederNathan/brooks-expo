# TestFlight or OTA workflow, and a Check for updates row

**Date:** 2026-09-30
**Agent:** Claude Opus 5.5 (1M context)
**System:** Expo
**Scope:** Replace the repack branch of `.eas/workflows/deploy-to-testflight.yml`
with the EAS Update branch used by the Amber project, and add a manual update
check to the Account screen.

## Outcome

The workflow now follows Amber's shape: `checks` (type check) and
`fingerprint` → `get_ios_build` → either `build_ios` → `testflight`, or
`publish_ios_update`. A `force_native` dispatch input forces a new binary.
[observed] The Expo MCP `workflow_validate` tool reports the YAML valid.

Supporting changes [observed]:

- `expo-updates@57.0.24` added with `bunx expo install`.
- `app.json`: `runtimeVersion.policy: fingerprint` and the
  `https://u.expo.dev/<projectId>` updates URL. `expo config --type public`
  resolves both.
- `eas.json` production profile: `channel: production`,
  `environment: production`.
- `tools/eas/pin-ios-build-number.js` deleted. It existed only for the repack
  build-number defect in
  [2026-08-27-expo-repack-build-number.md](./2026-08-27-expo-repack-build-number.md).
  An update makes no new binary, so no build number is involved.
- `src/utils/updates.ts` holds `useUpdateCheck()`. The Account screen renders it
  as one more ruled row: check → download → "Update ready / Tap to restart".

The 2026-08-26 diary chose repack because the project had no `expo-updates`.
That reason is gone, and repack's documented warning about production
symbolication and signing goes with it.

## What worked well

- Amber's workflow transferred almost unchanged. This project has no app
  variants and no `EXPO_PUBLIC_*` variables, so the `APP_VARIANT` env blocks
  were not needed.
- `get-build` takes both `fingerprint_hash` and `runtime_version`. With the
  fingerprint runtime policy the two are the same hash.

## Friction and blockers

- `bunx eas-cli@latest workflow:validate` failed with
  `Cannot read properties of undefined (reading 'const')` on the new file *and*
  on the unchanged file from `HEAD`, which validated on 2026-08-27. The CLI
  failure is not about the YAML. The Expo MCP validator accepted the file.
  [observed]

## What was hard

Not observed.

## Comparative friction

Not observed.

## Improvement ideas

- `eas workflow:validate` should report a schema-loading failure as a CLI
  error, not as "Workflow configuration YAML is not valid".

## Follow-ups

- The first push after this change makes a full native build, because no
  existing build has `expo-updates` or the `production` channel. Testers must
  install it from TestFlight before updates reach them.
- The update row is only exercised end to end in a store build. A dev build
  shows "Off in development builds".

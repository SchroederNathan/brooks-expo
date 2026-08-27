# Fingerprint-gated TestFlight workflow

**Date:** 2026-08-26
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** Add `.eas/workflows/deploy-to-testflight.yml` — push to `main` ships an iOS build to TestFlight, rebuilding natively only when the fingerprint changes.

## Outcome

Added a five-job EAS workflow: `fingerprint` → `get-build` → (`build` | `repack`) → `testflight`.
`eas workflow:validate` reports the YAML valid. [observed]

Key design decision: the canonical Expo "deploy to production" example sends an
**EAS Update** when the fingerprint matches. This project has no `expo-updates`
dependency [observed], so that branch had nothing to ship. The `repack` job
replaces it: it swaps the new JS bundle and app metadata into the matching native
binary and emits a new signed build, which TestFlight accepts. No `expo-updates`
required. [inferred — repack docs describe the mechanism; not yet run here]

Scoped to iOS only. `eas.json` configures `submit.production.ios.ascAppId` and no
Android service account [observed], so an Android branch would fail at submit.

## What worked well

- The `fingerprint` job's CNG requirement is already satisfied: `/ios` and
  `/android` are gitignored, so the workspace the job checks out has no native
  dirs. [observed]
- `get-build` with `wait_for_in_progress: true` collapses the case where two
  pushes land close together on the same native layer — the second waits instead
  of starting a duplicate compile.
- `eas workflow:validate` does real server-side validation, not just JSON Schema.
  It caught nothing here, but it is the only authoritative check.

## Friction and blockers

- The `repack` example in `pre-packaged-jobs.mdx` declares `after: [repack, build]`
  on the downstream job but then reads `${{ needs.<id>.outputs.build_id }}`.
  `syntax.mdx` defines `needs` as "a record of all upstream jobs specified in the
  current job's `needs` list" — so that reference reads from the wrong context.
  Used `after.<id>.outputs.build_id` instead. Both forms validate, so the CLI does
  not catch the difference. [observed]
- `docs/pages/eas/workflows/examples.mdx` 404s; the examples are a directory
  (`examples/deploy-to-production.mdx`). Cost one fetch to discover.

## What was hard

Choosing between OTA updates and repack. They solve the same problem — "the native
layer did not change, ship JS faster" — but have opposite tradeoffs. Updates need
`expo-updates` wired in and reach existing installs; repack needs nothing but
produces a new binary each time. For a TestFlight-only pipeline repack is the
smaller change.

## Comparative friction

Not observed.

## Improvement ideas

- Fix the `needs`/`after` context mismatch in the repack example in
  `pre-packaged-jobs.mdx`.
- Document whether `repack` re-resolves the build number under
  `appVersionSource: remote` + `autoIncrement: true`. TestFlight rejects duplicate
  build numbers, so this decides whether the repack path works at all, and the
  docs do not say.

## First run results

Manual run `01a0407a-547e-7295-8925-98de75d1d105` (2026-08-26 23:49 UTC) succeeded
end to end: `fingerprint` -> `get-build` -> `build_ios` -> `testflight`.
Build 5 (`aafe9d76`) reached TestFlight. [observed]

Two things that run established:

- `get_ios_build` returned empty outputs, so the run took the full-build branch.
  Builds made before this workflow existed carry no fingerprint hash EAS can match
  against. Build 5 records `079e5844...`, so the repack branch only becomes
  reachable from the second run onward. [observed]
- The `build` path increments correctly under `appVersionSource: remote` +
  `autoIncrement: true` — it issued build number 5. The repack path is still
  untested. [observed]

Pushes to `main` do not trigger the workflow. `app.githubRepository` is `null` for
this project, so EAS never sees the push. `on: push` is inert until the repository
is connected in project settings. Commits `515bd08` and `6b60d79` both landed on
`origin/main` and produced no run. [observed]

## Follow-ups

- Connect the GitHub repository to the EAS project. Until then only
  `eas workflow:run` works.
- Verify on the first repack run that the build number increments. If it does not,
  the fix is to bump it in a `repack` hook or drop the repack branch.
- Repack docs warn it is unsuitable "for production builds that require the
  complete pipeline for correct symbolication". Confirm crash reports from
  repacked TestFlight builds symbolicate acceptably before reusing this shape for
  App Store releases.
- Consider a `typecheck` gate job before `build_ios` so a broken push does not
  spend build minutes.

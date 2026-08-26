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

## Follow-ups

- Verify on the first repack run that the build number increments. If it does not,
  the fix is to bump it in a `repack` hook or drop the repack branch.
- Repack docs warn it is unsuitable "for production builds that require the
  complete pipeline for correct symbolication". Confirm crash reports from
  repacked TestFlight builds symbolicate acceptably before reusing this shape for
  App Store releases.
- Consider a `typecheck` gate job before `build_ios` so a broken push does not
  spend build minutes.

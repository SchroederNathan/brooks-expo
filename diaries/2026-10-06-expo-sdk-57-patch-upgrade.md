# Expo SDK 57 patch upgrade (57.0.4 → 57.0.27)

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5 (Claude Code)
**System:** Expo
**Scope:** Run the `expo-upgrade` skill: move to the latest stable SDK and
clear every `expo-doctor` failure.

## Outcome

- [observed] The latest stable SDK on the versions API was 57 (`~57.0.27`).
  SDK 58 (`58.0.6`, `next` tag) pins React Native `0.88.0-rc.3` and has no
  release notes, so it is still a preview. The app stays on SDK 57.
- [observed] `expo` went from `~57.0.4` to `~57.0.27`. This passes `57.0.9`,
  the first release without the Hermes V1 memory regression that hits apps
  using `react-native-worklets` / `react-native-reanimated`.
- `npx expo install --fix` moved React Native `0.86.0` → `0.86.3`, Reanimated
  `4.5.0` → `4.5.1`, Worklets `0.10.0` → `0.10.1`, Screens `4.25.2` →
  `~4.26.0`, and every `expo-*` package to its current 57.0.x patch.
- `app.json`: removed `newArchEnabled` (default) and the top-level `splash`
  key, which the SDK 57 schema rejects. The `#FFFFFF` splash background moved
  to the `expo-splash-screen` plugin options.
- `react-native-keyboard-controller` stays on `^1.22.4` and is listed in
  `expo.install.exclude`. See *Friction*.
- [observed] `npx expo-doctor`: 21/21 checks pass. `bun run typecheck` and
  `npx expo export -p ios --clear` succeed.
- [observed] After `bunx expo prebuild --clean -p ios`, the debug build
  succeeded (0 errors) and ran on an iOS 26.5 simulator (iPad Pro 11-inch
  M5). Home, Browse, and Browse search (keyboard open, 5 results for "ghost")
  rendered. Metro logged no errors or warnings.

## What worked well

- `expo-doctor` named both schema errors and every duplicate module with its
  path, so each fix was direct.

## Friction and blockers

- `npx expo install expo@latest` wrote `"expo": "^57.0.27"` (caret), not the
  usual tilde. Changed by hand to `~57.0.27`.
- `npx expo install --fix` downgraded `react-native-keyboard-controller` from
  the project's `^1.22.4` to SDK 57's pinned `1.21.9`. A silent downgrade of a
  native library that the login and search screens use is a larger risk than
  a patch upgrade should carry, so the newer version stays and the package is
  excluded from the version check. Revisit this on the next SDK bump.
- After the upgrade, `expo-doctor` reported duplicates. A clean
  `node_modules` reinstall removed the same-version copies (`expo-constants`,
  `expo-font`, `@expo/log-box`). One duplicate stayed:
  `expo-router/node_modules/react-native-screens@4.27.0` next to the root
  `4.26.2`. The cause was a stale nested entry in `bun.lock`
  (`"expo-router/react-native-screens"`). Deleting that line and reinstalling
  hoisted one copy.

## What was hard

- [inferred] Bun keeps a nested lock entry once it exists, even when the root
  version now satisfies the dependent's range (`^4.26.0`). A plain reinstall
  does not fix it; only an edit to the lockfile does.

## Comparative friction

Not observed.

## Improvement ideas

- `npx expo install expo@latest` could write a tilde range to match the rest
  of the SDK packages.
- `npx expo install --fix` could warn before it downgrades a package below the
  version that the project already declares.
- The `expo-doctor` duplicate check could detect a stale nested Bun lock entry
  and print the exact `bun.lock` key to remove.

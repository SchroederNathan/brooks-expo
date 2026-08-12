# Fix Expo Go iOS startup crash

**Date:** 2026-07-13
**Agent:** Codex (GPT-5)
**System:** Expo
**Scope:** Diagnose and fix the Expo app crashing at startup in the iOS Simulator

## Outcome

[observed] The JavaScript bundle completed, but Expo Go 57.0.2 crashed with
`EXC_BAD_ACCESS` on its React Native JavaScript thread inside
`JSIWorkletsModuleProxy::toOptimizedObject`. The app resolved
`react-native-worklets` 0.10.2 transitively, while Expo SDK 57 declares 0.10.0
in `expo/bundledNativeModules.json`. Pinning Worklets 0.10.0 directly restored
the native/JavaScript version match.

## What worked well

[observed] Capturing the simulator `.ips` report distinguished a native JSI
crash from a Metro or application exception. Comparing `npm ls` with Expo's
bundled native-module manifest exposed the patch-version mismatch.

## Friction and blockers

[observed] `npx expo install --check` reported that dependencies were current
even though a transitive native package had resolved to a different patch than
the Expo Go binary. Reinstalling Expo Go reproduced the crash because it did not
change the dependency mismatch.

## What was hard

[observed] Metro emitted no runtime error because the process crashed below the
JavaScript exception boundary. The native stack named Worklets but did not name
the mismatched package versions.

## Expo and Exact comparison

Not observed.

## Improvement ideas

[inferred] `expo install --check` could validate transitive packages that have
native code against `bundledNativeModules.json`, especially Reanimated's
Worklets peer. Expo Go could also fail with a version diagnostic before
installing an incompatible JSI proxy.

## Follow-ups

None.

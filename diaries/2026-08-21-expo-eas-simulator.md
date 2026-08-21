# EAS Simulator live development session

**Date:** 2026-08-21
**Agent:** Codex
**System:** Expo
**Scope:** Prepare and launch Brooks in a remote iOS EAS Simulator with live local source updates.

## Outcome

[confirmed] Added the Expo SDK 57-compatible `expo-dev-client`, generated and built a local Debug simulator app, and connected it to a dedicated Expo tunnel. [observed] EAS Simulator session `01a0250e-c976-7f88-a474-9d69f6cdf478` rendered the Brooks home screen and exposed a browser preview.

## What worked well

[observed] Deferring cloud-session creation until the native app and Metro tunnel were ready avoided paying for local build time. [observed] `eas simulator:exec` transferred the 63.7 MiB `.app`, and semantic agent-device selectors connected and reloaded the development client successfully.

## Friction and blockers

[observed] The first native Debug build emitted a large volume of dependency warnings, which made progress harder to read despite completing successfully. [observed] Port 8082 was occupied, so the dedicated Metro server used port 8083. [observed] The dev menu exposed three nodes labeled `Reload`; adding `role=button` disambiguated the action.

## What was hard

[observed] A useful live preview required coordinating a simulator-native development client, a remotely reachable Metro tunnel, and the billed cloud session in the correct order.

## Comparative friction

Not observed.

## Improvement ideas

[inferred] EAS Simulator could surface the browser preview URL and configured auto-stop time in `simulator:get --json`, and simulator builds could offer a concise warnings summary.

## Follow-ups

[confirmed] Stop the EAS session early if the full 30-minute window is not needed.

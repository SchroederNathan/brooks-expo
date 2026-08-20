# Project Memory

## Project Environment

- Expo SDK 57 (`expo` and `expo-router` 57.0.x), React Native 0.86, React 19.2,
  New Architecture enabled; routes live in `src/app`.
- Bun 1.2.22 is the package manager (`bun.lock`). Use `bun run start`,
  `bun run ios`, `bun run android`, `bun run web`, and `bun run typecheck`.
- Metro uses port 8081. `metro.config.js` excludes `tools/` from crawling.
- iOS and Android native projects are checked in; web uses Metro single output.
- Configured app identifiers in `app.json` are `com.exponathan.brooks`, while
  checked-in native projects currently use `com.brooks.prototype`.
- No app unit-test or E2E runner is configured. The available static check is
  TypeScript; app UI is validated interactively with Argent.

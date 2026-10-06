# Project Memory

## Project Environment

- Expo SDK 57 (`expo` and `expo-router` 57.0.x), React Native 0.86, React 19.2,
  New Architecture enabled; routes live in `src/app`.
- Bun 1.2.22 is the package manager (`bun.lock`). Use `bun run start`,
  `bun run ios`, `bun run android`, `bun run web`, and `bun run typecheck`.
- Metro uses port 8081. `metro.config.js` excludes `tools/` from crawling.
- Generated iOS and Android native projects are present locally but ignored by
  git; web uses Metro single output. iOS uses `com.exponathan.brooks` in both
  `app.json` and the generated native project.
  Android is mismatched: `app.json` uses `com.exponathan.brooks`, while the
  generated native project uses `com.brooks.prototype`.
- No app unit-test or E2E runner is configured. The available static check is
  TypeScript; app UI is validated interactively with Argent. Existing visual
  baselines live under `.baselines/ios` and `.baselines/android`.
- iOS 27.x simulators crash dev builds at launch (no `UIApplicationSceneManifest`
  in the generated Info.plist). Verify on an iOS 26.5 simulator, which also has
  Liquid Glass.
- If the local `ios/` is older than `node_modules` (pod "differs from the
  version stored in Pods/Local Podspecs", or Swift errors in `AppDelegate.swift`),
  run `bunx expo prebuild --clean -p ios`; `ios/` is generated and gitignored.
- `expo run:ios --no-bundler` opens the dev client on 8081; to use another
  Metro port, open `exp+ecommerce-demo://expo-development-client/?url=http%3A%2F%2Flocalhost%3A<port>`.

# Fix the Android release build: missing splash logo drawable

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5 (Claude Code)
**System:** Expo
**Scope:** EAS Android production build `ec92535c` failed on commit `4161abf`
(SDK 57.0.27 upgrade).

## Outcome

- [observed] The build failed in `:app:processReleaseResources`:
  `resource drawable/splashscreen_logo ... not found`.
- [observed] Cause: the upgrade changed `"expo-splash-screen"` to
  `["expo-splash-screen", { "backgroundColor": "#FFFFFF" }]`. With options, the
  plugin runs. Its Android theme always sets `windowSplashScreenAnimatedIcon`
  to `@drawable/splashscreen_logo`. It deletes the template's placeholder
  `splashscreen_logo.png` files and writes new ones only when `image` is set.
  With no options, the plugin does nothing and the template's placeholder
  stays, so earlier builds linked.
- [observed] Before the upgrade, the Android `splashscreen_logo.png` from
  prebuild was the Expo template placeholder (a grey grid with circles), not
  plain white.
- Fix: the plugin's `android` options now set
  `image: ./assets/splash-icon.png` and `imageWidth: 120`. The chevron draws at
  about 82 dp, close to the first frame of the JS splash.
- [observed] A local `expo prebuild -p android` wrote `splashscreen_logo.png`
  in all five densities. `./gradlew :app:processReleaseResources` exited 0.
- [observed] An iOS prebuild with the same options has no image view in
  `SplashScreen.storyboard` and a white background. iOS is unchanged.
- Not done: a full release build and an on-device look at the Android splash.

## What worked well

- `eas build:view --json` gave the log URL. The failing task and resource
  name were in the Gradle output.
- A prebuild in a scratch copy reproduced the dangling reference in
  `styles.xml` in seconds, with no Gradle run.

## Friction and blockers

- `eas build:view` failed until `node_modules` was installed, because it
  resolves config plugins.
- The log file is Brotli-compressed with no `Content-Encoding` header.
  `curl --compressed` returned nothing and `gunzip` rejected it. Node's
  `zlib.brotliDecompressSync` decoded it.

## What was hard

- The upgrade looked like a pure config move (top-level `splash` to plugin
  options). Passing any options switches the plugin from no-op to active,
  and that changes which Android resources exist.

## Comparative friction

Not observed.

## Improvement ideas

- `expo-splash-screen` could skip the `windowSplashScreenAnimatedIcon` item,
  or keep the template drawable, when no `image` is given.
- `expo-doctor` or prebuild could warn when the plugin has options but no
  Android `image`.
- EAS log downloads could set `Content-Encoding: br`, or document the format.

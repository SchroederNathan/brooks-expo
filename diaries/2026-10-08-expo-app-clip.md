# An e-commerce App Clip for the PDP and the bag

**Date:** 2026-10-08
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** iOS App Clip target (`targets/clip`), Clip-only routes, bag handoff through the App Group, AASA and Smart App Banner, LLP 0007

## Outcome

The iOS build now carries an App Clip, `com.exponathan.ecommercedemo.clip`.
It runs the same JS bundle as the app. A local module (`modules/brooks-app-clip`)
tells the JS which binary it is in, and `Stack.Protected` removes the tabs,
Run Club and mileage screens from the Clip. The Clip opens on New Arrivals,
pushes the PDP, and pushes its own `/bag` screen, which offers the full app
with `SKOverlay`. The bag is now a JSON file in the App Group on iOS, so the
full app opens with the bag the Clip filled. The web build has the AASA file
and the App Clip card tag. See LLP 0007.

Checked on EAS Simulator (session `01a11c3e`, default iPhone, agent-device)
with EAS build `138b4391` (`simulator` profile, Release):

- The Clip installed on its own and opened, with no URL, on New Arrivals
  ("47 styles"), with no tab bar and no back chevron.
- A tile pushed the PDP with a back chevron. Size 10.0 enabled Add to cart.
  Below "Reviews (29)" came "Complete the look": the "Already run in these?"
  row was not there.
- "Bag (1)" in the added sheet pushed the Clip's `/bag`: the heading sat
  below the back chevron, and the "Your bag comes with you" panel sat above
  the sticky Checkout button.
- "Get the app" presented the `SKOverlay` card ("Get the full app", App
  Store, Ecommerce Demo, Developer Preview).
- The full app, installed after that, opened on Home with all five tabs. Its
  Bag tab already held the Hyperion Max 4, size 10.0 · Medium (1D), $200.00,
  with the tab badge at 1. Its own storage was new, so the line came from the
  App Group file. Profile read "Check for updates, Version 1.0.0", so the
  conditional `expo-updates` import still works in the app.
- Size: `clip.app` is 115 MB in the simulator build, which has x86_64 and
  arm64 slices. The arm64 slices plus the other files come to about 65 MB:
  under the 100 MB digital-only limit, far over 15 MB.

Not checked: a link opening the PDP in the Clip (see Friction), the AASA file
on the live domain, a device, and a signed store build.

## What worked well

- The Expo App Clip skill's steps matched the real tools: `bun create target
  clip` installed `@bacons/apple-targets` 5.0.0 and the template's `pods.rb`
  already excluded `expo-updates`.
- `npx expo prebuild --platform ios --no-install` runs on Linux. It showed
  the Clip's generated entitlements (`appclips:`, the App Group, the parent
  identifier), its deployment target and its bundle identifier before any
  cloud build. `expo config --type prebuild` showed both targets in
  `appExtensions`.
- `expo export --platform ios --platform web` caught resolution errors in
  under a minute, copied `public/.well-known/` and used `public/index.html`
  with `web.output: "single"`.
- `Stack.Protected` was enough to give one bundle two navigation trees.
  Reading `useSortedScreens` showed that a guarded screen leaves the
  navigator's screen list, which is why `/` falls through to the Clip's first
  screen.

## Friction and blockers

- `bun create target clip` stopped at "Cannot automatically write to dynamic
  config at: app.config.ts" and exited non-zero, after installing the
  package. It did not write `targets/clip`. The template files were copied
  from the `create-target` package in the bunx cache. LLP 0006's diary saw
  the same message from `expo install`.
- No `node_modules` at the start: `simulator:availability` failed with
  "Failed to resolve plugin for module expo-router" until `bun install`.
- The Apple Team ID is in no config file. It came from the Xcode log of an
  earlier EAS build. EAS log files are Brotli-compressed with a `.txt` name,
  so `grep` and `gunzip` saw binary data until `zlib.brotliDecompressSync`.
- The most recent store build (`92245c38`, the widget change) failed before
  the Xcode step: EAS could not turn on App Groups for the widget's bundle
  identifier ("Apple API error: The request entity is not a valid request
  document object"). The Clip adds a third bundle identifier with App Groups.
- `agent-device` has no way to set an environment variable on launch, so the
  Clip could not get Xcode's `_XCAppClipURL` invocation URL on EAS Simulator.
  Universal links need the AASA file live on the domain.
- The simulator build's tarball holds `clip.app` next to `EcommerceDemo.app`,
  so `install-from-source` could pick either. Both were uploaded from the
  extracted tarball with `agent-device install <bundle id> <path>` instead.
- `agent-device scroll down 2000` did not move the PDP; `scroll bottom` did.
  `find text` for a label that is not on screen printed a diagnostics hint,
  not a plain "not found".
- `@bacons/apple-targets` adds every file in `targets/clip` to the Clip's
  resources, so `pods.rb` ships inside `clip.app`. It is harmless, but it is
  in the bundle.

## What was hard

- The plugin copies App Groups to the Clip only from `ios.entitlements`.
  `expo-widgets` adds the app's group inside its own plugin, so without an
  explicit entry the Clip would have had no App Group and the bag handoff
  would have failed silently (shared storage falls back to local storage).
- `expo-updates` throws on import when its native module is missing. The
  Account screen imports it, so the Clip needed a conditional `require`.
- A plain `/cart` resolves to a tab that the Clip does not have. Every "Bag"
  button now goes to `bagHref`.

## Comparative friction

Not observed.

## Improvement ideas

- `create-target`: when it cannot edit a dynamic config, still write the
  target folder and print the plugin line, instead of exiting before the
  scaffold.
- `@bacons/apple-targets`: copy App Groups from the final entitlements (after
  other plugins' mods), or warn that the Clip has none while the app has one.
- `expo-updates`: export a safe stub when the native module is missing, as
  `requireOptionalNativeModule` users expect, so a Clip can share JS that
  imports it.
- `agent-device open`: an `--env` option for iOS simulator launches would let
  agents test App Clip invocation URLs with `_XCAppClipURL`.
- The Expo App Clip skill could mention `public/index.html` for
  `web.output: "single"`; it shows only `+html.tsx`.
- `eas credentials` / `@expo/apple-utils`: `updateBundleIdCapabilityAsync`
  should send the `parentBundleId` relationship for App Clip bundle IDs.
  Without it Apple rejects every capability change on the Clip ("The
  relationship 'parentBundleId' is required but was not provided with this
  request"), seen with eas-cli 24.12.0 and an Apple ID session.
- `eas deploy --prod` printed "Your deployment is ready" while the production
  URL still answered 404 for about five minutes. It could wait for the alias,
  or say that it can take minutes.
- The Expo App Clip skill's `curl` check reads the domain, but iOS reads
  Apple's AASA CDN. The skill could add the CDN URL and its one-hour cache.

## Web deploy

With the user's approval, `eas deploy --prod --non-interactive --dev-domain
ecommerce-demo` published the site. The deployment URL worked at once. The
production URL answered "No worker deployment was found" for about five
minutes, then served the AASA file (200, `application/json`), the banner
tag, and `index.html` for `/product/<id>`. Apple's AASA CDN still had a
cached 404 (`max-age=3600`) from before the deploy.

## Follow-ups

- Re-check `https://app-site-association.cdn-apple.com/a/v1/ecommerce-demo.expo.app`
  after the cached 404 expires.
- `eas credentials:configure-build` registered the Clip as an App Clip
  bundle ID but could not turn on its capabilities (missing
  `parentBundleId`, see Improvement ideas). Turn them on in the portal.
- Turn on App Groups and Associated Domains for the Clip's bundle identifier,
  then run a store build.
- App Store Connect App Clip experience (header image, subtitle, action).
- Test a real invocation URL on a device once the domain is live.

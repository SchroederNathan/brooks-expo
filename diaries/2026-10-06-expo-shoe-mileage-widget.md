# Shoe mileage, the Shoes tab, and an App Group widget

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** Owned-shoes store, Health workout mileage, `expo-widgets` widget, Shoes tab replaces the Shoe Finder tab, LLP 0006

## Outcome

The runner can add the shoes they own (from the catalog or by name), with a
start date, miles already on them, and a limit. On iOS the app sums the
Apple Health workout distance since the start date and shows "70% done, time
to replace." A home screen and Lock Screen widget built with `expo-widgets`
shows the most-worn pair. Its props travel through the App Group's shared
`UserDefaults`. The third tab is now Shoes; the Finder is pushed from it, from
Browse and from Profile, and it knows which pair it is replacing.

Checked on a new iPhone 17 Pro simulator (iOS 26.5, Debug build, Metro on
port 8094), after `seedSampleDataAsync` (LLP 0005):

- Shoes tab empty state; the add sheet with the SwiftUI compact date picker;
  catalog search; "Add “Ghost 16”" for a pair the catalog does not list.
- Ghost 16 with 200 starting miles and a 300-mile limit read
  "82% done, time to replace. 248 of 300 mi. About 2 weeks left at your pace"
  (48 miles of seeded runs since the default start date). "Shop the Ghost 18"
  found the successor by model name.
- "Find its replacement" opened the Finder with "Replacing your Ghost 16".
  With unstable-knee answers the support shoes still won, as intended. With
  neutral answers the Ghost 17 and 18 led with "The next Ghost, the line you
  put 248 miles on".
- Home showed the ink nudge; the PDP row opened the sheet with the shoe chosen.
- The App Group plist (`group.com.exponathan.ecommercedemo.plist`) held
  `__expo_widgets_ShoeMileage_timeline` with the pair's strings. The small
  and medium widgets rendered them in the widget gallery and on the home
  screen, and a tap opened the Shoes tab.

Widget design, later the same day: four designs (meter, ring, odometer,
photo) were rendered on the home screen and compared side by side. The user
picked the odometer with the shoe photo and no lime. See
LLP 0006#the-widget-design.

## What worked well

- Widget layouts are JavaScript strings that the app writes to the App Group,
  so a JS reload repaints the home screen widget. Four designs were compared
  with no native rebuild, through a temporary dev-only switch.

- `expo-widgets` needed no Swift. One config-plugin entry generated the
  extension target, the App Group entitlement on both targets, and the EAS
  `appExtensions` entry. The `'widget'` directive kept the widget in the same
  TypeScript file as the call that updates it.
- The Finder's existing `getWorkoutsAsync(days)` already returned per-workout
  distance, so mileage needed no native change. LLP 0005's "native returns
  summaries, JS decides" split paid off.
- `bunx expo config --type prebuild` showed the resolved App Group and
  extension before any build.

## Friction and blockers

- `bunx expo install expo-widgets @expo/ui` could not write the plugin into a
  dynamic `app.config.ts`. It printed the `plugins` snippet instead, which is
  easy to miss in the output.
- During the session most of `node_modules` disappeared (94 entries left)
  between two commands. A plain `bun install` then left
  `react-native-screens` at 4.25.2 while the lockfile pins 4.26.2, and
  `xcodebuild` failed in `RNSStackScreenHeaderCoordinator.mm`
  ("property 'navigationBarCoordinator' not found"). Only
  `rm -rf node_modules && bun install` fixed it. The cause of the first loss
  was not found.
- Metro picked `src/widgets/shoe-mileage.ts` over `shoe-mileage.ios.tsx`, so
  iOS got the empty Android function and the App Group stayed empty. Metro
  tries each source extension in turn, with platform suffixes inside each
  extension, so `.ts` matches before `.ios.tsx` is tried. Renaming the stub to
  `.tsx` fixed it. Found by fetching the dev bundle and searching for the
  module path. TypeScript gave no warning.
- The first widget URL, `ecomdemo://shoes`, matched the first clone of the
  `(index,shop,shoes,cart,account)` array group, so it pushed the Shoes screen
  onto Home's stack with a back button. `ecomdemo:///(tabs)/(shoes)/shoes`
  opens the tab.
- In a debugger probe, `new ExpoWidgets.Widget('ShoeMileage', 'x')` overwrote
  the stored layout, because the constructor writes the layout. A JS reload
  restored it.
- The widget function cannot use module-scope constants, so the brand colors
  are restated in it. The docs say this clearly; it is still easy to break by
  moving a color into the theme.

- `Gauge` with `circularCapacity` dropped its `currentValueLabel` in a home
  screen widget; the label shows only in Lock Screen families. A `ZStack` put
  the text over the ring.
- The Brooks CDN ignored a 600×300 `sw`/`sh` box and returned a 300×300
  square. A centered `fill` crop then cut off the sole, because Brooks frames
  the shoe low (37–82% of the height, measured on 26 cached photos). The
  widget now offsets the square up 10% and clips to the 34–86% band.
- In a `VStack` with a `Spacer`, a resizable `Image` with only a `maxHeight`
  shrank to a thumbnail. A fixed `height` fixed it.

## What was hard

- Choosing what "mileage" means. HealthKit's all-day walking-and-running
  distance would count every step in any shoes. Workout distance is closer to
  wear, and it was already read.
- Keeping LLP 0005's rule that the app never shows the Health sheet at launch,
  while the widget needs fresh numbers. The foreground read checks
  `shouldRequestAccessAsync()` first and reads only if the sheet was answered.
- `expo-widgets` is not in Expo Go, and LLP 0000 keeps Expo Go compatibility.
  The iOS widget file checks `requireOptionalNativeModule('ExpoWidgets')`
  before it requires the package.

## Comparative friction

Not observed.

## Improvement ideas

- `expo install` could edit the plugins array of an `app.config.ts` that
  spreads `config.plugins`, or print the snippet as a highlighted warning.
- The `expo-widgets` docs could show the App Group being read by other native
  code, or state the `UserDefaults` suite and key layout, for teams that also
  write to the group from their own modules.
- Metro could warn when `name.ts` and `name.ios.tsx` both exist, because the
  platform file can never be chosen. This cost the most time in this task.
- Expo Router docs for array groups could say which clone a bare deep link
  resolves to, and show the group-qualified URL form.
- A lint rule for `'widget'` functions that flags references to module-scope
  bindings would catch the runtime "Can't find variable" error at build time.

## Follow-ups

- The App Groups capability and a provisioning profile for
  `com.exponathan.ecommercedemo.ExpoWidgetsTarget` must exist before the next
  EAS store build (LLP 0006#open-questions).
- Rotation (one run, two pairs), a configurable widget, and Android Health
  Connect are open in LLP 0006.

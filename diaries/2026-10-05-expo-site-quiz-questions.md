# Shoe Finder asks the site's own questions, with its videos

**Date:** 2026-10-05
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** `src/screens/finder/quiz.ts` (new), `src/screens/finder/index.tsx`,
`src/screens/finder/from-activity.ts`, `assets/finder/*.mp4`, LLP 0005, LLP 0003

## Outcome

The Finder's condensed 7-question quiz is replaced by the quiz that
brooksrunning.com runs: "Shoe Finder S26 US", version 24. The questions,
answers, branches, scores, progress labels, "Behind the Science" and "What
does this mean?" text are verbatim from the `data-quiz` JSON that
brooksrunning.com/en_us/shoefinder/ embeds. The five barefoot-test clips are
the site's own MP4s, bundled in `assets/finder`. Balance and Flexibility show
both answer clips looping side by side; the knee test plays its clip above
the text answers. The email page is left out (no backend). Apple Health still
pre-fills Use, Trail Type, Training and Mileage, now with the site's answer
codes and mileage bands. `tsc --noEmit` passes. A small Bun script checked
the four branch paths against the site's `jumpToPage` values.

Checked on the "Brooks Health Positive QA" iPhone 18 Pro simulator (iOS
27.2, Debug build): Run or Treadmill drops Trail Type (14 → 13 pages);
Injuries shows "None of these" until a box is ticked; "Behind the Science"
expands; both Balance clips loop side by side and a tap selects one and shows
"What does this mean?"; the knee clip plays above its answers; Women's opens
the size grid; results show the site's headline, the barefoot notes and GTS
support shoes first. After `seedSampleDataAsync`, Connect Apple Health filled
Run or Treadmill (47 runs), Half Marathon (13.1 mi) and 31+ Miles (43 a week),
and the quiz resumed at Training Use. The first run put Addiction Walker 2 in
a marathon runner's results, so walking shoes now lose points on the run
path.

## What worked well

- The site ships the whole quiz config in one HTML attribute. One page load
  gave every string, branch and media URL, so nothing had to be retyped from
  screenshots.
- The media host (finders.brooksrunning.com) serves the MP4s to plain curl.
- `tools/harvest` already had Playwright with Chrome, which got past Akamai.

## Friction and blockers

- Headless Chrome got a 403 from Akamai on the Shoe Finder page. Headed Chrome
  (with a warm-up visit to the home page) got a 200.
- The quiz renders inside a shadow root, and the cookie banner has a hidden
  duplicate "Reject All". `getByText(..., { exact: true }).first()` clicked
  nothing; a regex locator filtered to visible elements worked.
- zsh does not split `$var` into words, so a `set -- $pair` download loop
  saved nothing. Running the loop under `bash` fixed it.
- The simulator's installed app was a Release build with an embedded bundle,
  so Metro changes did not show. A Debug build was needed.
- `pod install` failed on `node_modules/@expo/ui/ios/._ExpoUI.podspec`: the
  external exFAT drive writes AppleDouble `._*` files, and CocoaPods reads
  them as podspecs. Deleting the `._*` files under `node_modules`, `ios` and
  `modules` (64,968 files) got past it, but the drive wrote new ones during the
  build and an ExpoModulesJSI build script failed. Metro also tried to bundle
  `src/app/**/._*.tsx` as routes. What worked: `rsync --exclude '._*'` of the
  project to the internal disk, then build and run Metro from that copy.
  (An unanchored `--exclude tools` also dropped `@babel/core/lib/tools`;
  anchor it as `/tools`.)

## What was hard

- Results. Brooks scores each answer but picks shoes on its server. The app
  sums the site's scores and gives a support shoe at 20 or more. That
  threshold is inferred and marked so in LLP 0005.

## Comparative friction

Not observed.

## Improvement ideas

- `expo run:ios` could warn about `._*` files on non-APFS volumes before
  `pod install` fails on them.

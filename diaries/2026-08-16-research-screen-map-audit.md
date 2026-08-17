# 1:1 screen map of the app and brooksrunning.com

**Date:** 2026-08-16
**Agent:** Claude Opus 5 (1M context)
**System:** Research
**Scope:** Capture every screen and meaningful state of the Expo prototype from
a running iOS build, capture the corresponding surfaces on brooksrunning.com,
and assemble both into a Paper design file for side-by-side comparison.

## Outcome

Captured 58 app states and 30 website states from live software — no
reconstructions.

App coverage by route:

- `(tabs)/index` — 5 states (hero, use-case rail, Run Club, best sellers +
  stories, promise footer)
- `(tabs)/shop` — 2
- `category/[id]` — 5 (expanded title, collapsed title, filtered, empty, plus
  sale and apparel variants)
- Filter sheet — 3 (resting, two facets on, guarded at zero)
- `product/[id]` — 12 (gallery paging, colorway swap, size error, size
  selected, added toast, how-it-runs, copy, apparel, apparel sizing, not-found)
- `(tabs)/cart` — 6 (empty, under threshold, free shipping earned, swipe,
  undo, checkout note)
- `(tabs)/finder` — 11 (intro, seven questions incl. the trail branch, the
  barefoot checkpoint, results, results footer)
- `(tabs)/account` + `login` — 7
- `search` — 4
- Animated splash — 2 frames

Website coverage: entry interstitials, homepage (5 sections), women's PLP (2),
Ghost 18 PDP (3), Shoe Finder (11 steps incl. results), search panel (2), empty
cart, account drawer, mega menu, 404.

The capture confirmed several fidelity claims in LLP 0003 against the live site
rather than against a snapshot:

- The empty-cart line is verbatim: "There's nothing in your cart. Let's remedy
  that, shall we?"
- The Shoe Finder intro headline, blurb, and "Let's go" CTA are verbatim.
- "Take 'em off / Your shoes, that is." is a real site beat, not an invention.
- "Wherever the day takes you" is the site's own homepage section heading.
- The site PDP strikes through unavailable widths per colorway; the app
  reproduces this, including the four-width row.
- Search returned identical Constructor.io suggestion terms ("glycerin 23",
  "glycerin max", "glycerin gts 23") and identical products in app and browser.
- The account drawer's four membership benefits match `RUN_CLUB_PERKS` exactly.

Differences worth recording (site behavior the app deliberately does not carry):
the site gates Shoe Finder results behind an email capture with a Skip link;
its quiz runs ~12 steps with video-demonstrated balance exercises and a
multi-select injury question; it shows a delivery-location modal on nearly
every page load; and its PLP filters live in a persistent left rail rather than
a bottom sheet. The app's homepage hero is Project 222 from the 2026-07-13
snapshot, while the live site now leads with the Ghost Amp.

## What worked well

- `expo run:ios --configuration Release` sidestepped the whole dev-server
  problem: the JS bundle is embedded, so no Metro port is involved and the app
  cannot accidentally attach to another project's bundler.
- `brooks://` deep links reached states that are otherwise hard to drive by
  touch — the not-found PDP and specific categories — in one call each.
- `run-sequence` collapsed multi-tap quiz progressions into single calls.
- Argent's `~/.argent/chromium-cdp-ports.json` allowed adding port 9333 so a
  dedicated Chrome instance could be driven without touching the Electron app
  already occupying 9222.
- `debugger-evaluate` against the Chromium target was the only way to open the
  mega menu, which needs a real `mouseover` — there is no hover gesture tool.

## Friction and blockers

The largest time sink by far was getting a debug build to talk to the right
Metro instance. Port 8081 was held by an unrelated project, and the debug build
resolves `localhost:8081` from a compile-time constant. Three attempts failed:

1. `--port 8082 --no-bundler` — rejected, the flags are mutually exclusive.
2. `RCT_METRO_PORT=8082 ... --no-bundler` — built and installed, but the env var
   did not reach the already-compiled AppDelegate, so the app still loaded the
   other project's bundle and rendered its UI under the Brooks bundle id.
3. `--port 8082` with its own bundler — same result.

Only switching to a Release build resolved it. The intermediate failure mode is
genuinely confusing: the Brooks app launches, renders a completely different
app's interface, and nothing in the log says why.

Catching the Lottie splash also took two attempts. The first burst of
`simctl io screenshot` calls all landed during the native splash, before the JS
had mounted. A longer burst caught frames 7 and 9, which show the wordmark and
the collapse to the chevron.

## What was hard

Reaching states that only exist transiently or behind a specific sequence:

- The PLP empty state is unreachable through filters alone, because Apply is
  disabled at zero results. It requires applying filters first, then stacking a
  franchise chip on top — a path a casual pass would miss entirely.
- The undo bar and the empty cart appear in the same frame, so one capture had
  to serve both and a second capture waited out the 5s timer.
- The site's balance question does not advance on selection; it opens a
  "What does this mean?" modal whose Continue button drives the flow. Two
  attempts read as a broken click before the modal was noticed.

## Comparative friction

Not observed — this task did not implement anything in a second system.

## Improvement ideas

- `expo run:ios` should fail loudly, or at least warn, when the port it will
  bake into the build is already serving a different project. The current
  failure renders another app's UI inside your bundle id with no diagnostic.
  A check of `/status` on the target port at build time would catch it.
- `--port` and `--no-bundler` being mutually exclusive is a defensible rule, but
  the error should name the alternative (`RCT_METRO_PORT`, or a rebuild) rather
  than only stating the conflict.
- `RCT_METRO_PORT` is not honored on an incremental build because AppDelegate is
  not recompiled. Either force a recompile when the value changes, or surface
  the baked-in port in `expo run:ios` output so a mismatch is visible.
- Argent has no hover gesture. Chromium sites commonly gate navigation behind
  `mouseover`; a `gesture-hover` tool would remove the need to hand-dispatch
  mouse events through `debugger-evaluate`.
- Argent's `screenshot` writes to a temp path and returns only that path, so
  every kept capture costs an extra copy step. An optional `outputPath` would
  make capture sessions much cheaper.

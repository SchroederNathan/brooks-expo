# Harvesting the Longer days banner, and trimming two sections off Home

**Date:** 2026-08-26
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** Bring the app's home screen back in line with the current
brooksrunning.com homepage: add the `Longer days. Longer runs.` banner with its
real photography, drop the `Shop all new arrivals` link, drop the Brooks Run
Club section.

## Outcome

Home now runs the site's own section order — hero, new-gear rail, **Longer days.
Longer runs.**, activity rail, New Arrivals, stories, promise band — with two
sections removed rather than restyled. The Run Club band was not a design that
needed fixing; it is not on the site's homepage any more, so it left. The
`Shop all new arrivals` link went for a different reason: it sat under a rail
that already scrolls to the same products, so it was a second, worse route to
one destination.

The banner's artwork came off the live site. `brooksrunning.com` is behind
Akamai (LLP 0002) and answers `403` to `curl`, but the *asset* host is not:

```
curl https://www.brooksrunning.com/en_us/                 -> 403
curl .../demandware.static/.../F26-NA-BRcom-AUG-HP-03-S.jpg -> 200, 195 KB
```

So only the URL lookup needed a real browser, not the download. `tools/harvest`
already carries Playwright with a warmed Chrome session for exactly this wall, so
a throwaway script reused it: load the homepage at a 430pt mobile viewport, find
the `<p>` containing *"Build your mileage"*, walk up four parents, print the
section's `outerHTML`. That gave the exact copy, both CTA hrefs, and the three
responsive sources in one pass.

**The finding that shaped the implementation: Brooks ships this section as one
image.** The mobile source is a 750 × 1450 collage — a washed-out near-white
wash on top, then the action photo inset 25px from the left and bleeding off the
right and bottom. The site lays its copy over the wash and lets the artwork's
aspect set the section height. A pixel scan found the seam at y=557, so the app
cuts there and lays the two halves out independently: the wash is an
`absoluteFill` behind a copy block that sizes to its own text, and the photo is a
sibling rendered to its own aspect.

**The first cut kept the site's left inset but not what fills it, and that is
what made it look broken.** What shows through that gutter on the web is a
*different region of the same photograph* — sampling the strip gives
`(222,209,193)` at one row and `(247,251,250)` at another, so no container colour
can stand in for it. As plain siblings, the strip painted the section's own white
and read as misaligned padding.

So the backdrop layer became **the whole collage**, absolutely positioned across
the section instead of sized to the copy. Everything hidden behind the real photo
(right of the strip, below the seam) is smeared flat from the strip's edge pixel
before encoding — the visible column is untouched source and the asset drops from
100 KB to 14 KB.

Separating the layers then bought something the flat web composite cannot have:
**the photo hangs 32pt below the backdrop's bottom edge.** Offset down from the
panel as well as right of it, it reads as resting on the backdrop rather than
filling a slot cut in it. Measured on device: inset 14pt, overhang 32pt, and the
backdrop is `bottom`-anchored rather than given a height so it still tracks a
copy block that sizes to its own text.

Verified on the iPhone 17 Pro Max simulator (iOS 27.0, Metro on 8085 from this
worktree): the banner renders in the right slot, `SHOP WOMEN` lands on the
Women's Apparel PLP (65 styles), and the New Arrivals rail now flows straight
into the stories rail. A full-resolution capture measures the photo's left inset at
14pt with backdrop — not white — beside it, and the backdrop's bottom edge 32pt
above the photo's. `bun run typecheck` clean. LLP 0003 gains *The Longer days banner, and two sections that left*, and
its home-section table gains the banner and loses Run Club.

## What worked well

- **Harvesting the URL and downloading the asset are separable problems.** The
  instinct with a bot wall is to fetch everything through the browser. Only the
  page HTML needed it here; once the CDN path was in hand a plain `curl` did the
  rest, which kept a one-off scrape out of the harvest tool's committed surface.
- Anchoring the DOM query on a *body-copy string* rather than the headline was
  luck that turned into a lesson. A first attempt matched on `Longer days` and
  walked up six parents, which overshot to `<body>` and dumped 12 KB of inlined
  SVG symbols. `Build your mileage` + four parents landed exactly on the
  `<section>`.
- Measuring the collage seam with Pillow instead of eyeballing it. Scanning
  column x=400 down the image showed the wash sitting at `(251,251,251)` through
  y=556 and dropping to `(51,53,65)` at y=558 — a two-row transition, so the crop
  is exact rather than approximately right.
- `UnderlinedAction` already existed on this screen for the hero's `SHOP NOW`,
  and the site's banner CTAs are the same component in a row. Reusing it meant
  the new section introduced no new interaction vocabulary — and deleting the
  `Shop all new arrivals` caller left its `style` prop with zero users, which was
  a small dead-code cleanup the diff surfaced for free.

## Friction and blockers

- **Two other agents were on the same machine, and one was driving the same
  simulator.** After pointing the app at this worktree's Metro on the iPhone 17
  Pro, a screenshot came back showing a Ghost category PLP that no gesture of
  mine had opened. Argent's `screen-recording` note ("a recording is still
  running… if it was started by another agent, leave it to them") was the tell.
  Moving to the iPhone 17 Pro Max resolved it, but the detection was accidental —
  I noticed a screen I had not navigated to.
- `defaults write com.exponathan.brooks RCT_jsLocation localhost:8085` +
  `restart-app` did **not** repoint the dev client. Metro on 8085 logged no
  bundle request at all while the app happily served the previous session's
  bundle from another project's Metro on 8082, so the screen looked correct-but-
  stale and the new section simply was not there. `open-url` with
  `brooks://expo-development-client/?url=http%3A%2F%2Flocalhost%3A8085` worked
  first try. The stale-bundle failure mode is silent by construction: the app
  renders, so nothing indicates the JS is from the wrong tree.
- `bunx expo start --port 8083` found the port busy and then died on
  `Input is required, but 'npx expo' is in non-interactive mode` waiting for a
  *"Use port 8084 instead?"* prompt no one could answer. Three Metros were
  already up across worktrees.

## What was hard

- Telling a *missing layer* apart from a *bad measurement*. The first version's
  left gutter was the right width — 25/750, exactly the site's — and still looked
  wrong, so the obvious reading was that the inset itself was the mistake and
  should go. It was not; what was missing was the thing behind it. A gap that is
  correct in every dimension and wrong in what fills it is easy to diagnose as a
  spacing bug and delete, and deleting it would have thrown away the composition.
  The check that settled it was sampling the source strip and finding it varied
  down the column: if it had been one flat colour, a `backgroundColor` would have
  been the whole fix and the layer would not have been needed.
- Deciding whether to split the collage at all. Reproducing the site exactly
  means one image at its natural aspect with the copy absolutely positioned over
  it, and that is genuinely simpler — one asset, one `require`, no arithmetic.
  It is also pinned: the copy block's usable height is a fixed fraction of the
  artwork, so a large accessibility text size runs the headline over the runner's
  face, and the section height is locked to `width × 1.933` on every device. The
  split costs a second asset and buys a copy block that sizes to its own content.
  What made it safe rather than a compromise is that the top half is a soft
  gradient with no subject in it, so `contentFit: cover` on a stretched wash is
  invisible — the same trick would be wrong on almost any other photograph. The
  split also turned out to be the only way to hang the photo past the backdrop's
  bottom edge, which the single-image version forecloses by construction.
- Where the two CTAs should land. The site points them at
  `featured/training-gear/{gender}`, which is not one of the ten Constructor
  groups `tools/harvest` walks, and the app's PLP reads the committed catalog
  rather than browsing live. Fabricating the group would have broken LLP 0002's
  one-source-of-truth rule for a link that has to work in a demo, so both CTAs go
  to that gender's apparel category — the closest real thing, documented in the
  editorial entry so the substitution is not mistaken for a harvest bug later.

## Comparative friction

Not observed.

## Improvement ideas

- **A dev client should be able to say which Metro it loaded from, on screen.**
  The 8082-vs-8085 mix-up cost a full verification cycle and produced a
  screenshot that was wrong in a way that looked right. The dev menu knows the
  bundle URL; surfacing it in the Expo dev overlay's default state — or logging
  it once at bundle load — would turn a silent failure into a glance. Related:
  `RCT_jsLocation` is documented as the way to repoint a simulator build, and it
  did nothing here against a dev-client build that had a launcher history. If the
  launcher's stored URL wins over the default, the default should not be
  advertised as a repointing mechanism.
- `expo start` should fall back to the next free port when stdin is not a TTY
  instead of prompting and then skipping the dev server. Non-interactive is
  exactly the case where "port is busy" has one sensible answer, and the current
  behaviour fails in a way that reads as a crash — it prints the prompt it cannot
  ask and exits `Skipping dev server`.
- Argent's tool-server is shared, and a second agent on the same simulator is
  currently only visible as a side effect of the screen-recording notice. A
  device-level "in use by another session since HH:MM" line in `list-devices`
  would let an agent pick an idle target on the first call rather than discover
  the conflict from an unexplained screenshot.

## Follow-ups

None.

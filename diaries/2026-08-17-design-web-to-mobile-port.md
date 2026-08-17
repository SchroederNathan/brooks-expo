# Faithful web-to-mobile port of Home, Category and Shop in Paper

**Date:** 2026-08-17
**Agent:** Claude Opus 5 (1M context)
**System:** Research
**Scope:** Redesign the Home, Category and Shop artboards in the "Brooks Mobile
App" Paper file so they port brooksrunning.com's own section language instead of
generic native patterns. Also make Filson Pro available to Paper.

## Outcome

The Paper file already held a `Website — brooksrunning.com` page with full-page
1440×813 captures of the live site. Those captures — not screenshots of the app —
became the reference. Nine site patterns were read off them and ported:

| Site pattern | App before | App after |
|---|---|---|
| Hero: eyebrow, headline, 2-line blurb, CTAs — and **no badge** | badge + eyebrow + headline + 3-line blurb + button | eyebrow + headline + 2-line blurb + button |
| "Summer's hottest new gear": pale sky-blue gradient band, 4 square lifestyle photos, centred caps captions | absent | added, as a scroll rail |
| "Wherever the day takes you": centred heading, tall lifestyle photo cards | left eyebrow + product-on-white cards in bordered boxes | centred heading, portrait photo cards, caps captions |
| Run Club: full-bleed photo, centred white text | flat navy card, left-aligned | photo band + 38% scrim, centred |
| "Stories to transform your run" | absent | added; blue caps category + date |
| Run Happy Promise: `#003789` band + round seal | light grey band + squiggle + Caveat | blue band, real seal, verbatim two lines |
| PLP: breadcrumb, title, description, pale-blue Shoe Finder card, 4-card category rail, `N products` | title + `58 styles` + chips | all of it, in the site's order |
| Mega menu: Shoes / Apparel / Featured / Best Sellers columns | Franchises / gender / featured | the site's four groups, exact labels |
| Mega-menu promo card | absent | added |

Two colors were sampled from the captures rather than guessed: the new-gear band
is a **sky gradient**, not a flat tint (`#A3C9E4` top → `#C0DAE8` → `#E5EDF7`),
and the promise band reads `rgb(17,55,134)`, confirming the `--color-blue`
`#003789` token.

Filson Pro OTFs were copied from `assets/fonts/` into `~/Library/Fonts`. The
name tables report family `Filson Pro` with styles Regular / Medium / Bold /
Heavy / Black. Paper still reports the family unavailable, so the file's
`--font-display` / `--font-body` tokens remain `Figtree`.

**Hero, second pass.** The first pass added the site's second underlined CTA and
left everything already on the hero in place, which took it to six stacked
elements. A human called it cluttered and was right. Three came off: the lime
`RACE DAY` chip (redundant against an eyebrow that already says this is a race,
and it held a countdown that expired on July 18), the blurb's closing sentence
*"This is Project 222."* (redundant against the headline directly above it), and
the newly added second CTA. The hero is now the site's own four-element
structure: eyebrow, headline, two-line blurb, one action.

[inferred] The lesson generalizes: **porting a section is as much subtraction as
addition.** A faithful port counts the source's elements, not just names them.
The site's hero carries four; ours had accumulated six across two sessions, and
adding a fifth to match one site detail made the whole worse.

## What worked well

- **The captures were reusable as art.** Paper file-assets have public URLs, so
  each capture could be downloaded, measured with Pillow, and then cropped *in
  place* via `background-size` + `background-position` on a Paper rectangle. This
  produced real Brooks lifestyle photography with no image upload — the Paper MCP
  has no upload tool, so this was the only path to non-product imagery.
- **Card edges were found programmatically, not by eye.** Per-column pixel
  standard deviation over a row band separates photos (high variance) from flat
  background, which yielded exact 4-up card boxes for three sections in one pass.
  It failed only on the new-gear band, whose background is itself a photographic
  sky.
- `mode: "replace"` preserves child order, so sections could be rebuilt in place
  and `move_nodes` was only needed to insert the two brand-new sections.

## Friction and blockers

- **Paper caches its font list at app launch.** Installing an OTF mid-session is
  invisible to the MCP server; `get_font_family_info` kept returning "not
  available" across several minutes. There is no rescan tool.
- **Five Paper tools rejected their first call on an argument-name mismatch**:
  `get_font_family_info` (`familyName` → `familyNames`), `write_html`
  (`nodeId` → `targetNodeId`, plus a required `mode`), `move_nodes` (→ `moves`),
  `update_styles` (→ `updates[].nodeIds`), `rename_nodes` (→ `updates`),
  `set_text_content` (`text` → `textContent`), and `export` (→ `nodes`). Each
  cost a round trip.
- `get_screenshot` returns **no output at all** for nodes on a non-active page.
  `open_file` with a `pageId` fixes it, but the failure is silent — it looks like
  an empty design rather than a page-activation problem.
- An empty `<div>` in `write_html` becomes a **Rectangle**, not a Frame, so it
  cannot be filled by a later `insert-children`. Placeholder containers must be
  written with at least one child.

## What was hard

Choosing crop regions that avoid the site's own baked-in text. The Run Club band
carries centred white type, so the obvious centre crop imported a stray "B" from
the headline; only the right-hand 500px of the band was clean. Every reused
photo needed this check, and it is invisible until rendered at final size.

Aligning tile lanes was the one real craft defect found on review: one tile's
`cushion · colorway` meta wrapped to two lines and pushed its price and rating
out of lane with the tile beside it. Fixed by reserving a 30px meta slot on all
four tiles rather than shortening the copy.

## Comparative friction

Not observed — this task never left the design tool.

## Improvement ideas

- Paper MCP: add an image-upload tool, or a `rescan-fonts` call. Without either,
  a licensed font shipped inside a repo cannot reach the canvas in-session.
- Paper MCP: the tool-argument mismatches above suggest the served schemas and
  the tool descriptions have drifted. Every one of them is a name-only error.
- Paper MCP: make `get_screenshot` return an explicit "node is on inactive page
  `<id>`" error instead of empty output.

## Follow-ups

- Flip `--font-display` and `--font-body` to `Filson Pro` after Paper restarts,
  and re-check the three redesigned artboards: Filson is wider than Figtree at
  the same size, so the centred section headings and the `NEW WOMEN'S APPAREL`
  caption (currently 11px with `nowrap` at 172px) are the likely reflow points.
- The hero still runs the **Project 222** campaign; the live site now runs
  **The Ghost Amp** ("Just dropped" / "Amplify your run in the all-new Ghost Amp,
  featuring technology that injects energy into every stride." / `SHOP NOW` +
  `SHOP ALL ROAD RUNNING`). Project 222's July 18 date has passed, so its
  countdown — LLP 0003's top wow item — is now expired. Swapping campaigns is a
  content decision and was left to a human.
- Story-card headlines are placeholder. The site's category eyebrows and dates
  are verbatim (`GEAR AND TECHNOLOGY · April 14, 2026`,
  `RUNNING TIPS · October 23, 2025`), but the headlines sat below the capture's
  fold.
- The site promotes **widths** onto the PLP tile on hover
  (`Widths – Medium, Wide, Extra Wide`). Not added: per-model width availability
  is not in the observed data, and inventing it would put false product facts on
  a mock.

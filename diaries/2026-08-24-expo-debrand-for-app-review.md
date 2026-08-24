# De-branding the app after an App Store Review 4.1(a) rejection

**Date:** 2026-08-24
**Agent:** Claude Opus 5
**System:** Expo
**Scope:** `debrand` branch — remove all third-party content so the app can go
out as an external TestFlight link. See [LLP 0005](../llp/0005-debranding.explainer.md).

## Outcome

The TestFlight submission was rejected under guideline 4.1(a) (Copycats). The
rejection was accurate: the binary carried a real retailer's name, logo, 34
sprite glyphs, licensed typeface, palette, 226 product names, 4,894 CDN photo
URLs, 624 real customer reviews under 557 real names, and a live query against
their search index using the client key from their web bundle.

Two commits:

- `main` — app identity (name, bundle id, Android package, scheme) moved into
  `brand.config.js`, overlaid onto `app.json` by a new `app.config.ts`. The
  bundle identifier changed to a brand-neutral one, because it cannot be
  changed after a build is uploaded to App Store Connect.
- `debrand` — the removal itself, driven by `tools/debrand/`.

Verified: `tsc --noEmit` clean, and `expo export --platform ios` produces a
4.7MB bundle whose asset manifest contains only Archivo and Caveat (both
open-licensed) — a useful proof that the Filson Pro OTFs are actually gone
rather than merely unreferenced.

## What worked well

**`expo export` as a de-branding check.** It lists every bundled asset. That
turned "did I get all the fonts and images out?" from a grep over source into a
statement about the artefact. Faster than a native build and more trustworthy
than reading imports.

**Keeping the exported shape when swapping an implementation.** The live search
client became an on-device index but kept exporting `search`, `autocomplete`,
`SearchHit`, `Suggestions`, and `setInstallId`. The search screen needed no
structural change, and its existing "index unreachable" fallback still made
sense. Same trick on `images.ts`: `heroImage` kept its signature, so eight call
sites did not move.

**Writing the substitution as a transform, not an edit.** The catalog is
re-harvested by `bun run harvest`, so a hand-scrubbed JSON file would be
silently reverted. Putting the vocabulary in `tools/debrand/names.js` also
means the whole substitution is auditable in one file.

## Friction and blockers

**Token-swapping product copy does not work, and looked like it did.** After
mapping 54 franchise names the residual scan was clean for names but the
descriptions still read "In the original Cascadia, trail runner Scott Jurek…".
Renaming the `franchise` field never touched the prose. Two further rounds were
needed — a global pass for franchise names appearing in free text, then
discovering that the prose carried brand *history* and a real athlete, which no
substitution fixes. Generating descriptions from product attributes was the
only honest answer.

**`\bThe\b` would have destroyed the catalog.** `The` is a franchise value in
this data ("The Beast"). A global word-boundary rename over descriptions would
have rewritten the definite article in all 226 of them. The fix was an explicit
`DISTINCTIVE` allowlist — replace `Ghost` and `Glycerin` anywhere, leave
ordinary English words alone, on the reasoning that a common word carries no
brand association by itself.

**Collab product names carry two brands.** "Kraken x Ghost 17" has `franchise:
"Kraken"`, so renaming the franchise field left `Ghost` in the name. Five
products, invisible until a residual scan by field rather than by document.

**A stray non-ASCII digit.** A hex literal came out as `'#2F8F४4'.replace(…)` —
a Devanagari four. It evaluated correctly, which is exactly why it would have
survived review. Worth a lint rule.

## What was hard

**Deciding what counts as third-party.** Names, logos, fonts, photos, and
review text are clear. Prices, ratings, and per-size stock are less so; they are
numbers rather than expression or marks, and they make the size grid and review
panel exercise real layouts. They were kept and the judgement recorded in LLP
0005, because an unexplained kept-thing reads as an oversight.

**The palette and the corner radius.** Easy to treat as out of scope, but 4.1
names user interface alongside name and icon, and LLP 0003 had documented
square corners as a deliberate trait *of that brand*. Copying a distinctive
treatment for no reason is what makes two apps look like one, so the tokens
changed too.

**Replacing photography without a rasteriser.** No `rsvg-convert`, `magick`, or
`cairosvg` on the machine. PIL was present, so the launcher icons are drawn
there with 4x supersampling — PIL has no anti-aliased drawing, so draw-large-
then-downscale is what keeps the chevron's diagonals from stairstepping.

## Comparative friction

Not observed — this task did not touch the other system.

## Improvement ideas

- **`expo export --json` asset manifest as a first-class check.** The bundled
  asset list is exactly what a licence or content audit needs. A documented
  recipe ("prove font X is not in your binary") would help anyone shipping with
  licensed assets, which is most commerce apps.
- **Surface that internal TestFlight testers skip Beta App Review.** This is the
  single most useful fact for anyone in this situation and it is not near the
  submission flow in the docs. A note in the EAS Submit output when a build is
  headed for TestFlight would land it at the right moment.
- **`app.config.ts` overlaying `app.json` deserves a documented pattern.** The
  split used here — static config for the bulk, dynamic config for identity
  only — makes a brand or white-label swap a one-file edit. The configuration
  docs describe the precedence but not this use for it.
- **Guard the harvest → transform → sync order.** `bun run sync` will happily
  copy branded data over de-branded data. A generic hook for "this generated
  artefact has a required post-processing step" would be broadly useful.

## Follow-ups

- Visual verification of the swatch renderer and new palette on a simulator was
  still building when this entry was written. The bundle exports and typechecks
  clean; the screens have not been looked at.
- `tools/harvest/` still targets the real storefront. Kept as the provenance
  record for the schema, but it is a footgun on this branch.
- The invented family names are not trademark-cleared. Fine for a demo.

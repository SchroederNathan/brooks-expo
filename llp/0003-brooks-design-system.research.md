# LLP 0003: Brooks Design System and Screen Patterns

**Type:** Research
**Status:** Active
**Systems:** Brooks, Expo App, Exact App, Design
**Author:** Claude Fable 5
**Date:** 2026-07-13
**Related:** LLP 0000, LLP 0001, LLP 0002

## Summary

[observed] This completes the hands-on pass LLP 0001 called for. Brand tokens are
read from brooksrunning.com's own production stylesheet rather than eyeballed from
screenshots; screen patterns pair that brand with the native-commerce borrows LLP
0001 assigned to Nike, Zappos, adidas, and GOAT.

## Brand tokens

### Color

[observed — `style.css`, `:root` theme block] Brooks's default page theme is
bg `#fff`, border `#e5e5e5`, text `#0e131f`, accent `#003789`, alt-text `#707070`.

| Token | Hex | Where it is used on the site |
|---|---|---|
| `ink` | `#0E131F` | Body text, primary button fill. **This, not `#000`, is Brooks's black.** |
| `blue` | `#003789` | Default accent: links, selected states, focus, cart-badge text |
| `navy` | `#14295F` | Dark-theme background, Run Club card |
| `lime` | `#ECF000` | Cart badge fill, nav highlight, focus outlines, progress fills |
| `sale` | `#D4281C` | Sale prices, errors |
| `surfaceAlt` | `#F8F8F8` | Section background — **and the exact field Brooks shoots product on** |
| `hairline` | `#E5E5E5` | Default border |
| `inkMuted` | `#707070` | Secondary text |

[inferred] **Lime is a spark, not a brand color.** It appears only on badges,
progress fills, and focus states. Used as a surface it stops reading as Brooks.

### Type

[observed] The site is set in **Filson Pro** (Monotype, licensed) at weights
400/500/700/900. Headings are weight 700–900 with very tight leading
(`line-height: calc(1em + 4px)`). Headlines are **sentence case**; ALL CAPS is
reserved for eyebrows, labels, and CTAs, always with ~1.2px positive tracking.

[superseded 2026-08-17] Filson Pro was assumed unavailable, and **Figtree**
(`@expo-google-fonts/figtree`) served as the geometric-humanist substitute.
Licensed Filson Pro OTFs are now provided and bundled in `assets/fonts/`
(Regular 400, Medium 500, Bold 700, Heavy 800, Black 900 — weights read from
each file's OS/2 `usWeightClass`). Filson has no 600; the ramp's 800 slot maps
to Filson **Heavy**. `Caveat` still stands in for the site's handwritten Biro
Script accent — at most one use per screen.

[observed 2026-08-17] The **Paper file still renders Figtree.** Paper reads fonts
from the OS font library, not the repo, and it caches that list at app launch;
the OTFs were copied into `~/Library/Fonts` (family `Filson Pro`, styles
Regular / Medium / Bold / Heavy / Black) but the running app cannot see them.
After a Paper restart, flipping the file's `--font-display` and `--font-body`
tokens to `Filson Pro` converts every artboard at once — that is the only reason
the design system routes both families through tokens.

| Role | Size | Weight | Tracking |
|---|---:|---:|---:|
| Hero display | 40 | 900 | −0.5 |
| Section header | 26 | 800 | −0.3 |
| PDP title | 24 | 800 | −0.3 |
| Product title (tile) | 15 | 700 | 0 |
| Price | 16 | 700 | 0 (tabular) |
| Body | 15 | 400 | 0 |
| Eyebrow / button | 12–14 | 700 UPPERCASE | +1.2 |

### Shape and motion

[observed] **Brooks zeroes `border-radius` sitewide.** Square corners are a brand
trait; only dots and badges are circles. Buttons are 50pt tall, square, uppercase,
and on press they shift up-left against a **hard offset shadow (`6px 6px 0`)** — a
"pressed sticker," not a soft Material elevation. Reproducing that instead of a
blur is most of what makes the buttons feel like Brooks's buttons.

[observed] The site's hero entrance is fade + 40px rise, staggered ~80ms per
element (`.o-hero-home--pre-animation-state`). Sitewide transitions run 0.3–0.6s.

[observed] The brand's most ownable graphic gesture is a hand-drawn **squiggle**
underline used on hover CTAs and annotations.

### Icons and the logo

[observed — real-browser capture, 2026-08-17] The site ships its entire icon set
as one **inline SVG sprite of 81 `<symbol>`s** in the page header (plus a second,
40-symbol `tt-icon-*` sprite that belongs to the TurnTo review widget, not to
Brooks). There is no icon font and no standalone icon-file URLs; page HTML is
behind the Akamai bot wall (LLP 0002), so the sprite was captured from a warmed
Playwright Chrome session — the same technique `tools/harvest` uses.

Ported verbatim into [`src/components/icons.tsx`](../src/components/icons.tsx)
(single-color glyphs behind `BrooksIcon`, plus two-color `InfoIcon` and
`CushionMeter`). What the inventory shows:

- [observed] The utility glyphs (`icon-search` 18×18, `icon-cart` 20×18,
  `icon-account` 16×18) are **fills that encode thin line-work**, drawn in
  `#090708`/`#0E131F`. They are the header's search / minicart / login icons.
- [observed] The encoded line weights are **not uniform across the sprite**:
  the search ring is ~1.9 viewBox units, the cart ~1.3, the account ~1.4, so
  equal render sizes read as unequal stroke widths. The site masks this by
  rendering each glyph near its native size. `BrooksIcon` keeps the paths
  verbatim and offers a `thicken` prop (a same-color stroke over the fill) so
  call sites can normalize weight; a fill cannot be thinned.
- [observed] Ratings use a three-state **border-star** (`--full`, `--half`,
  `--empty`, 15×15), displayed at ~11px in PLP/PDP teasers. `Stars` in the apps
  now renders these.
- [observed] Carets are wide, thick chevrons (38×22 and 22×38), distinct from the
  thin 32×32 `icon-close-thin`. Several close variants coexist (`icon-close`,
  `-thin`, `-updated`, `-banner`, `-white`).
- [observed] The squiggle exists as real geometry: `icon-squiggle-1` (133×15,
  footer newsletter), `cta-hover-squiggle` (112×7, link hover), and a stroked
  `icon-long-squiggle` themed per accent via a CSS variable.
- [observed] The PDP **cushion meter** is three sprite symbols
  (`icon-cushion-level-{standard,more,most}-s`, 140×16) in a blue (`#5E88BA`)
  that appears nowhere in the color tokens above.
- [observed] `#icon-logo` (120×20) is the licensed BROOKS wordmark, letters drawn
  as six paths in the order R, O, K, S, O, B. `BrooksWordmark` now uses it
  verbatim, replacing the earlier hand-traced approximation.
- [observed] There is **no home and no storefront glyph** — a website needs
  neither — so the app's home and shop tab icons were hand-drawn to match the
  real set's line weight. [superseded 2026-08-17] The tab bar is now the
  system-rendered native tab bar (`NativeTabs`), which accepts only SF Symbols /
  Material Symbols or raster images — so no tab renders a sprite glyph or a
  hand-drawn stand-in anymore. `BrooksIcon` remains the icon set for all
  in-body chrome (headers, rows, carets). The lime-with-blue-text cart badge
  also lived on that JS tab bar; the system badge's text is fixed white on
  iOS, so the badge now wears `blue` instead.

## Voice

[observed — verbatim site copy] Optimistic, lightly wry, second person. Use these
rather than inventing copy:

- Empty cart: *"There's nothing in your cart. Let's remedy that, shall we?"*
- Returns: *"Take it for a 90-day trial run. If you're not happy, we're not happy."* (Run Happy Promise)
- Shoe Finder: *"Your perfect shoe is out there"* / *"Let's go"* / *"Take 'em off. Your shoes, that is."*
- Brand platform: **"Let's Run There"** (heritage mantra: **"Run Happy"**)

## The home feature

### Superseded: Project 222

[superseded 2026-08-17] Project 222 ran until the attempt date. The app's hero
now runs **The Ghost Amp** (below). Kept for the record because the countdown
pattern is reusable for the next date-pegged campaign.

[observed — brooksrunning.com, 2026-07-13]

- Eyebrow: *Josh Kerr Attempts Mile World Record*
- Title: **Project 222**
- Body: *"On July 18th, 2026, Brooks Beast Josh Kerr will attempt to break the mile
  world record on British soil in 222 seconds. This is Project 222."*
- CTA: *Shop Kerr's training gear*
- Hero asset: a muted ambient video loop; the portrait still is at
  `…/cms-content/Project/Brooks-Running/Homepage/2026/July/Josh-Kerr-Hero/…_750x1200_….jpg`

[inferred] **The attempt is five days after this was written.** A live countdown on
the home screen is the one place the app should out-do the website: a phone is a
device you check, and the campaign expires on its own, correctly. This is the
single strongest demo beat available and it costs almost nothing.

Other home sections [observed]: *Build your training rotation*, *Join Brooks Run
Club*, *Stories to transform your run*, Women's/Men's New Arrivals.

### Current: The Ghost Amp

[observed 2026-08-17 — two independent captures: the full-page grab on the Paper
file's `Website — brooksrunning.com` page, and a fresh human screenshot]

- Eyebrow: `JUST DROPPED`
- Title: **The Ghost Amp**
- Body: *"Amplify your run in the all-new Ghost Amp, featuring technology that
  injects energy into every stride."*
- CTA: `SHOP NOW`, as an **underlined text link — not a solid button**
- Hero asset: an ambient video loop, shot low and wide in a city

[observed] **The hero is top-anchored.** Copy sits in roughly the top 15–40% of
the band, left-aligned, with the lower half left to the footage. Every earlier
app hero was bottom-anchored, which is the more common native habit and the wrong
one here.

[observed] **The CTA count is not stable between captures.** The earlier grab
shows two links, `SHOP NOW` and `SHOP ALL ROAD RUNNING`; the later screenshot
shows only `SHOP NOW`. Treat one primary link as the design and a second as
optional — do not treat either count as fixed.

[inferred] There is **no badge and no chip** on this hero, and there never was
one on Project 222's either — the app invented that. One eyebrow is the whole
label layer. Four elements is the budget: eyebrow, headline, blurb, action.

### Expo implementation: Paper home port

[observed 2026-08-17] The Expo home screen now follows the Paper file's mobile
`Home` artboard as its implementation source: hero proportions and typography,
the two lifestyle rails, the centred New Arrivals rail, Run Club, stories, and
the Run Happy Promise band. The existing system-rendered `NativeTabs` remain the
app shell, so Paper's drawn tab-bar mockup is intentionally not ported.

[observed] The hero uses the Brooks site's portrait Brightcove source, video id
`6400666963112`, as a muted autoplaying loop. The MP4 is bundled at
[`assets/home/ghost-amp-mobile.mp4`](../assets/home/ghost-amp-mobile.mp4) rather
than relying at runtime on the site's signed `bcov_auth` URL, whose token is not
a stable application asset contract.

[observed] Paper's homepage imagery is embedded in the design as image fills,
not as separately named source files. The app therefore exports each relevant
fill or crop into [`assets/home/`](../assets/home/) and owns those deterministic
demo assets locally. Product facts continue to come from `packages/catalog`, in
line with LLP 0002; the home port does not introduce direct SFCC requests or a
second catalog source of truth.

## Home section language

[observed 2026-08-17] The homepage is a stack of six sections. Every one of them
uses the **same card grammar**: a *centred*, sentence-case heading standing alone
with no eyebrow, over a row of four bare photographs with ALL-CAPS captions.
There is no bordered card, no subtitle, and no product-on-white tile anywhere
above the fold. This is the single biggest divergence the app had to close.

| Section | Ground | Cards | Caption |
|---|---|---|---|
| *Summer's hottest new gear* | pale **sky gradient** | 4 × square lifestyle photos | centred caps |
| *Wherever the day takes you* | white | 4 × tall lifestyle photos | centred caps |
| *Brooks Run Club* | full-bleed photo | — | centred white text, `LEARN MORE` underlined |
| *Stories to transform your run* | white | 4 × 3:2 photos | blue caps category + muted date, then a headline |
| Run Happy Promise | `#003789` | — | round `RUN HAPPY PROMISE` seal + two lines, `90-day trial run.` underlined |

[observed] The new-gear band is **not a flat tint** — it is a photographic sky,
sampling `#A3C9E4` at the top through `#C0DAE8` to near-white `#E5EDF7`. The
promise band samples `rgb(17,55,134)`, which confirms `--color-blue` `#003789`.

[inferred] Because every section shares one grammar, the app's *own* additions
(the New Arrivals product rail, which the site does not have) must adopt the
centred heading too, or they read as a different product.

## PLP chrome

[observed 2026-08-17] Above the grid, in this order: breadcrumb
(`HOME / WOMEN` — first crumb bold ink, rest muted, caps, positive tracking);
title; a description paragraph; a **pale blue `#DFEDF0` Shoe Finder card**
centred on *"Find the perfect shoe for you. / Try Shoe Finder"* with
`Shoe Finder` underlined; a **four-card category rail**
(`WOMEN'S SHOES`, `WOMEN'S APPAREL`, `NEW ARRIVALS`, `BEST SELLERS` — captions
**left**-aligned here, unlike the homepage's centred ones); then
`145 products` / `SORT ⌄`.

[observed] The tile's resting state carries a plain top-left text badge
(`New Style`, `Best Seller`, `Limited Edition`) on the `#F8F8F8` pad, title,
price, and a category meta line (`Women's – Road Running, Walking`). Hover adds
`Widths – Medium, Wide, Extra Wide` and the star rating.

## Mega menu → the Shop tab

[observed 2026-08-17] The `WOMEN` mega menu is four text columns plus a promo
card. These are the exact labels the Shop tab should carry:

- **Shoes:** New Arrivals, Road, Walking, Treadmill & Gym, Support, Wide Shoes,
  Trail, Solutions, Track & Spikes, Lifestyle, Sale, Shop All
- **Apparel:** New Arrivals, Sports Bras, Shorts, Tops, Pants & Tights,
  Outerwear, Accessories, Socks, Sale, Shop All
- **Featured:** Best Sellers, Limited Edition, Trail Gear Shop, Hot Weather Gear,
  Marathon Gear, Brooks x runDisney®, Shoe Finder, Bra Finder, Used Gear,
  Size Guide
- **Best Sellers:** Ghost, Glycerin, Adrenaline GTS, Hyperion, Cascadia
- **Promo card:** lifestyle photo, *Find your perfect fit*,
  `TAKE OUR SHOE FINDER QUIZ` underlined

[inferred] A hover menu cannot exist on touch, so the Shop tab *is* this menu.
Rendered as `h3`-scale rows the four groups run past 1800px, so the ported rows
are 46px at 16px medium — the menu's own density, not a settings-list density.

## Product taxonomy

[observed] The attributes that must appear as filters and PDP specs:

- **Cushion:** Plush / Balanced / Responsive
- **Support:** Flexible / Balanced / Structured (GuideRails™) / Max
- **Neutral vs Support** is the top-level split Brooks teaches customers
- **Width:** Women's 2A/1B/1D/2E, Men's 1B/1D/2E/4E — Brooks's real differentiator
  against Nike and adidas, and it deserves equal visual rank with size
- **Surface:** Road, Trail, Walking, Treadmill & Gym, Track & Spikes, Lifestyle
- **Franchises:** Ghost, Glycerin, Adrenaline GTS, Hyperion, Launch, Levitate,
  Revel, Anthem, Cascadia, Caldera, Addiction, Beast/Ariel

## Shoe Finder

[observed — the site's embedded quiz config, "Shoe Finder S26 US" v18] The real
flow is 16 steps with branching: Use → (Trail type) → Training → Training use →
Experience → Mileage → Injuries → **"Take 'em off"** checkpoint → Balance → Knee
bend → Flexibility → Shoe feel → Features → Gender/size → Email (skippable) →
Results.

[inferred] Single-select steps should auto-advance; the barefoot-test checkpoint is
the most charming, most Brooks moment in the whole product and should be played as
a full-screen beat. Results should name *why* ("Balanced cushion — you wanted soft
and smooth"), which is what turns a quiz into advice.

[confirmed — live walkthrough of the site quiz, 2026-08-16] The step order above
was read from the embedded config in July; walking the live quiz end to end
reproduces it, including the branch, the multi-select injuries step, the
`Take 'em off` checkpoint, the two extra barefoot exercises (knee bend and
toe-touch), and the skippable email gate before results. Confirmed verbatim
strings: the intro headline "Your perfect shoe is out there" with its blurb and
`Let's go` CTA; "Take 'em off" / "Your shoes, that is."; and the cushion option
"soft and smooth". Two site behaviors the app deliberately drops are now
first-hand rather than assumed: the email gate, and the per-question
"What does this mean?" explainer modal — the app spends that explanation on the
results instead, where it changes a decision.

## Screen patterns

[inferred] Pattern ownership follows LLP 0001.

- **Home** (Nike): transparent header over the hero that cross-fades to a blurred
  white bar past ~70% of hero height; parallax hero; staggered entrance matching
  the site's own; horizontal rails for new arrivals and best sellers; editorial
  cards that land on merchandise.
- **PLP** (Zappos utility, adidas rhythm): collapsing large title; sticky control
  row with `Filter (n)` and franchise quick-chips; 2-up grid; filter as a
  full-height bottom sheet with a live "Apply · 23 results" count.
- **Tile** (Zappos/GOAT): colorway swatches **on the tile**, swapping its image in
  place. The highest-value borrow in the survey — Brooks products carry up to 11
  colorways, and making someone navigate to see them is the core failure to avoid.
- **PDP** (GOAT presentation, Zappos fit confidence): edge-to-edge gallery; color
  swatches as real shoe thumbnails (Brooks colorways are multi-color, so dots
  lie); size grid with out-of-stock struck through (`selectable: false` from LLP
  0002); width at equal rank with size; sticky "Add to Cart · $150.00".
- **Cart** (GOAT immediacy): bottom sheet, swipe-to-delete with undo, free-shipping
  progress bar, and Brooks's own empty-state copy.
- **Login** (adidas membership): framed as *joining Brooks Run Club*, never as a
  gate. Guest path always visible.
- **Tab bar & search** (Nike, 2026-08-17): the system native tab bar (liquid
  glass on iOS 26) with a `role="search"` tab that iOS detaches into the
  standalone trailing button — Home · Shop · Bag · Account + search, Nike's
  exact layout. Tapping it morphs the bar into the system search field, which
  drives the live Constructor.io type-ahead (LLP 0002) in place of the old
  modal search screen. [observed] Four regular tabs is the ceiling: a fifth
  plus the search trigger overflows UITabBarController into a "More" tab that
  swallows the search role. Shoe Finder paid for the search slot — it is a
  pushed full-screen route now, entered from a Shop card and the Account row.

## Wow list

[inferred] Ranked by leverage per hour:

1. **Project 222 live countdown** on the hero — news-pegged, expires correctly.
2. **Add-to-cart flying shoe** arcing into the tab-bar bag, lime badge popping.
3. **Colorway swatches on the tile** that swap the image in place.
4. **Shoe Finder auto-advance quiz** with the "Take 'em off" checkpoint.
5. **Haptics tuned per gesture** — selection ticks on chips, success on add, error
   on missing size. Half an hour of work, disproportionate perceived quality.
6. **Collapsing blurred headers.** Instantly reads as native rather than web.
7. **Skeleton shimmer everywhere.** Never show a blank screen.
8. **Hard-offset button press.** Brooks's own signature interaction.
9. **Cushion/support meter** on the PDP — turns Brooks's technical fit story into
   a graphic.
10. **The squiggle, animated** (stroke draw-on) under section titles.

## Sources

The live site blocks non-browser fetches (LLP 0002), so brand CSS, the Shoe Finder
quiz config, and PLP/PDP/cart structure were read from Internet Archive captures
(June 2026); the Project 222 hero copy and imagery were read from the live
homepage HTML captured through a browser session on 2026-07-13.

- Brooks homepage, production `style.css`, Shoe Finder quiz config
- Project 222 background: FloTrack, CITIUS Mag, LetsRun
- Brooks brand platform: "Let's Run There" press release

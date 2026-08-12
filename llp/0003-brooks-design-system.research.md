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

[inferred] Filson Pro cannot ship in an app bundle. **Figtree**
(`@expo-google-fonts/figtree`) is the closest geometric-humanist substitute and,
critically, has a true 900 Black to carry Brooks's display weight. `Caveat` stands
in for the site's handwritten Biro Script accent — at most one use per screen.

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

## Voice

[observed — verbatim site copy] Optimistic, lightly wry, second person. Use these
rather than inventing copy:

- Empty cart: *"There's nothing in your cart. Let's remedy that, shall we?"*
- Returns: *"Take it for a 90-day trial run. If you're not happy, we're not happy."* (Run Happy Promise)
- Shoe Finder: *"Your perfect shoe is out there"* / *"Let's go"* / *"Take 'em off. Your shoes, that is."*
- Brand platform: **"Let's Run There"** (heritage mantra: **"Run Happy"**)

## The current home feature: Project 222

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

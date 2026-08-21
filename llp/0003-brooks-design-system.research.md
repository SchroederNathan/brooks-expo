# LLP 0003: Brooks Design System and Screen Patterns

**Type:** Research
**Status:** Active
**Systems:** Brooks, Expo App, Exact App, Design
**Author:** Claude Fable 5
**Date:** 2026-07-13
**Revised:** 2026-08-21
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
| Choice control | 13 | 400 | 0 |
| Eyebrow / button | 12–14 | 700 UPPERCASE | +1.2 |

### Shape and motion

[observed] **Brooks zeroes `border-radius` sitewide.** Square corners are a brand
trait; only dots and badges are circles. Buttons are 50pt tall, square, uppercase,
and on press they shift up-left against a **hard offset shadow (`6px 6px 0`)** — a
"pressed sticker," not a soft Material elevation. Reproducing that instead of a
blur is most of what makes the buttons feel like Brooks's buttons. The PDP
purchase action is the storefront-derived exception documented below.

[observed] The site's hero entrance is fade + 40px rise, staggered ~80ms per
element (`.o-hero-home--pre-animation-state`). Sitewide transitions run 0.3–0.6s.

[observed] The brand's most ownable graphic gesture is a hand-drawn **squiggle**
underline used on hover CTAs and annotations.

### PDP purchase controls

[observed — Brooks mobile PDP reference `IMG_4196.png`, 2026-08-21] Size and
width choices use a distinct commerce-control treatment rather than the filled
filter-chip state. Choices are 48pt-tall white rectangles with a 1pt neutral
rule; selection strengthens that to a 2pt ink outline without changing the
fill. Unavailable variants keep their footprint and use a pale diagonal from
bottom-left to top-right across both text and surface. Size fills a five-column
grid; width fills a four-column grid and may wrap a long label to two lines.
Both grids use tight 4pt gutters, matching the mobile storefront's dense fit
controls rather than the app's roomier filter-chip spacing.

[observed — same reference] The purchase CTA is a deliberate exception to the
hard-shadow primary button: a flat Brooks-blue rectangle with sentence-case
action copy aligned left and the price aligned right. The shared `Chip`
`productOption` appearance and `Button` `purchase` variant own these treatments;
the PDP owns only the five/four-column composition.

[observed — live Ghost 18 PDP, 2026-08-21] Until size and width form a ready
variant, the purchase action keeps the same split `Add to cart` / price layout
but changes its fill to the site's secondary gray `#707070`; both labels remain
white. The app mirrors this readiness state instead of changing the button copy
to an instruction, so the action does not jump as fit choices are made.

### PDP detail sections

[observed — live Ghost 18 PDP and mobile references `IMG_4197.png` through
`IMG_4199.png`, 2026-08-21] The post-purchase hierarchy begins with a full-width
`#F8F8F8` returns band: the circular Run Happy Promise seal, an uppercase
`90-day free returns` label with the sprite's `icon-info`, and one sentence of
90-day trial copy. The seal is the same Brooks CDN asset already bundled for the
home screen, not an app recreation.

[observed — same sources] Product details are an expanded ruled accordion. The
description spans the content width, then facts form a stable two-column
description list: bold labels at left and regular values at right. `Best for`,
`Cushion`, `Support`, and `Features` are present in the normalized catalog and
render in that structure. Midsole drop, weight, and sustainability appear on
the storefront but are not part of the current normalized snapshot, so the app
omits them rather than embedding Ghost-specific literals or implying that the
fields exist for every product.

[observed — warmed browser capture, 2026-08-21] Cushion and support do not come
from the 81-symbol header sprite. The live PDP serves two standalone 100×100 SVG
assets, `PDP-Icon-BalancedCushion.svg` and
`PDP-Icon-BalancedSupport.svg`. Their path data is preserved verbatim in
`BalancedCushionIcon` and `BalancedSupportIcon`; `InfoIcon`, carets, and rating
stars continue to use the already-captured sprite geometry. The reviews summary
reuses those shared star and caret primitives rather than text stars or generic
system chevrons.

### PDP reviews

[observed — Brooks mobile PDP reference and warmed browser responses,
2026-08-21] The expanded review accordion follows a fixed information order:
large centered decimal score, five stars, dark `Write a review` action, then
fit rails. Each rail has a centered bold label, a thin neutral track with a
short ink segment positioned from TurnTo's zero-based average, and only the two
endpoint labels below it. The page then shows `3 most recent reviews` opposite
an underlined `See all reviews` link.

[observed — same sources] A recent-review row begins with stars and date at left
and the author at right, followed by a bold sentence-case title and unmodified
review body. Reviews are stacked without card chrome; whitespace provides the
separation. The section ends with a centered outlined `See all reviews` action
and the accordion's bottom rule.

[confirmed — user direction, 2026-08-21] The app keeps that storefront hierarchy,
but `Write a review` is intentionally inert in the prototype. Both all-review
actions remain external links to the real Brooks PDP. This is an honest boundary:
the three public reviews can be bundled, while the full TurnTo experience is
live, mutable, and unavailable to a direct React Native request because of
Akamai (LLP 0002).

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
  neither — so the app's home and browse tab icons are hand-drawn to match the
  real set's line weight. [superseded 2026-08-17] The tab bar became the
  system-rendered native tab bar (`NativeTabs`), which accepts only SF Symbols /
  Material Symbols or raster images — so no tab rendered a sprite glyph or a
  hand-drawn stand-in, and the lime-with-blue-text cart badge went `blue`
  because the system badge's text is fixed white on iOS.

### The tab bar is app-drawn again

[observed 2026-08-21] `NativeTabs` is gone; the bar is drawn in JS
(`components/tab-bar.tsx` + `components/tab-icon.tsx`) over React Navigation's
JS tabs (`expo-router/js-tabs`). Three things drove the reversal, in order of
weight:

- **The sprite could not reach the tab bar.** The system bar renders its own
  items, so the one piece of chrome every session touches was the one piece
  wearing Apple's icons instead of Brooks's. Cart and Profile are now
  `#icon-cart` and `#icon-account` verbatim; Shoe Finder wears `#icon-search`
  (see the focus-rule constraint below). Home and Browse stay hand-drawn.
- **Four tabs was a hard ceiling.** A fifth regular tab plus the detached
  `role="search"` trigger tipped `UITabBarController` into a "More" tab, which
  swallowed the search role. That is why Shoe Finder had no slot. The app-drawn
  bar has no such rule, so Home / Browse / Shoe Finder / Cart / Profile all fit
  and **Search gives up its tab instead** — it was always reachable from the
  Browse header's search field and the category header, both of which push
  `/search` onto the current tab's stack, where the native `Stack.SearchBar`
  still comes up with it.
- **The badge.** Lime fill with blue text is the site's own minicart treatment
  and is back.

[observed] The focus indicator is an ink dash **on the bar's top edge** rather
than the system's tint-only selected state, and it slides between tabs on the
same motion as the PDP / catalog-tile color rail: `INDICATOR_MS` and
`INDICATOR_EASING` are imported from `components/underline-rail.tsx`, not
restated, so the two cannot drift. It rides a native CSS transition, so
selection never touches the JS thread. The dash is 44pt wide, not the full slot
width (~80pt on a 402pt frame) — it marks the tab, not the hit area.

[observed 2026-08-21] The top edge *is* the dash's track, which fixes two
things that a rule floating 6pt above a hairline border did not get right. The
dash and the edge are drawn at one thickness (2pt), so the moving ink reads as
the same stroke as the line it travels along instead of a second, thicker mark
hovering over it; and the dash sits at the edge's own y, so nothing about the
bar's chrome moves when selection does. The edge therefore stops being a
`borderTopWidth` hairline and becomes an explicit 2pt track `View` that the dash
is positioned inside — a hairline dash would be a ghost, so the thickness has to
come from the dash, not the border. Doubling the thickness would have doubled
the visual weight too, so the track drops from `hairline` (#E5E5E5, the site's
border gray) to the paler `surfaceSunken` (#F2F2F2) and lands back near the
intended lightness.

[observed] Layout needs no per-screen work, which is not the obvious answer.
`BottomTabView` renders each screen with `StyleSheet.absoluteFill`, which reads
like "content goes under the bar" — but that fill is relative to a sibling
container styled `screens: { flex: 1 }`, with the tab bar next to it in the same
column. A non-absolute bar therefore *shortens* the screen instead of covering
it. The bar also owns the bottom safe-area inset. So every scroll container and
the cart's sticky checkout bar keep the padding they had, and anything that added
the bar's height on top of `insets.bottom` double-counted it by ~85pt. The bar
still measures itself and publishes the height through
`BottomTabBarHeightCallbackContext`, purely so `useBottomTabBarHeight()` reports
the truth rather than React Navigation's UIKit estimate for a bar that is not
React Navigation's.

[observed] Two behaviors the JS bar has to supply itself, because React
Navigation's own tab button supplies them and a custom `tabBar` replaces it:
switching tabs is `CommonActions.navigate(route)` dispatched at `state.key`, and
a second tap on the focused tab pops that tab's stack back to its anchor. The
pop must be addressed to the nested stack's own key — actions bubble *up* from
the navigator they are dispatched on, so an untargeted `popToTop()` escapes the
tab navigator into the root stack and silently does nothing.

[observed] The focus rule constrains which glyphs are usable. `#icon-filters`,
the site's three-bar funnel, was the first choice for Shoe Finder on semantics
("narrow this down"), but its top bar is a 21px horizontal rule that merged with
the focus rule above it into a four-bar stack — the indicator stops indicating.
Any glyph whose top edge is a long horizontal is disqualified by a bar with a top
rule. [inferred] Measured at the original 8pt rule-to-glyph gap; the dash now
rides the bar's edge, 14pt above the glyph, which weakens the collision without
removing it, and the ruling was not re-tested at the new spacing. Shoe Finder
wears `#icon-search` instead; its ring cannot be confused with the rule, and
Search itself is a pushed screen, so the tab bar is the only place that glyph is
a destination.

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

[observed 2026-08-21] The hero runs inside a reusable Reanimated
`StretchyParallaxScrollView`. During positive scroll, the leading visual
continuously compensates for half of the content offset without an end clamp,
so it travels at half speed. The reusable primitive owns a separate foreground
layer that scrolls at normal content speed, keeping the hero copy and actions at
a constant inset from the following section while that section paints over the
media. Both animated layers have an explicit clipping container whose lower edge
tracks the following section, preventing Android's transformed media surface or
scaled text from painting across that boundary. During negative top-edge
overscroll, a fixed layout frame keeps the next section attached while the
absolutely positioned clipping layers cancel the scroll bounce, grow by the pull
distance, and stay pinned to the screen's top edge.
The positive parallax is disabled when the system requests reduced motion; the
direct pull-to-stretch response remains.

[observed 2026-08-18] Every native tab now owns a native `Stack` through an
Expo Router array group. A shared `Stack.Toolbar.View` places the Brooks SVG
wordmark at the leading edge. `NativeTabs` remains entirely system-rendered
with no app-owned blur layer beneath it. The search-role tab needs
`headerShown: true` explicitly or UIKit suppresses its custom toolbar while
morphing the tab bar into the search field.

[observed 2026-08-20] `Superseded`: the header briefly used a masked
`ProgressiveBlur` component (a `BlurView` under an eased alpha gradient,
adapted from the sibling speech-companion app). It is removed. The header is
now fully transparent with `headerBlurEffect: 'none'` and no
`headerBackground`, so the hero reads unbroken under the toolbar. The
`expo-blur` and `@react-native-masked-view/masked-view` dependencies went with
it.

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

[observed 2026-08-21] The tab is labelled **Browse** in the tab bar; the route
segment and screen are still `shop`.

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

[observed — 2026-08-21] Press-scale, enter/exit, layout transitions, the button
press-shift, PDP size-grid shake, and the filter-sheet fade stay stripped
pending the motion overhaul. Stack pushes use the platform default again. On
iOS 18+, a product tile photo uses Expo Router's `Link.AppleZoom` into the PDP
gallery (`Link.AppleZoomTarget`); older iOS and Android keep the default push.
Home's stretchy parallax hero stays. Colorway selection is a second exception:
the focused thumbnail uses a sliding ink underline (`UnderlineRail`) rather than
a boxed blue/ink border, on both the catalog tile and the PDP color rail. Brand
observations below still describe the site and the intended native patterns;
they are not currently implemented as press or enter motion. [observed —
2026-08-21] The PDP gallery pagination is another state-feedback exception:
`AnimatedPaginationDots` derives fractional page progress from the horizontal
scroll offset on the UI thread, shrinking the outgoing bar while expanding the
incoming one. Reduced-motion users get the same state indication without the
continuous morph.

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
  Selected color is an ink underline that slides under the focused thumbnail
  (`UnderlineRail`), not a boxed blue border.
- **PDP** (GOAT presentation, Zappos fit confidence): edge-to-edge gallery; color
  swatches as real shoe thumbnails (Brooks colorways are multi-color, so dots
  lie), sharing the same sliding underline as the tile. [observed — 2026-08-21]
  Every gallery page is a screen-width square and uses cover fitting, so portrait
  and landscape source photography both occupy the same 1:1 viewport without
  client-side letterboxing.
  The color rail keeps its
  first thumbnail aligned to the page gutter but its scroll viewport bleeds to
  both screen edges, so additional colorways are not clipped by the content
  container; a five-column size grid followed by a four-column width grid;
  unavailable choices crossed diagonally (`selectable: false` from LLP 0002);
  selected choices outlined rather than filled; sticky flat-blue
  "Add to cart" action with the price split to the trailing edge.
- **Cart** (GOAT immediacy): bottom sheet, swipe-to-delete with undo, free-shipping
  progress bar, and Brooks's own empty-state copy.
- **Login** (adidas membership): framed as *joining Brooks Run Club*, never as a
  gate. Guest path always visible.
- **Tab bar & search** (Nike). [superseded 2026-08-17→2026-08-21] The bar was the
  system native tab bar (liquid glass on iOS 26) with a `role="search"` tab that
  iOS detached into the standalone trailing button — Home · Shop · Bag · Account
  + search, Nike's exact layout — because four regular tabs is UITabBarController's
  ceiling before it overflows into a "More" tab that swallows the search role.
  Shoe Finder paid for the search slot. [observed 2026-08-21] The bar is
  app-drawn now (see *The tab bar is app-drawn again*): five tabs, Home · Browse ·
  Shoe Finder · Cart · Profile, in Brooks's own sprite glyphs, with a sliding ink
  dash riding the bar's top edge under the focused icon. Search traded its slot
  back for Shoe Finder's; it is a pushed screen entered from the Browse header
  field and the category header, and it still drives the live Constructor.io
  type-ahead (LLP 0002) through the native `Stack.SearchBar`.

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

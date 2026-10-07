# Complete the look and Shop the look on the PDP

**Date:** 2026-10-06
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** `src/screens/product/complete-the-look.ts` (replaces `also-like.ts`),
`complete-the-look-section.tsx`, `shop-the-look-sheet.tsx`, `index.tsx`,
`added-sheet.tsx`, `src/app/shop-the-look.tsx`, `src/app/_layout.tsx`,
LLP 0003. The first pass also had `look-variant.ts` and a Profile row; both
were removed in the second pass.

## Outcome

The add-to-bag sheet's `You might also like…` rail moved to the PDP as a
`Complete the look` section after the accordions. The sheet now ends at its
two buttons. The picker changed from "the six most-reviewed items of the other
product type" to one piece per slot (shoes, top, bottom, socks, layer), with
the product's own franchise first. The old ranking gave four sock packs in a
row under a men's Ghost 17. The new one gives Luxe Short Sleeve, Source 9"
Short Tight, Ghost Lite No Show and Canopy Jacket.

Four designs, each from a Mobbin storefront reference (adidas and lululemon
rails, lululemon bento, Nike/UNIQLO list, Nike outfit card), sit behind a
Profile row that steps through them. Flat lay is the default. The copy says
"Our most-reviewed gear to run in with it", never "for you": the catalog has
no co-purchase data.

Evidence: `bun run typecheck` clean. On a dedicated iPhone 17 Pro simulator
(iOS 26.5, the existing dev client, Metro on port 8098): all four designs on
the men's Ghost 17 PDP, the Profile row stepping Rail → Bento → Kit list →
Flat lay, a flat-lay tap opening the Source 9" Short Tight on the laydown
colorway (Black), that apparel PDP's look leading with a shoe, and the
add-to-bag sheet without the rail. Android and web were not run.

## What worked well

- Mobbin's screen search for "complete the look" returned the exact PDP
  sections of lululemon, Nike, adidas, Under Armour and Gymshark in one call,
  which set the four designs.
- Running the picker under `bun` against `assets/catalog.json` before any UI
  showed the sock problem and the walking-shoe problem in seconds.

## Friction and blockers

- `curl` on the Brooks image CDN returns Akamai "Access Denied", so the
  photography could only be judged in the simulator (LLP 0002).
- The dev menu opens over the PDP on the first launch and swallowed the first
  scroll gestures.
- After the render error below was dismissed, the PDP that was on screen had
  no native back button, and Argent's edge swipe returned a tool error
  ("Cannot read properties of undefined (reading 'find')"). Every PDP opened
  later had its back button. An app restart cleared it, and the stored design
  choice held across the restart.

## What was hard

- Photography. Apparel hero shots are on-model with their own grey backdrop.
  On the flat lay they read as overlapping boxes. The laydown (`lf`) shots
  blend into `surfaceAlt`, but they often exist only on a later colorway, so
  the flat lay had to pick a colorway per piece and open the PDP on it.
- `Link asChild` throws a render error when its child gets a style array
  ("You are passing an array of styles to a child of <Slot>"). Typecheck does
  not catch it; only the flat lay passed an array, so only it crashed.

## Comparative friction

Not observed.

## Improvement ideas

- Expo Router could flatten a style array on an `asChild` child (or warn
  instead of throwing). The error appears only at runtime.
- Expo Router docs could say what `router.navigate` to a tab does from inside
  a `formSheet`: it mounted the tab navigator inside the sheet, with no
  warning. `dismissTo` was the fix.

## Second pass, same day: flat lay chosen, Shop the look added

The user picked the flat lay and asked what the shopper can do with it. The
other three designs, the Profile row and `look-variant.ts` are deleted. The
look is now three pieces. A `Shop the look` button under the card opens a
native form sheet (`src/app/shop-the-look.tsx`,
`src/screens/product/shop-the-look-sheet.tsx`). The sheet has one checked row
per piece, size chips per row, and one `Add N to bag · $total` button. It
then confirms in place with `Keep shopping` / `Bag (n)`.

Evidence (same simulator, iOS 26.5): `bun run typecheck` clean. Opened the
sheet from the men's Ghost 17. Top and bottom started at M from a Canopy
Jacket in the bag (seeded through `debugger-evaluate` on `localStorage`). I
picked shoe 10 and socks M, added 4, and the Bag held all four plus the jacket.
Unchecking the socks gave `Add 3 to bag · $213.95`. With the pieces already in
the bag, those rows started unchecked with `Already in your bag`. Both
`Keep shopping` and `Bag (n)` were checked. Android was not run; the sheet
draws its own title and close there, as Filter & sort does, but this is
unverified.

Found while testing, and fixed:

- `router.navigate('/cart')` from inside the form sheet mounted the whole tab
  navigator inside the sheet. `router.dismissTo('/cart')` closes the sheet and
  the PDP and shows the Bag tab.
- The first run added a second pair of shorts that were already in the bag.
  Pieces already in the bag now start unchecked.
- `scrollTo` in `onContentSizeChange` did not move the shoe's size row: it ran
  before layout, and the run-once guard blocked a retry. `contentOffset` works,
  and it now applies only when the picked chip would start off screen. The
  first version also shifted the apparel rows and cut off XS.
- The faded unchecked row also faded the green `Already in your bag` note to
  low contrast. The note now sits outside the faded part.

## Third pass: live button, no outer rules

User direction: do not disable the button when a size is missing, and no
rules at the top and bottom of the list. The button is now disabled only when
nothing is checked. Pressed with a size missing, it marks each such row with a
red `Pick a size` and scrolls to the first. The user then asked for no
rules at all, between rows included; whitespace now separates the rows.
Then: the footer takes the PDP sticky bar's fade (`expo-linear-gradient`,
transparent to white at 50%), floats over the list, and the list pads by the
footer's measured height. Checked on the simulator: the socks row fades under
the button, the end of the list clears it, and the confirmation footer has
the same fade.

- The scroll first landed with the shoe row under the sheet's native bar.
  The list used `contentInsetAdjustmentBehavior="automatic"`, so its top sat at
  offset −70, and `scrollTo` clamps negative offsets to 0. The scroll event's
  `contentInset.top` also read 0. Fix: `"never"` plus `paddingTop` from
  `useHeaderHeight()` (70pt in this sheet; read through a temporary
  `console.log` and Argent's log registry).
- Checked on the simulator: the button stays blue with two sizes missing; the
  press marks the shoe and socks and scrolls the shoe into view below the bar;
  picking a size clears that row's mark.

## Follow-ups

- Once the whole look is in the bag, the PDP button still says
  `Shop the look · 4 pieces`, and the sheet opens with every row unchecked. A
  "Your look is in the bag" state would read better.
- The bag shows `Size M · 1D` for apparel. The `1D` is the width fallback the
  PDP also writes for apparel (no widths); this predates this work.
- The flat-lay positions are tuned for a shoe page. On an apparel page the
  product sits in the shoe's spot. It reads well for shorts, but it was not
  checked for a jacket or a bra.

# Pushed screens trade app-drawn square buttons for the native stack header

**Date:** 2026-08-26
**Agent:** Claude Opus 5 (Claude Code)
**System:** Expo
**Scope:** `src/theme/header.ts` (new), `src/app/_layout.tsx`,
`src/screens/product/index.tsx`, `src/screens/category/index.tsx`; LLP 0003
gains *Pushed screens wear the native header*

## Outcome

The PDP and the PLP drew their own top chrome out of square boxes. The PDP
floated a 40pt bordered square holding a caret over its gallery and a second one
holding the text `Bag · 1`; the PLP drew a 48pt row with the same caret box, a
scroll-triggered title, and a search box. Both are gone. Both screens now wear
the native `UINavigationBar` through Expo Router's `Stack`:

- PDP: transparent header over the full-bleed gallery, native back chevron
  leading, `Stack.Toolbar.Button icon="square.and.arrow.up"` trailing. The cart
  slot was not ported — it duplicated the tab bar's badge two inches below it.
- PLP: opaque white header, native back chevron, `magnifyingglass` trailing. The
  64pt title collapse survives as `headerTitle: showBarTitle ? title : ''`, now
  driving the system bar instead of an app-drawn one. The filter/sort row stays,
  because a navigation bar has no slot for it.

Brand reaches the bar as tokens, not a wrapper: `theme/header.ts` exports two
`Stack` option presets (`overlay`, `plain`) and `headerIcon`, the SF Symbol names
keyed by app meaning. The `expo-design-system` skill is explicit that a platform
component already carrying the design language must not be wrapped — so there is
no `<BrooksNavBar>`, only values handed to `Stack`.

The blue collapsing `useBrooksHeader` was left alone. It is a verbatim port of
brooksrunning.com's own sticky header and belongs to the five tab anchors; the
native bar is for what those anchors push. [observed]

Verified on the booted iPhone 17 Pro (iOS 27) dev-client over Fast Refresh: the
PDP shows a glass chevron and a glass share button over the gallery, the share
sheet opens on `brooksrunning.com`, and the PLP's `Men's Shoes` title fades into
the bar past the scroll threshold. [observed]

## What worked well

- `Stack.Toolbar placement="right"` renders `null` and publishes through
  `useCompositionOption`, so it can be dropped anywhere in a screen's subtree —
  including inside the screen's root `View`, three components below the route
  file. No prop threading, no layout-file edit per screen. [observed]
- `expo-symbols` was already resolved and pod-installed as an `expo-router`
  dependency (`ExpoSymbols 57.0.2` in `ios/Podfile.lock`), so SF Symbol bar
  buttons needed no new dependency and no native rebuild. [observed]
- On iOS 26+ a bar button gets the glass capsule for free. The app-drawn square
  it replaced could not have had one without reimplementing the material.
  [observed]
- `<Stack.Screen options={{ headerTitle: ... }} />` from inside the screen let
  the existing `showBarTitle` state drive native chrome directly. Keeping the
  screen's own collapse threshold was cheaper and lower-risk than switching to
  `headerLargeTitle`, which needs the scroll view to be the first child —
  and the PLP's first child is its filter row. [observed]

## Friction and blockers

- `Share.share({ url, message })` with the same link in both fields makes the
  iOS sheet announce **"2 Links"**: UIKit adds each field to the activity item
  array separately. Caught on the first tap, from the screenshot. Fixed with
  `Platform.OS === 'ios' ? { url } : { message: url }` — Android has no `url`
  field at all, so neither platform can be given both. [observed]
- Deep-linking to a PDP with `ecomdemo://product/110442` raised the simulator's
  *Open in "Ecommerce Demo"?* confirmation and left the app backgrounded behind
  Safari. Tapping through the app's own navigation was faster than fighting it.
  [observed]

## What was hard

Deciding what *not* to convert. "Get rid of the square buttons" reads as a blanket
instruction, but the app has three kinds of top chrome, and only two were
re-implementations. The blue Brooks header is a port of a real artifact with a
two-regime collapse no system bar performs; converting it would have deleted the
app's most deliberate piece of brand. The test that separated them: **does the
app-drawn bar do something the platform's cannot?** A square box holding a caret
fails it; `useBrooksHeader` passes. That rule is now written into LLP 0003 so the
next pass does not have to re-derive it. [inferred]

## Comparative friction

Not observed — this pass touched only the Expo app.

## Improvement ideas

- `Stack.Toolbar`'s reference page documents `icon` as `SFSymbol |
  ImageSourcePropType` but does not say what an SF Symbol string does on
  Android, where `RouterToolbarItemProps` carries a separate `source` prop for
  raster icons. A one-line note on the cross-platform icon story would have
  saved a read through `build/toolbar/native.android.js`.
- The `expo-design-system` skill's "do not wrap platform components" rule is
  correct and load-bearing, but it stops one step short: it does not say where
  the *options* for those components should live. A sentence pointing at a token
  file of `screenOptions` presets would have closed the gap without inference.

## Follow-ups

- Android is unverified: the project has no `android/` directory, and the
  toolbar's Android path resolves icons through `source`, not `systemImageName`.
  If Android ships, `headerIcon` needs a raster fallback map beside the SF
  Symbol names.
- The PDP's missing-product state still renders a content `Button title="Back"`
  under a header that now has its own chevron. Harmless, but redundant.

# Home-only header and a shared screen primitive

**Date:** 2026-08-26
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** Remove the app-drawn Brooks header from every screen but Home; give
the screens that lose it a shared safe-area primitive.

## Outcome

The blue collapsing header (`components/brooks-header`) now has exactly one
caller: Home. Browse, Cart, and Profile drew a copy of it — Browse and Cart with
the wordmark alone — and each already opened on an in-content `h1` naming the
screen, so the bar was running a two-regime collapse animation to reveal a logo
the reader had seen on the previous tab.

Removing it exposed a dependency that was not obvious from the call sites:
`useBrooksHeader` was the *only* thing telling those screens where the safe area
ended. It returned a `headerHeight` that already contained the status-bar inset,
so each screen padded by that one number and set
`contentInsetAdjustmentBehavior: 'never'`. Deleting the header deletes that
number, and the naive fix is `insets.top + spacing.xl` in three new places —
which Shoe Finder and Login had already written independently, so this was
measured drift, not a hypothetical.

New `src/components/screen.tsx` holds it once: `Screen` (non-scrolling root),
`ScreenScrollView` (scrolling root, padding on the content container so the fill
still runs under the clock), `ScreenHeading` (the in-content `h1` on the shared
gutter and rhythm), and `useScreenTopPadding` for a root that can be neither.
Shoe Finder adopted it too. Login did not: it is a modal, whose iOS card already
starts below the status bar, and it keeps its `Platform.OS` branch.

Verified on the iPhone 17 Pro simulator (iOS 27.0, Metro on 8082): all four
non-Home tabs clear the Dynamic Island, the three headings land at an identical
y, content scrolls under the status bar with no double inset, and Home's header
still collapses on scroll. LLP 0003 gains an *Only Home wears the header*
subsection under *The header collapses on scroll*.

## What worked well

- `useBrooksHeader`'s "one hook returns the element *and* the scroll props"
  shape made the removal mechanical and safe. Because a screen could not
  half-wire the header, it also could not half-unwire it: deleting the
  destructure produced immediate type errors at every remaining use.
- The expo-design-system extraction rule ("two or more screens, a nameable role,
  an API smaller than its implementation") resolved the build-or-not question
  without deliberation — three screens needed the same top padding on the same
  day.
- `debugger-component-tree` beat `describe` for tap targets again, and it
  confirmed the refactor structurally: `ScreenHeading` appears by name in the
  tree, so the primitive was visibly in use rather than inferred to be.
- `bun run typecheck` after each screen caught the JSX-comment-before-root
  mistake below in one pass.

## Friction and blockers

- Rewriting three screens' roots with scripted string replacement left the JSX
  bodies at the old indentation. Mechanical to fix, but it meant a second pass
  per file and a real risk of dedenting the wrong span — Cart needed re-indenting
  *up* after an over-eager dedent, because its root `View` survived (it holds the
  sticky checkout bar and the undo bar as overlay siblings) while Shop's and
  Profile's did not.
- QA emptied the demo cart: verifying the empty-Bag state meant stepping the only
  line item to zero, and the 5-second undo window closed before the tap landed.
  Restoring it took a deep link (`brooks://product/120482?color=105`) plus size
  and width taps. A store-level "reset to fixture" affordance would have made the
  empty-state check free.

## What was hard

- Deciding what *not* to do. `actions.tsx` still resolves `account`, `cart`,
  `menu`, and `filters`, and after this change nothing renders any of them —
  Home asks for `search` alone. Deleting them would be a tidier diff and a worse
  module: they are a documented mapping of brooksrunning.com's own header set,
  and the header is still a live component with a variant API. They stay, with
  the docstring saying who the one caller is.
- The status-bar handoff was the one thing that could have broken silently.
  `BrooksHeader` mounts an `expo-status-bar` entry gated on `useIsFocused`,
  because RN resolves the bar from the last *mounted* entry rather than the
  visible one. With three screens no longer mounting an entry at all, the
  question was whether the root layout's `style="dark"` would win when Home
  loses focus. It does — Home withdraws its entry, the root's is the only one
  left, and dark-on-white is correct for the three white screens. Worth checking
  on device rather than reasoning about, and it held.

## Comparative friction

Not observed.

## Improvement ideas

- The `headerHeight`-as-safe-area coupling is a shape worth warning about
  generally: any hook that returns a layout number derived from
  `useSafeAreaInsets` becomes load-bearing for screens that never asked about
  insets, and removing the feature silently removes their safe-area handling
  too. The expo-design-system skill's audit section could name this — "a value
  that combines an inset with a token belongs in the theme or a primitive, not
  in a feature hook's return."
- `contentInsetAdjustmentBehavior` deserves a line in the design-system or
  native-UI skill. Every screen here needs `never` for the same reason (the app
  owns the top padding), and getting it wrong pads twice in a way that looks like
  a spacing-token mistake rather than a platform one.

## Follow-ups

None.

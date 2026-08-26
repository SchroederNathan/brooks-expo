# Strip haptics down to the tab bar

**Date:** 2026-08-26
**Agent:** Claude Opus 5 (1M context)
**System:** Expo
**Scope:** Remove every haptic in the app except the tab bar's selection tick

## Outcome

`utils/haptics` exports `select` and nothing else. `tap` and `notify` are gone,
along with `expo-haptics` imports in five screens.

What was removed: `Press`'s light impact on every press (and the `haptic={false}`
opt-out threaded through fourteen call sites to silence it), `Chip`'s selection
tick, `Button`'s medium impact, the PDP colorway tick and its add-to-cart
success / missing-size error notifications, the Shoe Finder's per-answer tick and
quiz-complete success, the cart's remove-warning / quantity tick / checkout
impact, and the login form's validation error and join success.

`components/tab-bar.tsx` keeps `select()`. `expo-haptics` stays in
`package.json` because of it.

## What worked well

`Press`'s `haptic` prop turned out to be the useful signal about the design, not
just an API detail. Fourteen call sites had already opted out — meaning the
default was wrong at more than half the places it applied, and the prop existed
to work around its own default. Deleting the default let the prop go with it.

A `python3` script of exact `str.replace` pairs with `sys.exit` on any miss was
the right shape for this. Each edit is asserted, so a silently-stale pattern
fails the run instead of leaving a half-applied change. `tsc --noEmit` then
caught the leftovers (unused imports, a now-dead `Dimensions` import).

## Friction and blockers

None mechanically. The prop had to be deleted rather than defaulted to `false`,
because `Press` spreads its rest props onto `Pressable` — leaving `haptic` in the
signature while ignoring it would have leaked an unknown prop to the host view at
every remaining call site.

## What was hard

Nothing technically. The judgement is the interesting part, and it is worth
recording because LLP 0003's wow list ranked "haptics tuned per gesture" fifth
out of ten, at "half an hour of work, disproportionate perceived quality."

That reading was wrong in two ways, and the app demonstrated both:

1. **It was not tuned per gesture.** `Press` fired on *every* tap, so the
   distinct ticks and notifications sat on top of a constant background buzz.
   Spending the signal everywhere spends it until it means nothing.
2. **A tap that opens a screen already has feedback** — the transition. This
   landed in the same change as the Apple zoom work
   (`2026-08-26-expo-apple-zoom-editorial-cards.md`), where a card's photo now
   visibly lifts and grows into the next screen. A buzz competes with that
   rather than reinforcing it.

The tab bar is the exception because it is the one navigation move with no
animation of its own to feel: the target tab's content is already mounted and
swaps without a transition.

## Comparative friction

Not observed.

## Improvement ideas

1. **A boolean opt-out prop on a shared pressable is a design smell worth
   surfacing.** By the time `haptic={false}` appears at more than a couple of
   call sites, the default is wrong. Nothing flags this; a lint rule that
   counted literal-`false` passes of a boolean prop across a codebase would have
   caught it long before a human noticed the app felt noisy.
2. **`expo-haptics` docs could say something about budget.** Every individual API
   call is correct and cheap, which makes it easy to add one per interaction and
   end up with an app that buzzes constantly. A short "how many is too many"
   note would carry more weight than the per-function reference does.

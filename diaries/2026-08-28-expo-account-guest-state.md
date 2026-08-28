# Account tab: logged-out redesign with verified Run Club copy

**Date:** 2026-08-28
**Agent:** Claude Fable 5
**System:** Expo
**Scope:** Replace the Account tab's guest navy card with an illustration +
copy + stacked `Log in` / `Create an account` layout, and make every account
benefit claim match what Brooks publishes.

## Outcome

`src/screens/account/index.tsx` gained a `GuestPitch` section: a glyph
illustration, one body line, two stacked `Button`s (primary + secondary), and
a free-membership note. A follow-up removed the `Account` heading, the
navigation rows and the footer for guests; the pitch is now centred alone
in a non-scrolling `Screen`. `src/screens/login/index.tsx` reads `?mode=` to
relabel its heading and button. `RUN_CLUB_PERKS` in `src/constants.ts` was
rewritten from Brooks's support article. LLP 0003 *Login* pattern updated.
Verified on the iPhone 17 Pro Max simulator via Fast Refresh on Metro 8082.

## What worked well

Fast Refresh applied the change before the first screenshot. The `Button`
primitive already had the primary/secondary pair the reference mock needed,
so the stack was two lines. `BrooksIcon` glyphs were enough for a
brand-consistent illustration without a new asset.

## Friction and blockers

- brooksrunning.com (Akamai) and support.brooksrunning.com (Cloudflare) both
  return 403 to WebFetch, curl with a browser UA, and r.jina.ai. The only
  readable source was web-search snippets of the support article. The LLP
  marks the copy as observed via snippets, not the page.
- The user's brief said there is no birthday gift; the official support
  snippet says members get "a gift with purchase during your birthday month".
  Kept the claim with Brooks's wording and flagged the conflict for the user.

## What was hard

Judging which existing perks to drop. "Early access" and "fun games and
prizes" had no source, so they went; "member-exclusive promotions and games"
is Brooks's own phrase and replaced them.

## Comparative friction

Not observed.

## Improvement ideas

A cached, dated snapshot of Brooks's account/support copy in
`packages/catalog` (like the product data) would let future copy checks run
offline instead of against bot-managed pages.

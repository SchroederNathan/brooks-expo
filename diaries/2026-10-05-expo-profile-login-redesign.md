# Profile login: Run Club panel and an email-first sheet

**Date:** 2026-10-05
**Agent:** Claude Opus 5.5
**System:** Expo
**Scope:** `src/screens/account/index.tsx`, `src/screens/login/index.tsx`,
`src/store/member.ts`, LLP 0003, `docs/profile-login-redesign.png`

## Outcome

The guest Profile tab is now a navy Run Club panel, three perk rows and one
`Log in or join` button. The login sheet asks for an email first. An email
that joined on this device before logs straight back in; a new email gets a
first-name step and joins. The `Log in` / `Create an account` pair and the
`?mode` parameter are gone. `tsc --noEmit` passes.

Checked on the "Brooks Health Positive QA" iPhone 18 Pro simulator (iOS 27.2,
Debug build): new email → name step → member card; sign out → same email in
different case → straight to "Hey, Sam."; "Continue as guest" closes the
sheet; the status bar is light over the navy panel and dark on the member
screen. Before/after screenshots are in `docs/profile-login-redesign.png`.

### Perk copy checked against the live site

The first version showed "Easy returns" as a member perk. On review, the live
sign-up page lists "Free shipping, Annual birthday gift, Early access to shoes
& sales, Fun games and prizes"; the Run Club page adds a 20% apparel welcome
offer; the Shipping page shows standard free and express free over $160 for
members. Returns are free for every customer (Run Happy Promise), so "Easy
returns" was replaced with "Early access", and `RUN_CLUB_PERKS` now lists only
the site's perks. The August note that "Early access" and "Fun games and
prizes" had no source was wrong: that session could not load the site and
relied on search snippets of one support article.

## What worked well

- The design came from the Mobbin board made earlier in the session
  (email-first sheets from Fresha and ChatGPT, perk rows from Thrive Market
  and lululemon), so there was no open design question.
- `run-sequence` with `await-ui-element` gates drove join, sign-out and
  log-in in three calls.

## Friction and blockers

- Fast Refresh did not apply an edit to the presented login modal while it
  was open. Relaunching the dev client loaded the new bundle.
- The first version auto-focused the email field. The keyboard then covered
  "Continue as guest", which LLP 0003 says must stay visible. Auto-focus was
  removed.
- The name step's button sat under the keyboard. `KeyboardAwareScrollView`
  keeps only the focused field clear, so its `bottomOffset` now includes the
  button below the field.
- Switching branches needed `git -c core.fileMode=false`: the exFAT drive
  reports every file as executable, so git saw mode changes as local edits.

## What was hard

- Telling account features (order history, saved addresses) from member
  perks. The support article mixes them; the sign-up page's benefit list does
  not.

## Comparative friction

Not observed.

## Improvement ideas

- The dev client's floating Tools button shows in every Debug screenshot.
  A way to hide it for screenshots would make PR images cleaner.

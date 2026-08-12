# Sniffing the Brooks commerce API

**Date:** 2026-07-13
**Agent:** Claude Fable 5
**System:** Research
**Scope:** Determine the real Brooks APIs behind the in-scope shopping journey, document them, and capture a real catalog for both apps. ([LLP 0002](../llp/0002-brooks-commerce-api.research.md))

## Outcome

brooksrunning.com is Salesforce Commerce Cloud (SFRA), with Constructor.io for
search and TurnTo for reviews. The full in-scope journey was driven end-to-end
against the real endpoints — browse → PDP → variant selection → **add to a real
Brooks cart**, which returned the correct line item and totals. No order was
placed.

The load-bearing discovery is a constraint, not an endpoint: **Brooks sits behind
Akamai Bot Manager, which 403s every non-browser HTTP client.** So the apps cannot
call Brooks's product or cart APIs at all. Two surfaces *are* open to a phone —
Constructor.io search and the image CDN — which is what makes the resulting design
possible: live search and live photography, with prices and stock served from a
snapshot captured through a real browser session.

Shipped: [`tools/harvest`](../tools/harvest) (network sniffer, cart probe,
catalog harvester) and `packages/catalog/catalog.json` — 226 products, 821
colorways, real prices, per-size stock, 7 images each, ratings and specs.

## What worked well

- **Playwright as the API client, not just the sniffer.** Once curl started
  getting 403s, calling the SFCC controllers from *inside* a warmed browser page
  (`page.evaluate(() => fetch(...))`) made every endpoint work instantly, because
  the request carried the real TLS fingerprint and Akamai's `_abck` cookie. This
  turned a hard blocker into a five-minute fix and is the single most reusable
  trick from this task.
- **Reading their own JS bundle.** The Constructor key was sitting in
  `cnstrc.com/js/cust/brooksrunning_oUqvvk.js`, and the live beacon traffic named
  the exact `group_id` the PLP browses. Sniffing the *analytics* calls turned out
  to be a faster route to the data API than sniffing the data calls.
- **`Product-Variation` is a single call that returns everything** — price, all
  colorways with their images, per-size `selectable` (which *is* the stock signal),
  specs, ratings. Discovering that collapsed the harvest from an imagined
  multi-endpoint crawl into one request per colorway.
- **Checkpointing the harvest to disk.** Phase 3 crashed on a non-string
  `description` after ~40 minutes of fetching. Because every product was already
  checkpointed, the fix-and-rerun cost seconds instead of another 40 minutes. Worth
  doing by default in any scraper.

## Friction and blockers

- ~30 minutes lost to Akamai before recognising the pattern. The tell was that the
  *homepage* returned 200 to curl while every `/on/demandware.store/…` controller
  and every PDP returned 403 — I initially read that as an endpoint-specific rule
  rather than bot detection with an edge-cached exception.
- The first network capture was drowned in ad-tech noise: ~40 trackers (Google,
  Adobe, Attentive, AdRoll, ContentSquare, Zendesk…) versus about six requests that
  actually mattered. Filtering to first-party + Constructor hosts should have been
  the first move, not the second.
- `mens-shoes-trail-running-shoes` looks like the obvious trail category and
  returns **zero** results; trail is merchandised under
  `featured-trail-running-collection`. Guessing taxonomy cost a wasted harvest pass.
- Constructor exposes `price_USD` as a *sort* option but never returns it as a
  field, and `fmt_options[hidden_fields]` will not surface it. I spent time
  assuming this was a request-shape problem before concluding the price genuinely
  is not in the index.

## What was hard

Deciding what "use the real API" should *mean* once it became clear the real API is
unreachable from the target platform. The tempting move — spoof harder until the
403s stop — is exactly the access-control bypass LLP 0000 rules out, and it would
have produced a demo that breaks the first time Akamai rotates its sensor. The
honest architecture (live where the client is welcome, snapshot where it is not,
and say so in the docs) is less impressive in one sentence and much more defensible
in every other sentence.

## Expo and Exact comparison

Not observed for the runtimes themselves — this was pure research. But the data
strategy constrains both equally, and in a way that happens to suit them: because
the catalog is a static JSON file plus an open CDN, **the same data layer works in
Expo Go and in an Exact web app with no server between them.** The one asymmetry
worth flagging is that Exact's web target inherits browser CORS, so it should read
`catalog.json` from its own origin (which `tools/harvest run sync` sets up), while
Expo can bundle it directly.

## Improvement ideas

- **For scrapers generally, and for any agent doing this again:** the
  "browser-as-HTTP-client" pattern (drive a real session, then `fetch` from inside
  the page) deserves to be a documented, first-class technique. It is the
  difference between "this site has no API" and "this site has a great API."
- **Expo:** nothing blocked here, but `expo-image`'s ability to take a bare URL and
  a size — with the CDN doing the resizing — is doing a lot of quiet work for
  perceived performance. A first-class "remote image with CDN size params" recipe in
  the docs would help people find it.
- **Exact:** the `resource` + `capability({ effects: ['network.fetch'] })` pattern
  is good, but a worked example of *serving a bundled JSON fixture from the dev
  server's own origin* would save the next person a CORS detour.
- The harvester should probably mine Constructor's `variations[]`, which may carry
  enough per-variant data to remove the SFCC leg entirely.

## Follow-ups

- Both apps are **handed off, not built.** Charlie stopped the task after the API
  sniff to have another model build them. Partial Expo scaffolding exists (see
  [the Expo scaffold diary](./2026-07-13-expo-scaffold.md)); the Exact app was not
  started.
- The Exact checkout at `~/projects/exact` is 67 commits behind `origin/main` with
  ~80 uncommitted local changes. It was deliberately left untouched. Whoever builds
  the Exact app must decide, explicitly, whether to build against that tree or a
  fresh clone ([LLP 0004](../llp/0004-building-on-exact.research.md)).
- Open question in LLP 0002: does the snapshot need re-harvesting on a schedule, or
  is a dated snapshot honest enough?

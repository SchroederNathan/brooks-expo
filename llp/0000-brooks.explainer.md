# LLP 0000: Brooks

<!-- @ref https://github.com/ccheever/llp/blob/v0.2.0/llp/0000-linked-literate-programming.explainer.md — Canonical LLP definition -->

**Type:** Explainer
**Status:** Draft
**Systems:** Brooks, Expo App, Exact App, Agent Development
**Role:** Root
**Author:** Charlie Cheever / Codex
**Date:** 2026-07-13
**Revised:** 2026-07-13
**Related:** LLP 0001, LLP 0002, LLP 0003, LLP 0004, [ccheever/llp](https://github.com/ccheever/llp)

## Summary

[confirmed — Charlie Cheever, 2026-07-13] Brooks is a working mobile-commerce
prototype inspired by the store on the Brooks Running website. The repository
will contain two implementations of that experience: a production-quality Expo
app and a more experimental Exact app.

[confirmed — Charlie Cheever, 2026-07-13] The Expo app is the primary output.
It should feel exceptionally polished and demonstrate to Brooks executives that
Expo is a compelling way to build the company's mobile app experience.

[confirmed — Charlie Cheever, 2026-07-13] The Exact app is a secondary research
vehicle. It should test how far the current Exact implementation can go, expose
its limits, and generate concrete lessons that can improve Exact.

## Product experience

[confirmed — Charlie Cheever, 2026-07-13] Both apps should mirror the useful
shopping functionality of the Brooks Running website. A user should be able to
explore real merchandise and progress through the shopping journey through
adding products to a cart. Completing a purchase is explicitly out of scope.

[confirmed — Charlie Cheever, 2026-07-13] The Expo app should work on iOS and
Android, should ideally work on the web, and must target Expo SDK 57 so that it
can be run with Expo Go.

### Required website surfaces

[confirmed — Charlie Cheever, 2026-07-13] The first complete prototype should
mirror the commerce-focused structure and content of the current Brooks website,
including:

- the home experience, led by the current Josh Kerr / Project 222 feature;
- Men's and Women's shopping sections;
- New Arrivals;
- the Shoe Finder;
- product browsing and product details needed to buy shoes;
- login; and
- a working shopping cart through add-to-cart and cart management.

[confirmed — Charlie Cheever, 2026-07-13] Non-commerce footer and corporate
content such as “Our Purpose” may be deferred. The priority is a convincing,
working shoe-discovery and shoe-buying experience rather than exhaustive parity
with every page on the website.

### Success criteria

- [confirmed — Charlie Cheever, 2026-07-13] The primary demo looks and feels
  excellent enough to impress Brooks executives, not merely prove technical
  feasibility.
- [confirmed — Charlie Cheever, 2026-07-13] Core browsing and product-detail
  experiences use real Brooks catalog data rather than a hand-authored mock
  catalog.
- [confirmed — Charlie Cheever, 2026-07-13] A user can select a purchasable
  product configuration and add it to a working cart.
- [confirmed — Charlie Cheever, 2026-07-13] iOS and Android are first-class
  targets; web is an additional target where practical.
- [confirmed — Charlie Cheever, 2026-07-13] The Exact implementation produces
  useful evidence about what Exact handles well, where agents struggle, and
  what should improve.

## Live Brooks data

[confirmed — Charlie Cheever, 2026-07-13] The prototypes should use the real
data and network APIs used by the Brooks Running website. Development should
inspect the website's behavior and network traffic, determine the requests and
responses needed for the in-scope shopping journey, and record the resulting
API knowledge in the repository so agents can build against it consistently.

[confirmed — Charlie Cheever, 2026-07-13] The live-data journey ends at a
working cart. The project does not need to submit payment or complete an order.

[confirmed — Charlie Cheever, 2026-07-13] This is a prototype, so it does not
need a heavyweight API-governance process. It must nevertheless use Brooks
services responsibly.

[inferred] Responsible prototype behavior means using normal publicly reachable
website flows, keeping request volume low, avoiding access-control bypasses and
secret capture, never placing an order, caching where it reduces unnecessary
traffic, and documenting dependencies on undocumented behavior.

## Design direction

[confirmed — Charlie Cheever, 2026-07-13] Design work should begin with a
survey of the strongest contemporary mobile shoe-shopping experiences. The
survey should identify interaction and information-design patterns worth
adopting rather than blindly copying one competitor.

[confirmed — Charlie Cheever, 2026-07-13] The final experience should combine
those native-commerce patterns with the layout, visual language, content, and
character of the Brooks website. It should feel spiritually related to Brooks
while remaining distinctively native, highly polished, and appropriate for
mobile interaction.

[inferred] The reference set and evaluation rubric are defined in
[LLP 0001](./0001-mobile-shoe-commerce-design.research.md). Brooks is the
canonical source for brand and scope; Nike, Zappos, adidas, and GOAT provide
complementary native-commerce benchmarks.

## Planned product surfaces

[confirmed — Charlie Cheever, 2026-07-13] The repository is expected to contain
an Expo app and an Exact app that pursue the same product experience with
different implementation goals.

[confirmed — Charlie Cheever, 2026-07-13] The Exact app should use the `main`
branch from `origin` at [ccheever/exact](https://github.com/ccheever/exact) for
now rather than pinning a release. Exact may be fixed during this project, and
the prototype should continue following upstream `origin/main` as those changes
land.

[inferred] Shared schemas, captured API knowledge, design tokens, assets, and
test fixtures may belong in common packages, but the sharing boundary should be
chosen only after both runtimes' constraints are understood.

## AI-agent development diaries

[confirmed — Charlie Cheever, 2026-07-13] Most implementation work will be done
by AI agents. As part of normal development, agents should keep durable diaries
covering:

- what worked especially well;
- where they became blocked or lost time;
- what was technically tricky or unexpectedly hard;
- what they believe would have been easier in another system; and
- actionable ideas for improving Expo and Exact.

[confirmed — Charlie Cheever, 2026-07-13] These diaries are a project output
that will be used to improve Expo and Exact.

[inferred] Entries should favor concise observations, reproducible evidence,
decisions, and useful retrospectives. They should not contain secrets or attempt
to preserve private hidden reasoning, and they do not replace code or design
documentation.

[inferred] Agent diaries live under [`diaries/`](../diaries/README.md). Each
substantial implementation or research task should create one short,
append-only entry using the template there. Entries are organized by date and
task slug so parallel agents can contribute without editing a shared log.

## Working principles

- [confirmed — Charlie Cheever, 2026-07-13] Optimize the Expo experience for
  executive-demo quality as well as functional correctness.
- [confirmed — Charlie Cheever, 2026-07-13] Prefer real Brooks data and observed
  behavior over invented fixtures for the primary user journey.
- [confirmed — Charlie Cheever, 2026-07-13] Preserve native quality instead of
  reproducing the website mechanically screen for screen.
- [confirmed — Charlie Cheever, 2026-07-13] Treat friction encountered by AI
  agents as research data that can improve the underlying developer tools.
- [observed — LLP adoption guide v0.2.0] Keep this generated root document
  `Draft` until its inferred claims are confirmed, corrected, or removed.

## Answered by research

- [observed — LLP 0002] **Market/locale:** the canonical demo is the Brooks US
  storefront, `Sites-BrooksRunning-Site`, `en_US`, USD.
- [observed — LLP 0002] **Cart interoperability:** the prototype's cart cannot
  interoperate with a website cart. Brooks is behind Akamai Bot Manager, which
  403s every non-browser client, so the app cannot reach `Cart-AddProduct` at all.
  The cart is therefore local, and builds the real Brooks variant id so the last
  mile is documented rather than guessed.
- [inferred — LLP 0002] **Asset and data constraints:** the catalog snapshot is a
  prototype fixture, not a redistribution. Imagery is streamed live from Brooks's
  own CDN rather than copied. A single, checkpointed harvest pass keeps request
  volume negligible. None of this survives contact with a public release, and it
  is not meant to.
- [inferred — LLP 0002] **Code-sharing boundary:** `packages/catalog` is the source
  of truth and is *copied* into each app by `tools/harvest run sync`. Metro and
  Vite both resolve outside their project root only with extra configuration, and a
  demo that fails to bundle on an unfamiliar machine is worth less than a
  duplicated file.

## Open questions

- Within the required website surfaces, which secondary features—search,
  filtering, recommendations, favorites, and account details—must ship in the
  first executive demo?
- What accessibility, responsiveness, performance, offline behavior, analytics,
  automated testing, and device coverage define “demo ready”?
- ~~How should Brooks consume Exact's `origin/main`?~~ **Resolved
  [confirmed — Charlie Cheever, 2026-07-13]: use a fresh clone of
  `origin/main`.** The clone lives at `~/projects/exact-main` (c3f49e50,
  `vendor/ibex` submodule initialized); `apps/exact` was scaffolded from it
  with `exact new` and links back to it via `exact.links.json`. The dirty tree
  at `~/projects/exact` was never touched. Build record:
  [diaries/2026-07-13-exact-app.md](../diaries/2026-07-13-exact-app.md).
- Does the catalog snapshot need re-harvesting on a schedule to stay truthful, or
  is a dated snapshot honest enough if the app says when it was captured?
- Who can confirm the remaining inferred claims and promote this root LLP from
  `Draft` to `Active`?

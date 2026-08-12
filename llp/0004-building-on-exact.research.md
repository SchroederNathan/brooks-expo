# LLP 0004: Building on Exact Today

**Type:** Research
**Status:** Active
**Systems:** Exact App
**Author:** Claude Fable 5
**Date:** 2026-07-13
**Revised:** 2026-07-14
**Related:** LLP 0000, LLP 0002

## Summary

[verified by running] A field guide to what Exact can actually do today, produced
by reading and *running* the checkout at `~/projects/exact`. Everything below is
marked `[verified]` (compiled or executed during the investigation) or `[read]`
(taken from the repo's docs).

**The headline: an Exact build of the Brooks app is feasible today, on the web
target, in Contract.** The repo already contains
`js/src/storefront-app/app.contract` — a category-filtered product grid → detail →
add-to-cart with a persistent cart badge. That is structurally the Brooks app minus
variant selection. It was driven end-to-end in headless Chromium: browse → detail →
add twice → cart badge read "2".

## Checkout state — read this first

[verified] `~/projects/exact` is **2 commits ahead of and 67 commits behind
`origin/main`, with ~80 modified files.** That is Charlie's working tree, not a
clean checkout.

[inferred] LLP 0000 says the Exact app should follow `origin/main`. Those two facts
conflict, and the conflict is not ours to resolve: pulling or stashing someone's
uncommitted work to make a prototype build is not a trade worth making. **Nothing
in the Exact checkout was modified.** Whoever builds the Exact app should decide
explicitly whether to work against the dirty local tree or a fresh clone of
`origin/main`, and record the choice.

## Platform reality

| Platform | State |
|---|---|
| **Web (real DOM)** | [verified] **The only paved path.** Contract emits host-ops; `installContractWebHost()` renders real DOM. |
| macOS (AppKit) | [read] ~75–80%, with documented overlay/text-input rendering bugs |
| iOS | [read] Platform ~90–95%, but Contract-on-iOS is a *manual*, not-CI-green gate |
| Android / Windows / Linux | [read] Not usable for this |

[inferred] **Demo the Exact app in a browser.** Anything else is a research project.

## Running it

```sh
cd ~/projects/exact/js && bun run dev
# Web:   http://localhost:8083
# Agent: http://localhost:8083/__exact/agent/
```

[verified] **Gotcha:** in example/consumer apps, plain `bun run dev` fails — Vite's
bin runs under node, whose ESM loader cannot resolve a `.js`→`.ts` import in
`exact-renderer`. Use `bun --bun run dev` to force Bun as the runtime. The `js/`
dev server above is exempt (its `vite-cli.mjs` registers a TS loader).

[verified] Scaffolding: `./target/debug/exact new <path>` — must run with cwd inside
the checkout; it symlinks `@exact/*` back out of it.

## Contract, in one page

```contract
use loadCatalog from "./data.ts"

component Store
  state screen = "browse"          # state-driven screens; no router needed
  state cart = []
  derive cartCount = cart.length

  resource catalog = loadCatalog(category)   # async data; re-runs when category changes

  action addToCart(id) writes cart           # every state written must be declared
    cart = cart.concat([id])

  task hydrate mount                         # this is "on mount"
    cart = loadCart()

  contract                                   # machine-checkable claims
    has node testId="product-grid"
    press button "Add to cart" -> addToCart

  view
    column gap=16 padding=24
      each item in catalog key=item.id
        ProductCard(item=item, open=openProduct)
```

[read] 33 built-in tags (`column row grid stack scroll text image button input
list virtualList spinner skeleton link …`), flexbox **and CSS grid**, plus a Facet
design-system library (buttons, inputs, selects, sheets, dialogs).

## The four things that decide the Brooks build

**1. Remote fetch works.** [verified] An async TS helper using plain `fetch`,
declared as `capability({ effects: ['network.fetch'] })` in a `.contract-meta.ts`
sidecar, bound with `resource`. Verified against a live remote JSON API, including
reactive re-fetch when a state dependency changed, with remote images rendering.

```ts
// data.contract-meta.ts
export default defineContractModule('./data.ts', {
  loadCatalog: capability({ params: { category: 'string' }, effects: ['network.fetch'] }),
  formatPrice: pure({ params: ['amount'], result: 'string', depends: 'args' }),
});
```

[inferred] For Brooks, serve `catalog.json` from the Exact dev server's own origin
(same-origin, no CORS) — `tools/harvest`'s `sync` script already copies it to
`apps/exact/public/`. Bundling it as a typed `data.ts` with `pure` helpers is the
even-lower-risk option and is the most-proven path in the repo.

**2. Remote images work.** [verified] `image src=… alt=… objectFit="cover"` renders
remote URLs. The Brooks CDN (LLP 0002) is open and resizes on demand, so the Exact
app can show the same real photography as the Expo app. Always set `alt` — the
runtime warns otherwise.

**3. Navigation.** [verified] Either state-driven screen switching in one
`app.contract` (what the storefront does; simplest, most proven) or the file router
(`src/app/routes/`, real URLs, `link href=`). For a demo, state-driven.

**4. Contract vs React.** [read] Both target the same kernel. The repo's own field
report concedes React was *"faster and less error-prone"* for a first stateful CRUD
build. But Contract is the default web target, has the machine-checkable `contract`
block and the agent API, and — decisively — the storefront example is already the
Brooks app's shape. **Recommend Contract**, and treat any place it fights back as
the research output this project is meant to produce.

## What does not work

[read/verified] The honest list:

- **No gestures.** `swipe*`, `scrollend`, and `refresh` are reserved and
  **compiler-rejected**. Pointer events exist. This kills swipe-to-delete, pull-to-
  refresh, and the pager-based PDP gallery outright.
- **No animation DSL.** Only `transition`/`transform` style attributes. The Expo
  app's staggered hero entrance, flying add-to-cart, and shared-element transition
  have no equivalent.
- **HMR is reset-based** — every edit remounts the app and loses all state.
- **No production ship story for Contract web yet** (no SSR/serve). The dev server
  *is* the deliverable.
- **CSS restrictions:** no `calc()`, no custom properties, no `position: fixed`
  or `sticky`, no pseudo-elements. Sticky headers and the collapsing header are
  therefore off the table.
- **Sidecar ceremony:** every TS helper used from `.contract` wants a descriptor,
  or the compiler emits `opaque_import` warnings.
- Scaffolded apps omit the web agent bootstrap; add
  `ensureAppAgentBootstrap()` to `src/main.tsx` or the agent API returns
  `NO_REGISTERED_TARGET`.

[inferred] Read that list next to LLP 0003's wow list and the shape of the result
is already clear: **the Exact app can be a genuinely good, real-data storefront —
grid, filters, detail, variant chips, cart, live fetch — and it cannot be a
*motion* showcase.** That gap is not a failure of the exercise; it is the finding,
and it is the most useful thing this project can tell the Exact team.

## The agent API

[verified] With a dev server up, `http://127.0.0.1:8083/__exact/agent/` serves
`targets`, `tree` (semantics tree with refs, testIds, frames), `screenshot`,
`find`, `tap`, `type`, `wait`. Mutating calls need `Authorization: Bearer
$EXACT_AGENT_TOKEN` even on loopback. MCP bridge at `/__exact/mcp`.

[inferred] Give every significant node a `testId`: it is simultaneously the
contract selector, the agent handle, and the Playwright hook. This is how the Exact
app gets verified without a human driving it.

## Addendum, 2026-07-13 (after the build): what the Brooks app proved

[verified by building — `apps/exact`, exact@origin/main c3f49e50, agent-driven
end-to-end; full record in
[diaries/2026-07-13-exact-app.md](../diaries/2026-07-13-exact-app.md)]

Corrections and confirmations to the sections above:

- **The checkout question is resolved:** fresh clone of `origin/main` at
  `~/projects/exact-main` (Charlie's call). Two undocumented steps make a
  fresh clone usable: `git submodule update --init vendor/ibex`, and the CLI
  builds as `cargo build -p exact-cli` (not `-p exact`).
- **"No animation DSL" was too pessimistic in one spot:** `temporal()` text
  bindings exist and work — the Brooks app runs a once-per-second Project 222
  countdown on the JS-tier web target. Ticking UI is possible; *motion* still
  is not.
- **The web agent bootstrap gotcha is deeper than "add
  `ensureAppAgentBootstrap()`":** on current `origin/main` the in-browser
  agent server transitively imports `node:worker_threads` and `node:crypto`
  at module scope (code-mode), which Vite externalizes into throw-on-access
  shims — the bootstrap dies and web targets never register. Workaround:
  alias both builtins to stubs (`apps/exact/src/shims/`); the crypto stub
  needs a real sha256 because code-mode hashes its SDK manifest at import.
- **`exact new` scaffolds fail `bun run typecheck` out of the box** — all
  errors inside the source-linked `@exact/*` packages, none in app code.
- **Agent-driving discipline:** snapshots taken mid-re-render return
  `refs: {}` and tap-by-testId 422s against them (retry/poll or use
  `exact_wait`); with multiple registered targets the relay's
  "most recently active" default can route to zombie pages — pass
  `?target=` using the page's own `sessionStorage.__exact_web_agent_target_id`.
- **The prediction held:** the finished Exact app is a genuinely good
  real-data storefront (grid, chips, search, variant selection, cart with
  real Brooks variant ids) and not a motion showcase. `memoRows("id")`,
  the sidecar ceremony, state-driven screens, and remote CDN images all
  behaved exactly as §"The four things" said they would.

## Addendum, 2026-07-14: bounded image work

[verified by compiling and data-level benchmark — ENG-24862] The wrapping
Contract product grid is not virtualized: mounting a category previously
created every card and image source at once (24–97 products across the eight
categories). The app now pages that stable `memoRows("id")` collection in
12-card increments. Initial source fan-out is therefore 12 for every category,
and only the widest layout's first four cards are marked `loading="eager"`
and `priority="high"`; the remaining grid cards are lazy/auto. The home hero
and the selected product's main image are also explicit eager/high candidates.

[inferred] This is a bounded interim policy, not a substitute for viewport-aware
virtualization. It makes the current wrapping grid honest and measurable while
the Exact list/virtualization path remains a separate framework capability.

## Recommended starting recipe

1. Copy `js/src/storefront-app/` to a new lab, or `exact new` into `apps/exact`.
2. One `app.contract`, `state screen = "home" | "list" | "detail" | "cart"`.
3. Catalog from `resource` + `capability` fetch of `catalog.json` (LLP 0002), or
   bundled as typed `data.ts` with `pure` helpers.
4. Variant selection with chip rows (the storefront's `CategoryChip` pattern) or
   `FacetSelect`.
5. Verify with `exact contract check app.contract --mount --tree`, then drive it
   live through the agent API.

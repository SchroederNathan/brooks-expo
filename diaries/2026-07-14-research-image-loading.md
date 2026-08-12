# Image loading performance investigation

**Date:** 2026-07-14
**Agent:** Codex (GPT-5)
**System:** Research
**Scope:** Diagnose web, macOS, and iOS image loading in the Expo and Exact storefronts.

## Outcome

- [observed] Product photography is served through Akamai (`www.brooksrunning.com`
  CNAMEs to `edgekey.net`) and the `/dw/image/v2/` service honors requested
  dimensions. A representative shoe was 3.2 KB at 160px, 5.5 KB at 240px,
  19.6 KB at 480px, and 51.0 KB at 900px. The 750x1200 editorial hero was
  90.3 KB. Giant source downloads are not the primary problem.
- [observed] Representative cold-client product requests took about 0.3-0.5s to
  first byte. Exact eagerly mounts and loads all 47-97 cards in a category,
  while its native loader has a 64 MB decoded, process-memory-only cache.
- [observed] Exact web emits plain `<img>` elements and supports `loading="lazy"`,
  but this app does not set it. Exact native does not project that hint into its
  image protocol/loader and has no viewport-aware loading in this grid.
- [observed] Three non-hero CMS story URLs returned HTML access-denied responses
  after 0.7-0.9s. They fail late rather than decode as images.
- [inferred] The dominant perceived delay is request fan-out plus CDN first-byte
  latency, amplified on native by no disk image cache and no list virtualization.

## What worked well

Reading the Brooks image helper, Exact's native `ExactMediaLoader`, the Contract
grid, response headers, DNS, and actual downloaded dimensions separated asset
weight from scheduling and cache behavior quickly.

## Friction and blockers

The Exact dev server did not start because Node rejected a JSON import missing
`type: json`, and the in-app browser was unavailable, so a fresh browser waterfall
could not be captured. Static renderer inspection and direct response timings
still exposed the request policy and CDN behavior.

## What was hard

`sfrm=png` does not imply a PNG response: Akamai Image Manager returned optimized
JPEG for the representative opaque product shots. Encoded response type and
decoded-memory cost therefore had to be measured separately.

## Expo and Exact comparison

Expo uses `expo-image` with `cachePolicy="memory-disk"`, explicit sizes, priority,
and virtualized product grids on its primary browsing surfaces. Exact sizes
images correctly and coalesces identical in-flight URLs, but its native cache is
memory-only and the Contract grid mounts every card at once.

## Improvement ideas

- Add viewport-aware/lazy native image scheduling and a persistent encoded-byte
  cache to Exact.
- Render large product collections with Exact's virtualized-list work rather
  than a wrapping row.
- Set web `loading="lazy"` for below-the-fold cards and prefetch only the first
  visible row.
- Validate or replace CMS editorial URLs during harvest so HTML error bodies do
  not masquerade as slow images.

## Follow-ups

Capture web and native request waterfalls after the Exact dev-server JSON import
compatibility issue is resolved, then benchmark eager versus viewport-bounded
loading on the 97-item Sale category.

## Addendum: ENG-24942 bounded-loading benchmark

**Captured:** 2026-07-14 15:00–15:01 UTC

**Brooks commit:** `463027e9b33190a40b56823e55d092ead9b49816`

**Exact commit:** `4ee5a29a38f531b8aa1da1de003c6ae722a301c1`

**Machine:** Apple M5 Max MacBook Pro, 18 cores, 128 GB RAM, macOS 26.5.2
(`25F84`)

**Network/cache state:** live network; Bun `fetch`; no client HTTP cache; six
concurrent requests. Akamai reported CDN hits in the detailed bounded sample.

[observed] `tools/harvest/benchmark-exact-images.ts` now makes the comparison
reproducible from the app's real `gridFor`, `gridPage`, and image URLs. It labels
itself a transport control because Bun does not reproduce browser priority,
layout, decode, native assignment, or persistent-cache behavior. Pass
`--details` to emit per-request start offsets, response timing, status, type,
bytes, and `Server-Timing` as a compact waterfall.

Run with `bun tools/harvest/benchmark-exact-images.ts --mode <bounded|eager>
--concurrency 6 --exact-commit 4ee5a29a3` from the repository root:

| Order | Policy | Logical / unique requests | Successful images | Encoded bytes | First-visible-row control | Wall time | TTFB p50 / p95 / max |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | bounded | 12 / 12 | 12 | 118,656 | 583.8 ms | 805.7 ms | 176.8 / 583.6 / 583.6 ms |
| 2 | eager | 97 / 95 | 95 | 890,698 | 230.4 ms | 3,619.7 ms | 153.3 / 445.0 / 709.4 ms |
| 3 | bounded | 12 / 12 | 12 | 118,656 | 129.4 ms | 416.8 ms | 89.7 / 293.3 / 293.3 ms |

[observed] Relative to the eager control, the bounded policy removes 83 logical
initial image nodes (85.6%), 83 unique initial requests (87.4%), and 772,042
encoded transfer bytes (86.7%). Its two bracketing runs completed 77.7–88.5%
sooner. All current app URLs returned image responses; the detailed bounded run
negotiated `image/avif`. This supersedes the earlier same-day observation that
the full query string returned 403 HTML, which was transient CDN behavior rather
than a stable URL correctness failure.

[observed] The first-visible-row control was 583.8 ms before the eager run,
230.4 ms during the eager run, and 129.4 ms in the warmed bounded repeat. These
live-CDN samples do not establish a first-row latency win: cache state dominates
the small critical set, and Bun's six-worker queue does not implement the app's
`eager/high` versus `lazy/auto` browser/native scheduling semantics.

[blocked] A browser field waterfall could not be captured because the in-app
Browser had no attached target. Per the repository browser workflow, no
standalone automation substitute was used. The Brooks Exact dev server did run
successfully on its isolated port, so the remaining browser prerequisite is an
attached in-app Browser target.

[blocked] macOS and iOS field runs could not be captured with a current native
host. A clean Exact checkout at the commit above repeatedly stalled in Xcode's
`CreateBuildDescription` phase even with unique DerivedData and module-cache
paths. The newest already-built macOS app predates the image scheduler,
residency ledger, and raster-assignment receipt changes, so using it would give
misleading post-change evidence. Consequently there is no valid decoded-
residency/media-ledger measurement or second-view/second-launch result yet.

[inferred] The policy's fan-out and byte reduction is demonstrated, while its
user-visible scheduling, decode-residency, and relaunch effects remain unproven.
Keep ENG-24942 open until browser and current native hosts can supply those
platform-specific columns.

## Addendum: current native-host retry

**Captured:** 2026-07-14 15:35–15:42 UTC

**Brooks commit:** `c64001bee559345bd34cfd165507de5088fcc9fa`

**Exact commit:** `4ee5a29a38f531b8aa1da1de003c6ae722a301c1`

[observed] A clean current `ExactAppMac` build completed successfully after a
temporary, uncommitted compiler-discovery wrapper drained Xcode's oversized
`clang -dM` probe. The wrapper delegated all real compiler invocations to the
standard Apple clang; Xcode completed Swift compilation, linking, signing, and
validation with `** BUILD SUCCEEDED **`. This narrows the earlier
`CreateBuildDescription` stall to Xcode build-service discovery rather than an
Exact source failure.

[observed] The resulting app connected to the isolated Brooks server, downloaded
the 195-module native envelope, and then correctly failed closed before JavaScript
evaluation. Its live host status reported the missing signed
`exact-armed-snapshot.json`; the packaged `armed-runtime/README.md` confirms that
current Ibex advertises no executable Exact target and forbids copying example or
ad-hoc snapshots into production.

[confirmed by Linear state] Native field evidence is therefore gated by
ENG-24933 (Ibex Exact target advertisement, authenticated artifacts, and typed
ingress), which blocks ENG-24927 (Exact Apple/Windows armed-runtime migration).
ENG-24942 should carry ENG-24927 as a blocker. Bypassing this gate with an old
runtime or example snapshot would invalidate the current-commit field result and
weaken a deliberate security boundary.

[blocked] The native media ledger, decoded-residency high-water mark, and
second-view/second-launch measurements remain unavailable until that runtime gate
lands. The browser retry also found no attached in-app Browser target, so the web
waterfall remains pending independently.

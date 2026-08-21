# Brooks PDP detail sections

**Date:** 2026-08-21
**Agent:** Codex GPT-5.6
**System:** Expo
**Scope:** Match the Brooks mobile PDP returns band, product-detail rows, review summary, iconography, and disabled purchase state.

## Outcome

The PDP now uses a full-width Run Happy returns band, an expanded two-column
Product Details accordion, Brooks's exact balanced-cushion and balanced-support
SVG diagrams, and a compact reviews accordion using the existing sprite stars.
The shared purchase button now matches the storefront's gray disabled state and
retains its price while the variant is incomplete.

## What worked well

The warmed collaborative browser could inspect the Akamai-protected live PDP,
identify the standalone diagram asset URLs, fetch their SVG source in-page, and
measure the disabled button's computed `rgb(112, 112, 112)` style. Reusing the
existing bundled Run Happy seal avoided another asset copy. Expo Image and
react-native-svg rendered all three sources consistently in the simulator.

## Friction and blockers

The first semantic browser snapshot failed without diagnostics, so DOM
evaluation was used for targeted inspection. The normalized catalog does not
currently carry midsole drop, weight, or sustainability, which prevented those
rows from being added honestly across products.

## What was hard

The live page splits its icons between an inline header sprite and standalone
PDP SVG files. Preserving that provenance while keeping a single native icon
language required verifying each asset instead of tracing the screenshot.

## Comparative friction

The web page exposes asset URLs and computed styles directly. In Expo the same
visuals require translating exact SVG geometry into react-native-svg, but the
result is deterministic and needs no runtime web dependency.

## Improvement ideas

Expo's debugging stack would benefit from a first-party way to inspect the
rendered dimensions and source metadata of SVG/Image components alongside the
React component tree.

## Follow-ups

Extend the catalog harvester and normalized schema for drop, weight, and
sustainability before adding those rows across the product catalog.

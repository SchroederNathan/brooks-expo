# LLP 0001: Mobile Shoe Commerce Design Survey

**Type:** Research
**Status:** Draft
**Systems:** Brooks, Expo App, Exact App, Design
**Author:** Charlie Cheever / Codex
**Date:** 2026-07-13
**Related:** LLP 0000

## Summary

[confirmed — Charlie Cheever, 2026-07-13] The Brooks apps should combine the
structure and spirit of the Brooks website with patterns from excellent native
shoe-shopping apps. Charlie delegated selection of the reference apps and the
evaluation rubric to Codex.

[inferred] The initial reference set is Nike, Zappos, adidas, and GOAT. Together
they cover the four capabilities most relevant to Brooks: editorial brand
storytelling, shoe-finding utility, polished first-party sports retail, and
premium product presentation. Brooks itself remains the canonical reference for
content, brand, and required scope.

## Research basis

[observed — Brooks US website, 2026-07-13] The current Brooks home experience
leads with Josh Kerr's Project 222 story and connects editorial content to
products. Its primary commerce navigation includes Women, Men, New Arrivals,
Shoe Finder, account access, and cart. New Arrivals supports shoe-specific
filters including gender, size, cushion, width, color, rating, and features.

[observed — first-party and App Store materials, 2026-07-13] This initial
selection is desk research based on current product descriptions and website
behavior. A hands-on pass through the installed apps should precede detailed
screen design because store descriptions do not reveal interaction quality,
motion, latency, or every current screen.

## Reference set

### Brooks website — canonical scope and identity

[confirmed — Charlie Cheever, 2026-07-13] Mirror the current commerce-focused
Brooks website, including the Josh Kerr / Project 222 home feature, Men's,
Women's, New Arrivals, Shoe Finder, login, product shopping, and cart. Corporate
footer content such as “Our Purpose” may be deferred.

[inferred] Preserve Brooks's optimistic running identity, product taxonomy,
technical shoe attributes, imagery, and editorial-to-product connections. Adapt
their presentation to native mobile patterns rather than reproducing desktop
page structure literally.

### Nike — editorial commerce and membership

[observed — Nike App product page, 2026-07-13] Nike presents its app as a
personal guide combining the latest gear, stories, community, personalized
recommendations, membership, early access, and simpler shopping.

[inferred] Study Nike for home-feed hierarchy, the transition from athlete or
brand storytelling into products, member-aware personalization, and the way a
large brand makes commerce feel like an ongoing native destination.

### Zappos — discovery, filtering, and fit confidence

[observed — Zappos App Store listing, 2026-07-13] Zappos emphasizes fast
browsing, strong search and filters, detailed product imagery and video,
personalized recommendations, account tools, favorites and lists, broad size
and width selection, and easy returns.

[inferred] Study Zappos for high-utility catalog navigation, filter ergonomics,
size and width clarity, product comparison confidence, and recovering from the
uncertainty inherent in buying shoes without trying them on.

### adidas — polished sports retail

[observed — adidas App Store listing, 2026-07-13] adidas combines athlete
stories, new releases, men's and women's shopping, member exclusives, wishlists,
notifications, order history, and a short purchase path in one branded app.

[inferred] Study adidas for a close peer example: first-party performance-sports
commerce, new-arrival presentation, member entry points, visual rhythm, and the
balance between technical products and lifestyle merchandising.

### GOAT — premium product focus and launch energy

[observed — GOAT app page, 2026-07-13] GOAT emphasizes curated collections,
exclusive releases, saved products, restock and price notifications, editorial
stories, rich sneaker presentation, and augmented-reality try-on.

[inferred] Study GOAT selectively for confident product imagery, focused detail
screens, wish-list feedback, launch storytelling, and motion. Its resale-market
mechanics and scarcity model are not a template for Brooks's standard retail
journey.

## Evaluation rubric

[inferred] Score each reference and each major Brooks prototype iteration from
1–5 in the following categories, then apply the weights. A score of 3 means
competent and expected; 5 means unusually strong and worth emulating.

| Category | Weight | What to evaluate |
|---|---:|---|
| Native polish and interaction | 20% | Hierarchy, typography, motion, gestures, feedback, perceived performance, platform conventions |
| Shoe decision confidence | 20% | Imagery, technical attributes, size/width/color selection, fit guidance, comparison, availability |
| Discovery and navigation | 15% | Home structure, Men's/Women's/New Arrivals, search, filters, wayfinding, return paths |
| Brooks brand and editorial commerce | 15% | Brand distinctiveness, athlete storytelling, content-to-product transitions, emotional impact |
| Product detail and cart flow | 15% | Variant selection, price and stock clarity, add-to-cart feedback, cart editing, error recovery |
| Accessibility and resilience | 10% | Touch targets, contrast, text scaling, screen-reader semantics, loading/error/empty states, responsive behavior |
| Executive-demo impact | 5% | Memorability, coherence, visible craft, and ability to communicate Expo's value quickly |

[inferred] The Brooks prototype should not simply maximize the total by copying
the winner. The rubric is a comparison tool: take specific patterns whose
strength supports Brooks's goals, then express them in Brooks's own visual and
product language.

## Recommended pattern ownership

[inferred] Use the following default ownership when references conflict:

- Brooks decides content, taxonomy, tone, and the required journey.
- Nike is the lead reference for editorial-to-commerce home composition.
- Zappos is the lead reference for filters, fit confidence, and catalog utility.
- adidas is the lead reference for first-party sports retail and membership.
- GOAT is an accent reference for product drama, imagery, and motion.
- Native iOS and Android conventions override a web-derived pattern when the
  native behavior is clearer or more accessible.

## Confidence and limitations

[observed — research method] Confidence is high that the selected apps cover
complementary, relevant product strengths. Confidence is medium on individual
interaction recommendations until the team performs a hands-on walkthrough on
current iOS and Android builds.

[inferred] Before visual implementation, capture a compact screen-and-notes
walkthrough of home, category, search/filter, product detail, login, and cart in
each available reference app. Record only the patterns and rationale needed for
Brooks; do not create a pixel-for-pixel clone.

## Sources

- [Brooks Running US home](https://www.brooksrunning.com/en_us/)
- [Brooks Shoe Finder](https://www.brooksrunning.com/en_us/shoefinder/)
- [Brooks New Arrivals](https://www.brooksrunning.com/en_us/featured/new-arrivals/)
- [Brooks Project 222 / Josh Kerr](https://www.brooksrunning.com/en_us/athletes-sponsored-by-brooks-running/josh-kerr/)
- [Nike App](https://www.nike.com/nike-app)
- [adidas App Store listing](https://apps.apple.com/us/app/adidas-shop-shoes-clothing/id1266591536)
- [Zappos App Store listing](https://apps.apple.com/us/app/zappos-shop-shoes-clothes/id392988420)
- [GOAT app](https://www.goat.com/app)

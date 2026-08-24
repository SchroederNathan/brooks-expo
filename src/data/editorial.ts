/**
 * Homepage editorial content.
 *
 * Everything here used to mirror a real retailer's home experience: their
 * campaign copy, their athlete feature, their lifestyle crops, and their
 * mobile hero video, all bundled so the demo would not depend on the site at
 * runtime. That is exactly the third-party content an App Review rejection
 * under 4.1 is about, so it is gone.
 *
 * The imagery is now a pair of hex stops per card, drawn as a gradient at the
 * call site. No bundled photography means nothing here belongs to anybody, and
 * the layouts keep their real frames to fill.
 */

import { colors } from '@/theme';

/** A drawn stand-in for a photograph: two stops, dark end first. */
export type Tint = readonly [string, string];

export const HERO = {
  eyebrow: 'Sample content',
  title: 'A demo storefront',
  body:
    'This app is a user-interface demonstration. The products, prices, reviews, and imagery are all generated sample data.',
  cta: 'Browse the catalog',
  ctaCategory: 'mens-shoes-road-running-shoes',
  ctaTitle: 'Road running shoes',
  /** Replaces a bundled campaign video; the hero draws this instead. */
  tint: ['#0E5C63', '#123238'] as Tint,
} as const;

export const HOME_GEAR = [
  { id: 'womens-shoes', label: 'New women’s shoes', tint: ['#12A0A8', '#0E5C63'] as Tint },
  { id: 'mens-shoes', label: 'New men’s shoes', tint: ['#1D6E75', '#123238'] as Tint },
  { id: 'womens-apparel', label: 'New women’s apparel', tint: ['#FFB020', '#C77D0B'] as Tint },
  { id: 'mens-apparel', label: 'New men’s apparel', tint: ['#3A4547', '#12191A'] as Tint },
] as const;

/** The activity rail. Four ways to enter the catalog. */
export const USE_CASES = [
  { id: 'featured-best-sellers', label: 'Run', tint: ['#0E5C63', '#12191A'] as Tint },
  { id: 'featured-trail-running-collection', label: 'Trail', tint: ['#4A6B3A', '#1F2E1A'] as Tint },
  { id: 'featured-shoes-in-widths', label: 'Walk', tint: ['#8A7F6B', '#3A3428'] as Tint },
  { id: 'featured-new-arrivals', label: 'Lifestyle', tint: ['#12A0A8', '#123238'] as Tint },
] as const;

export const STORIES = [
  {
    id: 'cushioning',
    eyebrow: 'Gear and technology',
    date: 'April 14, 2026',
    title: 'How cushioning changes what your stride feels like',
    tint: ['#0E5C63', '#12191A'] as Tint,
    shopCategory: 'featured-new-arrivals',
    shopLabel: 'New arrivals',
  },
  {
    id: 'first-trail-run',
    eyebrow: 'Running tips',
    date: 'April 21, 2026',
    title: 'Your first trail run: what changes and what doesn’t',
    tint: ['#4A6B3A', '#1F2E1A'] as Tint,
    shopCategory: 'featured-trail-running-collection',
    shopLabel: 'Trail running',
  },
] as const;

/** Section grounds that were photographic washes. */
export const SECTION_TINT = {
  gear: [colors.surfaceAlt, colors.surfaceSunken] as Tint,
  member: ['#123238', '#0B1E22'] as Tint,
} as const;

/**
 * Product voice. Rewritten from scratch — the previous strings were a real
 * company's marketing lines, including a named guarantee, and copy is theirs
 * whether or not their name is still attached to it.
 */
export const VOICE = {
  emptyCart: 'Your cart is empty. Add something from the catalog to see it here.',
  promise: 'This is a demo. Nothing here can be bought, and no order is ever placed.',
  promiseTitle: 'Demo build',
  runClub: 'Create a sample account to see the member screens.',
  finderWelcome: 'Find a shoe in the sample catalog',
  finderBlurb:
    'Answer a few questions and the finder will narrow the generated catalog to a short list. It is a demonstration of the flow, not a real recommendation.',
  finderCta: 'Start',
  tagline: 'A demo storefront',
} as const;

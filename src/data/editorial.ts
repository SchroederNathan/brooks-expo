/**
 * Homepage editorial content.
 *
 * @ref LLP 0003#the-home-feature — Copy, order, and campaign imagery mirror the
 * current Brooks home experience represented by the Paper source of truth. The
 * Paper lifestyle crops and the site's mobile Ghost Amp video are bundled so
 * the executive demo does not depend on Akamai-protected page HTML at runtime.
 */

export const HERO = {
  eyebrow: 'Just dropped',
  title: 'The Ghost Amp',
  body:
    'Amplify your run in the all-new Ghost Amp, featuring technology that injects energy into every stride.',
  cta: 'Shop now',
  ctaCategory: 'mens-shoes-road-running-shoes',
  ctaTitle: 'Road running shoes',
  /** Mobile source used by brooksrunning.com for Brightcove video 6400666963112. */
  video: require('../../assets/home/ghost-amp-mobile.mp4'),
} as const;

export const HOME_GEAR = [
  {
    id: 'womens-shoes',
    label: 'New women’s shoes',
    image: require('../../assets/home/new-womens-shoes.webp'),
  },
  {
    id: 'mens-shoes',
    label: 'New men’s shoes',
    image: require('../../assets/home/new-mens-shoes.webp'),
  },
  {
    id: 'womens-apparel',
    label: 'New women’s apparel',
    image: require('../../assets/home/new-womens-apparel.webp'),
  },
  {
    id: 'mens-apparel',
    label: 'New men’s apparel',
    image: require('../../assets/home/new-mens-apparel.webp'),
  },
] as const;

/** The four ways Brooks segments the activity rail on the current homepage. */
export const USE_CASES = [
  {
    id: 'featured-best-sellers',
    label: 'Run',
    image: require('../../assets/home/run.webp'),
  },
  {
    id: 'featured-trail-running-collection',
    label: 'Trail',
    image: require('../../assets/home/trail.webp'),
  },
  {
    id: 'featured-shoes-in-widths',
    label: 'Walk',
    image: require('../../assets/home/walk.webp'),
  },
  {
    id: 'featured-new-arrivals',
    label: 'Lifestyle',
    image: require('../../assets/home/lifestyle.webp'),
  },
] as const;

export const STORIES = [
  {
    id: 'dna-tuned',
    eyebrow: 'Gear and technology',
    date: 'April 14, 2026',
    title: 'What DNA Tuned cushioning actually does to your stride',
    image: require('../../assets/home/story-dna-tuned.webp'),
    shopCategory: 'featured-new-arrivals',
    shopLabel: 'New arrivals',
  },
  {
    id: 'first-trail-run',
    eyebrow: 'Running tips',
    date: 'April 21, 2026',
    title: 'Your first trail run: what changes and what doesn’t',
    image: require('../../assets/home/story-trail.webp'),
    shopCategory: 'featured-trail-running-collection',
    shopLabel: 'Trail running',
  },
] as const;

/** Brooks's own words. Their voice is optimistic and lightly wry; keep it. */
export const VOICE = {
  emptyCart: "There's nothing in your cart. Let's remedy that, shall we?",
  promise: "Take it for a 90-day trial run. If you're not happy, we're not happy.",
  promiseTitle: 'Run Happy Promise',
  runClub: 'Join the club. Run happier.',
  finderWelcome: 'Your perfect shoe is out there',
  finderBlurb:
    "In 5 minutes or less, Brooks Shoe Finder will identify the right shoe for you. Whether you're training for a marathon, running for fun, or walking your way around town, we'll find you a great match.",
  finderCta: "Let's go",
  tagline: "Let's Run There",
} as const;

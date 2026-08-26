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

/**
 * The site's mid-page brand banner, in the slot it holds on brooksrunning.com:
 * between the new-gear rail and the activity rail.
 *
 * @ref LLP 0003#the-home-feature — Brooks ships this banner as ONE mobile
 * collage, `cms-content/…/2026/August/Updated-Images/F26-NA-BRcom-AUG-HP-03-S.jpg`
 * (750×1450): a washed-out backdrop, then an action photo laid over it from
 * y=557 down, inset 25px from the left so the backdrop shows through beside it.
 *
 * The app rebuilds that as two layers so each can move independently. `backdrop`
 * is the WHOLE collage — its hidden region (right of the strip, below the seam)
 * is smeared flat so it costs 14 KB instead of 100, but the 25px strip the app
 * actually shows is untouched source. `photo` is the action crop alone, laid
 * over it at the same inset and hung `photoOverhang` past the backdrop's bottom
 * edge, which the flat web composite cannot do.
 */
export const LONGER_DAYS = {
  title: 'Longer days.\nLonger runs.',
  body: 'Build your mileage in gear designed to support your training.',
  backdrop: require('../../assets/home/longer-days-backdrop.webp'),
  photo: require('../../assets/home/longer-days-runner.webp'),
  /** Natural size of the harvested photo crop; the app renders it to aspect. */
  photoWidth: 725,
  photoHeight: 893,
  /** The photo's left inset in the source collage, as a fraction of its width. */
  photoInset: 25 / 750,
  /**
   * How far the photo hangs below the backdrop's bottom edge. The web composite
   * has no overhang — both halves end on the same line, because they are one
   * JPEG. Separating the layers is what buys it, and a small drop reads as a
   * photo resting on the panel rather than filling a slot in it.
   */
  photoOverhang: 32,
  /**
   * The site links these to `featured/training-gear/{gender}`, which is not a
   * Constructor group the catalog harvest covers. Its members are training
   * apparel, so the app sends each CTA to that gender's apparel category.
   */
  ctas: [
    { id: 'women', label: 'Shop women', category: 'womens-apparel', title: "Women's Apparel" },
    { id: 'men', label: 'Shop men', category: 'mens-apparel', title: "Men's Apparel" },
  ],
} as const;

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

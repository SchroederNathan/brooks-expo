/**
 * Homepage editorial content.
 *
 * @ref LLP 0003#editorial — Copy and imagery are the real thing, lifted from the
 * live Brooks homepage on 2026-07-13, not invented. The Project 222 hero is the
 * feature Brooks is actually running right now, and Kerr's record attempt is on
 * 2026-07-18 — which is why the home screen carries a live countdown rather than
 * a static banner. It expires on its own, correctly, the way the real campaign does.
 */

export const HERO = {
  eyebrow: 'Josh Kerr attempts mile world record',
  title: 'Project 222',
  body: 'On July 18th, 2026, Brooks Beast Josh Kerr will attempt to break the mile world record on British soil in 222 seconds. This is Project 222.',
  cta: "Shop Kerr's training gear",
  ctaCategory: 'featured-best-sellers',
  /** Portrait still pulled from the hero's ambient video loop. */
  image:
    'https://www.brooksrunning.com/on/demandware.static/-/Sites/default/dw06ee0bb5/cms-content/Project/Brooks-Running/Homepage/2026/July/Josh-Kerr-Hero/S26_Video_Project222_JoshKerr_Hero_15s_Ambient_750x1200_v2mp400_00_02_06Still001.jpg',
  /** The moment the attempt goes off, London. Drives the countdown. */
  attemptAt: Date.UTC(2026, 6, 18, 19, 0, 0),
} as const;

export const STORIES = [
  {
    id: 'ghost-evolution',
    eyebrow: 'Gear',
    title: 'The evolution of the Ghost',
    readTime: '4 min. read',
    // The CMS article hero returns an Akamai HTML denial to app clients. Use
    // the open Brooks image CDN's Ghost catalog photography instead.
    image:
      'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dwe6b5d0cf/original/110442/110442-112-l-ghost-17-mens-neutral-cushion-running-shoe.jpg',
    /** Editorial that lands on merchandise — the whole point of the home feed. */
    shopFranchise: 'Ghost',
    shopLabel: 'Shop the Ghost',
  },
  {
    id: 'best-ghost',
    eyebrow: 'Shoe advice',
    title: 'Which Ghost is right for you?',
    readTime: '6 min. read',
    image:
      'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dw6186ec04/original/120431/120431-458-l-ghost-17-womens-neutral-cushion-running-shoe.jpg',
    shopFranchise: 'Ghost',
    shopLabel: 'Compare the Ghosts',
  },
  {
    id: 'trail-tips',
    eyebrow: 'Trail',
    title: 'Trail running tips for beginners',
    readTime: '5 min. read',
    image:
      'https://www.brooksrunning.com/dw/image/v2/BGPF_PRD/on/demandware.static/-/Sites-brooks-master-catalog/default/dwaacb7c84/original/120446/120446-812-l-cascadia-19-womens-mountain-trail-trail-running-shoe.jpg',
    shopCategory: 'featured-trail-running-collection',
    shopLabel: 'Shop trail',
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

/** The four ways Brooks segments its catalog on the home screen. */
export const USE_CASES = [
  { id: 'featured-best-sellers', label: 'Run', caption: 'Road & daily miles' },
  { id: 'featured-trail-running-collection', label: 'Trail', caption: 'Off-road grip' },
  { id: 'featured-shoes-in-widths', label: 'Walk', caption: 'All-day comfort' },
  { id: 'featured-new-arrivals', label: 'New', caption: 'Just landed' },
] as const;

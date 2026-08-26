export const motion = {
  /**
   * Press-down feedback: the primary button's face drops onto its offset
   * shadow. Well under a frame-perceptible "animation" — it should read as the
   * button being pushed, not as motion.
   */
  press: 70,
  fast: 160,
  base: 260,
  slow: 420,
  /** The site's own hero entrance: fade + 40px rise, staggered ~80ms. */
  heroRise: 40,
  heroStagger: 80,
} as const;

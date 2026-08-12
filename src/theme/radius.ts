/**
 * Square by default. `pill` exists only for dots, badges, and quantity steppers,
 * which the site does render as circles.
 *
 * @ref LLP 0003#brand — Brooks aggressively zeroes border-radius sitewide;
 * square corners are a brand trait, and rounding them is the fastest way to
 * make this look like a generic commerce template.
 *
 * No `borderCurve: "continuous"` pairing is needed anywhere today: `sm` is
 * currently unused and `pill` is a capsule.
 */
export const radius = {
  none: 0,
  sm: 2,
  pill: 999,
} as const;

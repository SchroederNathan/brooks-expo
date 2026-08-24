/**
 * Softly rounded.
 *
 * The app previously zeroed border-radius everywhere, because square corners
 * were a deliberate trait of the brand it was imitating. With that brand gone
 * the trait goes too — copying a distinctive UI treatment is part of what
 * Apple's 4.1 guidance covers, and matching corners for no reason is the kind
 * of detail that makes two apps look like one.
 */
export const radius = {
  none: 0,
  sm: 4,
  md: 10,
  pill: 999,
} as const;

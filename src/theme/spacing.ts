export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  /**
   * Screen edge padding. 20 is off the 4-point grid's named steps but is the
   * site's own gutter; it is a named step here (and on the audit whitelist)
   * rather than a scattered literal.
   */
  gutter: 20,
} as const;

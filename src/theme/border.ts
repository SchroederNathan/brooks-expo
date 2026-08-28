/**
 * Border widths. Three steps, and every border in the app uses one of them.
 *
 * @ref LLP 0003#border-widths — The PDP size/width grid is the app's
 * reference outlined control, because it is the one treatment read straight off
 * a Brooks mobile capture rather than invented here: a 1pt neutral rule at
 * rest that strengthens to a 2pt ink outline on selection, with the fill left
 * white. Every other outlined control now wears that same pair, so "this one is
 * chosen" reads identically on a size, a filter button, a finder answer, and a
 * quantity stepper. Before this, resting rules were 1.5pt `hairline` in five
 * places and 1pt `controlBorder` on the PDP, and selection variously changed
 * the color, the width, both, or neither.
 *
 * Pair a width with a color from `colors`:
 *
 * | width      | color                | role                                  |
 * |------------|----------------------|---------------------------------------|
 * | `rule`     | `colors.controlBorder` | outlined control at rest            |
 * | `emphasis` | `colors.ink`         | the same control selected or active   |
 * | `emphasis` | `colors.sale`        | a control in error                    |
 * | `rule`     | `colors.hairline`    | dividers, ruled rows, card outlines   |
 * | `heavy`    | `colors.ink`         | the outlined button and the sheet cap |
 *
 * A selected control gains 1pt of rule, so its content shifts inward by 1pt.
 * That is the storefront's behaviour and it is what makes the selection feel
 * physical; do not compensate for it with padding.
 */
export const border = {
  /** The site's own default rule. Its `:root` border is 1px. */
  rule: 1,
  /** Selection, active filters, error. Doubling the rule is the whole signal. */
  emphasis: 2,
  /**
   * Reserved for the two places a border is a graphic element rather than an
   * edge: the outlined button's frame and the filter sheet's ink cap.
   */
  heavy: 3,
} as const;

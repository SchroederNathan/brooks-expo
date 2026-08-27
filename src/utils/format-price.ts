/**
 * @ref LLP 0002#cart-addproduct — Brooks's own storefront payloads format money with
 * cents throughout (`"$200.00"`), and the catalog tile prints `$180.00`, so the
 * app keeps the trailing zeros rather than trimming them.
 */
export function fmt(v: number | null | undefined): string {
  if (v == null) return '';
  return `$${v.toFixed(2)}`;
}

export function fmt(v: number | null | undefined): string {
  if (v == null) return '';
  return `$${v.toFixed(2).replace(/\.00$/, '')}`;
}

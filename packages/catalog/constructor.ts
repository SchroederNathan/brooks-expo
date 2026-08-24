/**
 * On-device search over the bundled catalog.
 *
 * This module used to be a live client for a real retailer's search index,
 * hitting it with the public key from their web bundle. That was the one
 * genuinely live commerce surface in the app, and it had to go: the demo cannot
 * query another company's product index, and a synthetic catalog would not be
 * in that index anyway.
 *
 * The exported shape is unchanged — `search`, `autocomplete`, `SearchHit`,
 * `Suggestions`, `setInstallId` — so the search screen kept its structure,
 * including its "index unreachable" fallback. Nothing here is async by
 * necessity; the promises are kept so callers still handle it as a query that
 * can be cancelled.
 */

import type { Catalog, Product } from './types';

export interface SearchHit {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  gender?: string;
  cushion?: string;
}

export interface Suggestions {
  terms: string[];
  products: SearchHit[];
}

/**
 * Retained for call-site compatibility. There is no longer a vendor that wants
 * an install id, so the value is accepted and dropped.
 */
export function setInstallId(_id: string) {
  // no-op: nothing leaves the device
}

/**
 * The catalog the local index searches. Injected rather than imported so this
 * file stays free of a bundler-specific JSON import and remains usable from
 * plain Node in `tools/`.
 */
let index: Catalog | null = null;

export function setSearchCatalog(catalog: Catalog) {
  index = catalog;
}

function toHit(p: Product): SearchHit {
  return {
    id: String(p.id),
    name: p.name,
    imageUrl: p.colors?.[0]?.images?.[0]?.url ?? '',
    description: p.description,
    gender: p.gender ?? undefined,
    cushion: p.cushion ?? undefined,
  };
}

/** Tokens a product can be matched on, lowercased once per call. */
function haystack(p: Product): string {
  return [p.name, p.franchise, p.gender, p.productType, p.cushion, ...(p.bestFor ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Rank a product against the query. Prefix matches on the name outrank
 * mid-string ones so typing "hal" surfaces Halcyon above anything that merely
 * mentions it, which is the behaviour the live index had.
 */
function score(p: Product, terms: string[]): number {
  const name = p.name.toLowerCase();
  const hay = haystack(p);
  let total = 0;
  for (const t of terms) {
    if (name.startsWith(t)) total += 6;
    else if (name.includes(t)) total += 4;
    else if (hay.includes(t)) total += 1;
    else return 0; // every term must match somewhere
  }
  return total;
}

function rank(query: string, limit: number): Product[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!index || !terms.length) return [];
  return index.products
    .map((p) => ({ p, s: score(p, terms) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
    .slice(0, limit)
    .map((r) => r.p);
}

/** Free-text product search over the bundled catalog. */
export async function search(
  query: string,
  opts: { limit?: number; signal?: AbortSignal } = {},
): Promise<SearchHit[]> {
  if (opts.signal?.aborted) throw new Error('aborted');
  if (!index) throw new Error('Search catalog not set');
  return rank(query, opts.limit ?? 24).map(toHit);
}

/**
 * Type-ahead. The suggested terms are the distinct product families among the
 * matches, which is the closest honest analogue to the vendor's query
 * suggestions without inventing searches nobody made.
 */
export async function autocomplete(
  query: string,
  opts: { signal?: AbortSignal } = {},
): Promise<Suggestions> {
  if (opts.signal?.aborted) throw new Error('aborted');
  if (!index) throw new Error('Search catalog not set');
  const matches = rank(query, 24);
  const terms: string[] = [];
  for (const p of matches) {
    if (p.franchise && !terms.includes(p.franchise)) terms.push(p.franchise);
    if (terms.length === 6) break;
  }
  return { terms, products: matches.slice(0, 6).map(toHit) };
}

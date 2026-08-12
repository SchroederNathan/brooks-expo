/**
 * Live client for Brooks's Constructor.io search API.
 *
 * @ref LLP 0002#constructor-io — This is the one Brooks commerce API a mobile
 * client can actually reach. brooksrunning.com is behind Akamai Bot Manager and
 * 403s every non-browser client; `ac.cnstrc.com` is not, so search stays live
 * while the rest of the catalog is served from the harvested snapshot.
 *
 * The key below is the public, client-side key Brooks ships in its own web
 * bundle — the same one the website's search box uses. It grants read-only
 * search access and nothing else.
 */

const KEY = 'key_pCFzYTxeXssfLwfW';
const CLIENT = 'ciojs-2.1439.2';
const BASE = 'https://ac.cnstrc.com';

/** Stable per-install id. Constructor requires one; it is not tied to a person. */
const SESSION_ID = 1;
let installId = 'brooks-app-00000000-0000-4000-8000-000000000000';

export function setInstallId(id: string) {
  installId = id;
}

function url(path: string, params: Record<string, string | number> = {}) {
  const q = new URLSearchParams({
    c: CLIENT,
    key: KEY,
    i: installId,
    s: String(SESSION_ID),
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });
  return `${BASE}${path}?${q.toString()}`;
}

export interface SearchHit {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
  gender?: string;
  cushion?: string;
}

function toHit(r: any): SearchHit | null {
  const d = r && r.data;
  if (!d || !d.id) return null;
  return {
    id: String(d.id),
    name: d.name,
    imageUrl: String(d.image_url || '').split('?')[0],
    description: d.description,
    gender: d.gender && d.gender.value,
    cushion: d.spec_FeelUnderFootTitle,
  };
}

/** Free-text product search against the live Brooks index. */
export async function search(
  query: string,
  opts: { limit?: number; signal?: AbortSignal } = {}
): Promise<SearchHit[]> {
  const res = await fetch(
    url(`/search/${encodeURIComponent(query)}`, {
      num_results_per_page: opts.limit ?? 24,
      page: 1,
    }),
    { signal: opts.signal }
  );
  if (!res.ok) throw new Error(`Constructor search failed: ${res.status}`);
  const json = await res.json();
  const results = json?.response?.results ?? [];
  return results.map(toHit).filter(Boolean) as SearchHit[];
}

export interface Suggestions {
  terms: string[];
  products: SearchHit[];
}

/** Type-ahead: Brooks returns both suggested query terms and matching products. */
export async function autocomplete(
  query: string,
  opts: { signal?: AbortSignal } = {}
): Promise<Suggestions> {
  const res = await fetch(url(`/autocomplete/${encodeURIComponent(query)}`), {
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`Constructor autocomplete failed: ${res.status}`);
  const json = await res.json();
  const sections = json?.sections ?? {};
  return {
    terms: (sections['Search Suggestions'] ?? []).map((s: any) => s.value).slice(0, 6),
    products: (sections['Products'] ?? []).map(toHit).filter(Boolean).slice(0, 6) as SearchHit[],
  };
}

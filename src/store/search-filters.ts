import { useSyncExternalStore } from 'react';

import { EMPTY_SEARCH_FILTERS, type SearchFilters, type SearchSort } from '@/data/search-query';
import type { Product } from '@/data/types';

/**
 * Applied search filters and sort, shared between the Browse screen that
 * shows results and the form sheet that edits them.
 *
 * A store rather than route params because the sheet is a separate route: the
 * native form sheet is presented by the root stack, so it cannot be a child of
 * Browse and cannot take a callback prop. The sheet writes here on Apply;
 * Browse re-derives its results from the same value.
 */

type State = {
  sort: SearchSort;
  filters: SearchFilters;
  /** The unfiltered, snapshot-joined products of the current search — what the sheet counts. */
  candidates: Product[];
};

let state: State = { sort: 'recommended', filters: EMPTY_SEARCH_FILTERS, candidates: [] };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function getSearchFilterState(): State {
  return state;
}

export function patchSearchFilterState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

export function clearSearchFilterState() {
  patchSearchFilterState({ sort: 'recommended', filters: EMPTY_SEARCH_FILTERS });
}

export function useSearchFilterState(): State {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getSearchFilterState,
    getSearchFilterState
  );
}

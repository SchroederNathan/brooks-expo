/**
 * Run Club membership, local to the prototype.
 *
 * @ref LLP 0002 — No Brooks auth endpoint is reachable from an app (Akamai), so
 * "signing in" stores a name on the device and nothing more. The screens treat
 * membership as Run Club joining (LLP 0003#login): a perk, never a gate.
 */
import { useSyncExternalStore } from 'react';

import { storage } from '../utils/kv-storage';

const STORAGE_KEY = 'brooks.member.v1';

export interface Member {
  firstName: string;
  email: string;
  joinedAt: number;
}

// Storage is synchronous, so a returning member is known before first render.
// A missing member is a guest, which is always a fine state to be in.
let current: Member | null = storage.get<Member | null>(STORAGE_KEY, null);
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function join(member: Omit<Member, 'joinedAt'>) {
  current = { ...member, joinedAt: Date.now() };
  storage.set(STORAGE_KEY, current);
  emit();
}

export function leave() {
  current = null;
  storage.remove(STORAGE_KEY);
  emit();
}

export function useMember(): Member | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => current,
    () => current
  );
}

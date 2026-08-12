/**
 * Run Club membership, local to the prototype.
 *
 * @ref LLP 0002 — No Brooks auth endpoint is reachable from an app (Akamai), so
 * "signing in" stores a name on the device and nothing more. The screens treat
 * membership as Run Club joining (LLP 0003#login): a perk, never a gate.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'brooks.member.v1';

export interface Member {
  firstName: string;
  email: string;
  joinedAt: number;
}

let current: Member | null = null;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

async function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      current = JSON.parse(raw);
      emit();
    }
  } catch {
    // A missing member is a guest, which is always a fine state to be in.
  }
}

export function join(member: Omit<Member, 'joinedAt'>) {
  current = { ...member, joinedAt: Date.now() };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current)).catch(() => {});
  emit();
}

export function leave() {
  current = null;
  AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  emit();
}

export function useMember(): Member | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      hydrate();
      return () => listeners.delete(cb);
    },
    () => current,
    () => current
  );
}

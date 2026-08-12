/**
 * Synchronous key-value storage over expo-sqlite's localStorage polyfill,
 * following the expo-native-ui storage pattern (never AsyncStorage).
 *
 * Synchronous reads mean stores hydrate at first render — no `hydrated` flag,
 * no blank first frame. The .web.ts sibling serves the browser's own
 * localStorage so web never loads the sqlite wasm.
 */
import 'expo-sqlite/localStorage/install';

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const value = localStorage.getItem(key);
    if (value == null) return defaultValue;
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
    listeners.get(key)?.forEach((fn) => fn());
  },

  remove(key: string): void {
    localStorage.removeItem(key);
    listeners.get(key)?.forEach((fn) => fn());
  },

  subscribe(key: string, listener: Listener): () => void {
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(listener);
    return () => {
      listeners.get(key)?.delete(listener);
    };
  },
};

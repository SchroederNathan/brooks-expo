/**
 * Web fork of kv-storage: the browser's own localStorage, same API.
 * Keeps the expo-sqlite wasm bundle out of the web build entirely.
 */
type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    const value = window.localStorage.getItem(key);
    if (value == null) return defaultValue;
    try {
      return JSON.parse(value) as T;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
    listeners.get(key)?.forEach((fn) => fn());
  },

  remove(key: string): void {
    window.localStorage.removeItem(key);
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

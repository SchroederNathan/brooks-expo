/**
 * Synchronous JSON storage in the App Group's shared container, which the App
 * Clip and the full app can both read.
 *
 * @ref LLP 0007#the-bag-lives-in-the-app-group — One small JSON file per key
 * rather than SQLite: iOS can end a process that is suspended while it holds a
 * SQLite lock in a shared container, and a plain write holds none.
 *
 * Where there is no shared container — Android, Expo Go, a build without the
 * App Group — this is the app's own `storage`, so callers need no platform
 * check. The .web.ts sibling is always `storage`.
 */
import { File, Paths } from 'expo-file-system';

import { appGroup } from '../../brand.config';
import { storage } from './kv-storage';

type Storage = Pick<typeof storage, 'get' | 'set' | 'remove'>;

const container = Paths.appleSharedContainers[appGroup];

export const sharedStorage: Storage = container
  ? {
      get<T>(key: string, defaultValue: T): T {
        const file = new File(container, `${key}.json`);
        if (!file.exists) return defaultValue;
        try {
          return JSON.parse(file.textSync()) as T;
        } catch {
          return defaultValue;
        }
      },

      set<T>(key: string, value: T): void {
        new File(container, `${key}.json`).write(JSON.stringify(value));
      },

      remove(key: string): void {
        const file = new File(container, `${key}.json`);
        if (file.exists) file.delete();
      },
    }
  : storage;

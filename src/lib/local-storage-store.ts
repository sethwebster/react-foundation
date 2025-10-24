type Serializer<T> = (value: T) => string | null;
type Deserializer<T> = (rawValue: string | null, fallback: T) => T;

interface LocalStorageStoreOptions<T> {
  key: string;
  fallback: T;
  read: Deserializer<T>;
  write: Serializer<T>;
}

interface LocalStorageStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  set: (value: T) => void;
}

/**
 * Tiny helper to treat localStorage entries as external stores so we can
 * consume them with useSyncExternalStore without setState effects.
 */
export function createLocalStorageStore<T>({
  key,
  fallback,
  read,
  write,
}: LocalStorageStoreOptions<T>): LocalStorageStore<T> {
  let currentValue: T = fallback;
  const listeners = new Set<() => void>();

  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return currentValue;
    }

    try {
      currentValue = read(window.localStorage.getItem(key), fallback);
      return currentValue;
    } catch {
      currentValue = fallback;
      return currentValue;
    }
  };

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);

    if (typeof window !== 'undefined') {
      const handleStorage = (event: StorageEvent) => {
        if (event.key === key) {
          readValue();
          notify();
        }
      };

      window.addEventListener('storage', handleStorage);

      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', handleStorage);
      };
    }

    return () => {
      listeners.delete(listener);
    };
  };

  const set = (value: T) => {
    currentValue = value;

    if (typeof window !== 'undefined') {
      try {
        const serialized = write(value);
        if (serialized === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, serialized);
        }
      } catch {
        // Ignore write failures (Safari private mode, etc.)
      }
    }

    notify();
  };

  return {
    subscribe,
    getSnapshot: () => readValue(),
    getServerSnapshot: () => currentValue,
    set,
  };
}

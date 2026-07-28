/* A subscribe/notify store. Small on purpose — the UI is full-redraw. */

export interface Store<T> {
  get(): T;
  set(next: T | ((current: T) => T)): void;
  subscribe(listener: (state: T) => void): () => void;
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial;
  const listeners = new Set<(state: T) => void>();
  let notifying = false;

  return {
    get: () => state,
    set(next) {
      const value = typeof next === "function" ? (next as (c: T) => T)(state) : next;
      if (value === state) return;
      state = value;
      if (notifying) return;
      notifying = true;
      try {
        for (const listener of [...listeners]) listener(state);
      } finally {
        notifying = false;
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

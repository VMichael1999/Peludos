import { signal } from '@angular/core';

export type LoadStatus = 'loading' | 'ready' | 'empty' | 'error';

/**
 * Turns an async load into the four states every screen with data must design: loading, ready,
 * empty and error. `reload()` is what the "Reintentar" button calls.
 */
export function loadable<T>(load: () => Promise<T>, isEmpty: (value: T) => boolean = defaultIsEmpty) {
  const status = signal<LoadStatus>('loading');
  const data = signal<T | null>(null);

  const reload = async (): Promise<void> => {
    status.set('loading');
    try {
      const value = await load();
      data.set(value);
      status.set(isEmpty(value) ? 'empty' : 'ready');
    } catch {
      status.set('error');
    }
  };

  void reload();
  return { status: status.asReadonly(), data, reload, set: (value: T) => data.set(value) };
}

const defaultIsEmpty = (value: unknown): boolean => Array.isArray(value) && value.length === 0;

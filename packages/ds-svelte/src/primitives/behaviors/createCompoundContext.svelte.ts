import { getContext, setContext } from 'svelte';

export function createCompoundContext<T>(key: string): {
  provide(value: T): void;
  consume(): T;
} {
  function provide(value: T) {
    setContext(key, value);
  }

  function consume(): T {
    const ctx = getContext<T | undefined>(key);
    if (ctx === undefined)
      throw new Error(`Context "${key}" not found — missing provider`);
    return ctx;
  }

  return { provide, consume };
}

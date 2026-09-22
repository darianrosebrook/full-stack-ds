// State of the "Cat Productivity Suite" site. The desk page owns one instance
// and exposes it on `window.catSite`; each device iframe (same origin) reads
// that instance, so the laptop, tablet and phone render the same live state.

export interface SiteState {
  draft: string;
  treatsOrdered: number;
  sentToEditor: number;
  deleted: number;
}

export const initialSiteState: SiteState = { draft: "", treatsOrdered: 0, sentToEditor: 0, deleted: 0 };

export interface SiteStore {
  get(): SiteState;
  set(patch: Partial<SiteState>): void;
  subscribe(listener: () => void): () => void;
}

export function createSiteStore(initial: SiteState = initialSiteState): SiteStore {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set(patch) {
      state = { ...state, ...patch };
      for (const listener of listeners) listener();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

declare global {
  interface Window {
    catSite?: { store: SiteStore };
  }
}

/** The desk's shared store when framed by it; a private one when opened alone. */
export function resolveSiteStore(): SiteStore {
  try {
    const shared = window.parent !== window ? window.parent.catSite?.store : undefined;
    if (shared) return shared;
  } catch {
    // Cross-origin parent: fall through to a private store.
  }
  return createSiteStore();
}

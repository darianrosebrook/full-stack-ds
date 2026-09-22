// State of the "Cat Productivity Suite" site. The desk page owns one instance
// and exposes it on `window.catSite`; each device iframe (same origin) reads
// that instance, so the laptop, tablet and phone render the same live state.
// Which page a device shows is not here: each device browses on its own.

export type SiteEventKind = "sent" | "ordered" | "deleted" | "signout";

/** Something that happened, shown as a toast on every device. */
export interface SiteEvent {
  id: number;
  kind: SiteEventKind;
  title: string;
  message: string;
  at: number;
}

export interface SiteState {
  draft: string;
  treatsOrdered: number;
  /** Orders per product id. */
  treatOrders: Record<string, number>;
  sentToEditor: number;
  deleted: number;
  napping: boolean;
  /** The latest event; a new id means a new toast. */
  event: SiteEvent | null;
  /** Most recent first, capped. */
  activity: SiteEvent[];
}

export const initialSiteState: SiteState = {
  draft: "",
  treatsOrdered: 0,
  treatOrders: {},
  sentToEditor: 0,
  deleted: 0,
  napping: false,
  event: null,
  activity: [],
};

const ACTIVITY_LIMIT = 8;

export interface SiteStore {
  get(): SiteState;
  set(patch: Partial<SiteState>): void;
  /** Apply a patch and publish an event with it, in one update. */
  emit(kind: SiteEventKind, title: string, message: string, patch?: Partial<SiteState>): void;
  subscribe(listener: () => void): () => void;
}

export function createSiteStore(initial: SiteState = initialSiteState): SiteStore {
  let state = initial;
  const listeners = new Set<() => void>();
  const set = (patch: Partial<SiteState>) => {
    state = { ...state, ...patch };
    for (const listener of listeners) listener();
  };
  return {
    get: () => state,
    set,
    emit(kind, title, message, patch = {}) {
      const event: SiteEvent = { id: (state.event?.id ?? 0) + 1, kind, title, message, at: Date.now() };
      set({ ...patch, event, activity: [event, ...state.activity].slice(0, ACTIVITY_LIMIT) });
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

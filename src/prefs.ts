/**
 * Showcase preferences (SHOWCASE-CHROME-T2-01).
 *
 * Small localStorage-backed store with subscription, so Settings edits take
 * effect app-wide (App/Header/DeveloperView re-render) without prop-drilling
 * a context. Keys are namespaced under `fsds-prefs`.
 */
import { useSyncExternalStore } from "react";

export interface ShowcasePrefs {
  /** Default Developer-tab framework. */
  defaultFramework: string;
  /** Whether the trace panel is shown on component routes. */
  tracePanelVisible: boolean;
  /** Default for the Developer tab's interactive-preview checkbox. */
  interactivePreview: boolean;
  /** Nav groups surfaced in the sidebar/palette (fed by the Shuttle in Settings). */
  visibleNavGroups: string[];
}

const STORAGE_KEY = "fsds-prefs";

export const NAV_GROUPS = ["overview", "architecture", "tokens", "standards", "foundations", "primitives", "compounds", "composers", "assemblies"] as const;

export const DEFAULT_PREFS: ShowcasePrefs = {
  defaultFramework: "react",
  tracePanelVisible: true,
  interactivePreview: true,
  visibleNavGroups: [...NAV_GROUPS],
};

function read(): ShowcasePrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<ShowcasePrefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

let current: ShowcasePrefs = read();
const listeners = new Set<() => void>();

export function getPrefs(): ShowcasePrefs {
  return current;
}

export function setPrefs(patch: Partial<ShowcasePrefs>): void {
  current = { ...current, ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // storage unavailable (private mode etc.) — session-only prefs
  }
  for (const notify of listeners) notify();
}

/** Reset to defaults — the destructive action Settings gates behind OTP. */
export function resetPrefs(): void {
  current = DEFAULT_PREFS;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  for (const notify of listeners) notify();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function usePrefs(): ShowcasePrefs {
  return useSyncExternalStore(subscribe, getPrefs, getPrefs);
}

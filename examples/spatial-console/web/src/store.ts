// Framework-neutral scene state. Every panel (React, Vue, Lit) and the 3D
// scene read and write through this one store; no panel imports another panel
// or the scene. That keeps each framework lane a realization of the same
// semantics instead of a private channel.

export type ColorTemp = "warm" | "cool" | "signal";
export type Shape = "torus" | "box" | "icosahedron";
export type Speed = "slow" | "medium" | "fast";

export interface SceneState {
  lampOn: boolean;
  colorTemp: ColorTemp;
  /** Monotonic counter; each increment fires one light pulse in the scene. */
  pulse: number;
  shape: Shape;
  autoRotate: boolean;
  speed: Speed;
  /** Object rotation in radians, written by the scene's animation tick. */
  rotation: number;
  /** Name of the scene object last picked by raycast, if any. */
  selected: string | null;
  fps: number;
}

export const initialState: SceneState = {
  lampOn: true,
  colorTemp: "warm",
  pulse: 0,
  shape: "torus",
  autoRotate: true,
  speed: "medium",
  rotation: 0,
  selected: null,
  fps: 0,
};

export type Listener = (state: SceneState) => void;

export interface Store {
  get(): SceneState;
  set(patch: Partial<SceneState>): void;
  subscribe(listener: Listener): () => void;
}

export function createStore(initial: SceneState = initialState): Store {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set(patch) {
      const next = { ...state, ...patch };
      const changed = (Object.keys(patch) as (keyof SceneState)[]).some(
        (key) => !Object.is(state[key], next[key]),
      );
      if (!changed) return;
      state = next;
      for (const listener of listeners) listener(state);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const SPEED_RAD_PER_SEC: Record<Speed, number> = {
  slow: 0.25,
  medium: 0.8,
  fast: 2.2,
};

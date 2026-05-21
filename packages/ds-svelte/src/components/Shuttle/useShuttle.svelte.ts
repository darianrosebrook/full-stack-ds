// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseShuttleOptions {
  value?: () => string[] | undefined;
  defaultValue?: () => string[] | undefined;
  onValueChange?: () => ((value: string[]) => void) | undefined;
}

export interface UseShuttleResult {
  readonly selection: string[];
  setSelection(next: string[]): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useShuttle(opts: UseShuttleOptions = {}): UseShuttleResult {
  const selectionState = createControllableState<string[]>({
    controlled: opts.value,
    defaultValue: opts.defaultValue?.() ?? undefined as never,
    onChange: (v) => opts.onValueChange?.()?.(v),
  });

  return {
    get selection() { return selectionState.value; },
    setSelection(v) { selectionState.set(v); },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

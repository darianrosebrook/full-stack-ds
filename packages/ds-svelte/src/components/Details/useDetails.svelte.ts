// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseDetailsOptions {
  open?: () => boolean | undefined;
  defaultOpen?: () => boolean | undefined;
  onOpenChange?: () => ((value: boolean) => void) | undefined;
}

export interface UseDetailsResult {
  readonly open: boolean;
  setOpen(next: boolean): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useDetails(opts: UseDetailsOptions = {}): UseDetailsResult {
  const openState = createControllableState<boolean>({
    controlled: opts.open,
    defaultValue: opts.defaultOpen?.() ?? false,
    onChange: (v) => opts.onOpenChange?.()?.(v),
  });

  return {
    get open() { return openState.value; },
    setOpen(v) { openState.set(v); },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

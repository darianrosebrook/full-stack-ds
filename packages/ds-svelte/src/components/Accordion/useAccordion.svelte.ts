// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseAccordionOptions {
  value?: () => string | string[] | undefined;
  defaultValue?: () => string | string[] | undefined;
  onValueChange?: () => ((value: string | string[]) => void) | undefined;
}

export interface UseAccordionResult {
  readonly openness: string | string[];
  setOpenness(next: string | string[]): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useAccordion(opts: UseAccordionOptions = {}): UseAccordionResult {
  const opennessState = createControllableState<string | string[]>({
    controlled: opts.value,
    defaultValue: opts.defaultValue?.() ?? undefined as never,
    onChange: (v) => opts.onValueChange?.()?.(v),
  });

  return {
    get openness() { return opennessState.value; },
    setOpenness(v) { opennessState.set(v); },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

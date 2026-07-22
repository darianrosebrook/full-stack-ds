// @generated:start imports
import { createCompoundContext, createControllableState } from "../../primitives/index.js";
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

export interface AccordionContextValue {
  readonly openness: string | string[];
  toggleItem: (value: string) => void;
  isItemOpen: (value: string) => boolean;
  type: "single" | "multiple";
  collapsible: boolean;
  disabled: boolean;
  idBase: string;
}

const _accordionContext = createCompoundContext<AccordionContextValue>("Accordion");

export function provideAccordionContext(value: AccordionContextValue): void {
  _accordionContext.provide(value);
}

export function useAccordionContext(): AccordionContextValue {
  return _accordionContext.consume();
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

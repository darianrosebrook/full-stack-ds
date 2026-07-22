// @generated:start imports
import { type Ref } from "vue";
import { createCompoundContext, useControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseAccordionOptions {
  value?: () => string | string[] | undefined;
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

export interface UseAccordionResult {
  openness: Ref<string | string[]>;
  setOpenness: (next: string | string[]) => void;
}

export interface AccordionContextValue {
  openness: Ref<string | string[]>;
  toggleItem: (value: string) => void;
  isItemOpen: (value: string) => boolean;
  type: "single" | "multiple";
  collapsible: boolean;
  disabled: boolean;
  idBase: string;
}

export const [provideAccordionContext, useAccordionContext] =
  createCompoundContext<AccordionContextValue>("Accordion");
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useAccordion(options: UseAccordionOptions = {}): UseAccordionResult {
  const { value: openness, set: setOpenness } = useControllableState<string | string[]>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? undefined as never,
    onChange: options.onValueChange,
  });

  return {
    openness,
    setOpenness,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

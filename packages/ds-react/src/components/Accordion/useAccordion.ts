// @generated:start imports
import { useControllableState } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseAccordionOptions {
  /** Controlled "openness" value. */
  value?: string | string[];
  /** Initial uncontrolled "openness" value. */
  defaultValue?: string | string[];
  /** Called when "openness" changes. */
  onValueChange?: (value: string | string[]) => void;
}

export interface UseAccordionResult {
  openness: string | string[];
  setOpenness: (next: string | string[]) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useAccordion(options: UseAccordionOptions = {}): UseAccordionResult {
  const [openness, setOpenness] = useControllableState<string | string[]>({
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

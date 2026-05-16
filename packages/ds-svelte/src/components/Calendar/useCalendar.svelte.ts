// @generated:start imports
import { createControllableState } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseCalendarOptions {
  value?: () => Date | Date[] | null | undefined;
  defaultValue?: () => Date | Date[] | null | undefined;
  onChange?: () => ((value: Date | Date[] | null) => void) | undefined;
}

export interface UseCalendarResult {
  readonly value: Date | Date[] | null;
  setValue(next: Date | Date[] | null): void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useCalendar(opts: UseCalendarOptions = {}): UseCalendarResult {
  const valueState = createControllableState<Date | Date[] | null>({
    controlled: opts.value,
    defaultValue: opts.defaultValue?.() ?? undefined as never,
    onChange: (v) => opts.onChange?.()?.(v),
  });

  return {
    get value() { return valueState.value; },
    setValue(v) { valueState.set(v); },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

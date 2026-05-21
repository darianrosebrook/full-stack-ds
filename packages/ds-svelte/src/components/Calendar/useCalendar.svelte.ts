// @generated:start imports
import { createControllableState, createDismissal, createPortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseCalendarOptions {
  value?: () => Date | Date[] | null | undefined;
  defaultValue?: () => Date | Date[] | null | undefined;
  onChange?: () => ((value: Date | Date[] | null) => void) | undefined;
  shouldCloseOnSelect?: () => boolean | undefined;
  portalId?: Element | string;
}

export interface UseCalendarResult {
  readonly value: Date | Date[] | null;
  setValue(next: Date | Date[] | null): void;
  panelRef: { el: HTMLElement | null };
  readonly portalTarget: Element | null;
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

  const panelRef = { el: null as HTMLElement | null };
  const portal = createPortal({
    enabled: true,
    target: () => opts.portalId,
  });

  createDismissal({
    open: () => true,
    closeOnEscape: () => true,
    onDismiss: () => { void 0; },
  });

  return {
    get value() { return valueState.value; },
    setValue(v) { valueState.set(v); },
    panelRef,
    get portalTarget() { return portal.target; },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

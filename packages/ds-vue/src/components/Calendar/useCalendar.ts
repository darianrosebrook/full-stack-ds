// @generated:start imports
import { ref, type Ref } from "vue";
import { useControllableState, useDismissal, usePortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseCalendarOptions {
  value?: () => Date | Date[] | null | undefined;
  defaultValue?: Date | Date[] | null;
  onChange?: (value: Date | Date[] | null) => void;
  shouldCloseOnSelect?: boolean;
  portalId?: Element | string;
}

export interface UseCalendarResult {
  value: Ref<Date | Date[] | null>;
  setValue: (next: Date | Date[] | null) => void;
  panelRef: Ref<HTMLElement | null>;
  portalTarget: Ref<Element | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useCalendar(options: UseCalendarOptions = {}): UseCalendarResult {
  const { value: value, set: setValue } = useControllableState<Date | Date[] | null>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? undefined as never,
    onChange: options.onChange,
  });

  const panelRef = ref<HTMLElement | null>(null);
  const { target: portalTarget } = usePortal({
    enabled: true,
    target: () => options.portalId,
  });

  useDismissal({
    open: () => true,
    closeOnEscape: () => true,
    onDismiss: () => void 0,
  });

  return {
    value,
    setValue,
    panelRef,
    portalTarget,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

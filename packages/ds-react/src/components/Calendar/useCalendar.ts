// @generated:start imports
import { type ReactNode, type RefObject, useRef } from "react";
import { useControllableState, useDismissal, usePortal } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseCalendarOptions {
  /** Controlled "value" value. */
  value?: Date | Date[] | null;
  /** Initial uncontrolled "value" value. */
  defaultValue?: Date | Date[] | null;
  /** Called when "value" changes. */
  onChange?: (value: Date | Date[] | null) => void;
  /** Selecting a date closes the popup (controlled by shouldCloseOnSelect). */
  shouldCloseOnSelect?: boolean;
  /** DOM element or selector for the portal mount point. */
  portalId?: Element | string;
}

export interface UseCalendarResult {
  value: Date | Date[] | null;
  setValue: (next: Date | Date[] | null) => void;
  panelRef: RefObject<HTMLDivElement | null>;
  renderInPortal: (node: ReactNode) => ReactNode;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useCalendar(options: UseCalendarOptions = {}): UseCalendarResult {
  const [value, setValue] = useControllableState<Date | Date[] | null>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? undefined as never,
    onChange: options.onChange,
  });

  const panelRef = useRef<HTMLDivElement>(null);
  const portal = usePortal({
    enabled: true,
    target: options.portalId,
  });

  return {
    value,
    setValue,
    panelRef,
    renderInPortal: portal.render,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

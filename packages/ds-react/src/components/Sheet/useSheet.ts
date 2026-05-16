// @generated:start imports
import { type ReactNode, type RefObject, useRef } from "react";
import { useControllableState, useDismissal, useFocusTrap, usePortal, useScrollLock } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseSheetOptions {
  /** Controlled "openness" value. */
  open?: boolean;
  /** Initial uncontrolled "openness" value. */
  defaultOpen?: boolean;
  /** Called when "openness" changes. */
  onOpenChange?: (value: boolean) => void;
}

export interface UseSheetResult {
  openness: boolean;
  setOpenness: (next: boolean) => void;
  panelRef: RefObject<HTMLDivElement | null>;
  renderInPortal: (node: ReactNode) => ReactNode;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useSheet(options: UseSheetOptions = {}): UseSheetResult {
  const [openness, setOpenness] = useControllableState<boolean>({
    controlled: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });

  const panelRef = useRef<HTMLDivElement>(null);
  useDismissal({
    open: openness,
    onDismiss: () => setOpenness(false),
  });

  useFocusTrap(panelRef, {
    active: openness,
  });

  useScrollLock(openness);

  const portal = usePortal({
    enabled: true,
  });

  return {
    openness,
    setOpenness,
    panelRef,
    renderInPortal: portal.render,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

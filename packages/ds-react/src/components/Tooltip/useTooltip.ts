// @generated:start imports
import { type ReactNode, type RefObject, useRef } from "react";
import { useAnchorToggle, useControllableState, usePortal } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTooltipOptions {
  /** Controlled "open" value. */
  open?: boolean;
  /** Initial uncontrolled "open" value. */
  defaultOpen?: boolean;
  /** Called when "open" changes. */
  onOpenChange?: (value: boolean) => void;
  /** Whether "escape" dismissal is enabled. */
  closeOnEscape?: boolean;
  /** Whether "blur" dismissal is enabled. */
  closeOnBlur?: boolean;
}

export interface UseTooltipResult {
  open: boolean;
  setOpen: (next: boolean) => void;
  panelRef: RefObject<HTMLDivElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
  renderInPortal: (node: ReactNode) => ReactNode;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipResult {
  const panelRef = useRef<HTMLDivElement>(null);
  // anchor + panel refs come from useAnchorToggle below.
  const anchorToggle = useAnchorToggle({
    open: options.open,
    defaultOpen: options.defaultOpen ?? false,
    onOpenChange: options.onOpenChange,
    closeOnEscape: options.closeOnEscape !== false,
  });

  const portal = usePortal({
    enabled: true,
  });

  return {
    open: anchorToggle.open,
    setOpen: anchorToggle.setOpen,
    anchorRef: anchorToggle.anchorRef,
    panelRef: anchorToggle.panelRef as RefObject<HTMLDivElement | null>,
    renderInPortal: portal.render,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

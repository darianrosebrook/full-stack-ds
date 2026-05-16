// @generated:start imports
import { DestroyRef, type Signal } from "@angular/core";
import { createAnchorToggle, createControllableState, createPortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UsePopoverOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  destroyRef: DestroyRef;
}

export interface UsePopoverResult {
  open: Signal<boolean>;
  setOpen: (next: boolean) => void;
  panelRef: { nativeElement: HTMLElement | null };
  anchorRef: { nativeElement: HTMLElement | null };
  portalTarget: Signal<Element | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function usePopover(options: UsePopoverOptions): UsePopoverResult {
  const panelRef: { nativeElement: HTMLElement | null } = { nativeElement: null };
  const anchorToggle = createAnchorToggle({
    open: options.open,
    defaultOpen: options.defaultOpen ?? false,
    onOpenChange: options.onOpenChange,
    destroyRef: options.destroyRef,
  });

  const { target: portalTarget } = createPortal({
    enabled: true,
    target: () => undefined,
  });

  return {
    open: anchorToggle.open,
    setOpen: anchorToggle.setOpen,
    anchorRef: anchorToggle.anchorRef,
    panelRef: anchorToggle.panelRef,
    portalTarget,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

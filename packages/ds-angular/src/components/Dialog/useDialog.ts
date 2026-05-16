// @generated:start imports
import { DestroyRef, type Signal } from "@angular/core";
import { createControllableState, createDismissal, createFocusTrap, createPortal, createScrollLock } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseDialogOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  destroyRef: DestroyRef;
}

export interface UseDialogResult {
  openness: Signal<boolean>;
  setOpenness: (next: boolean) => void;
  panelRef: { nativeElement: HTMLElement | null };
  portalTarget: Signal<Element | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useDialog(options: UseDialogOptions): UseDialogResult {
  const { value: openness, set: setOpenness } = createControllableState<boolean>({
    controlled: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });

  const panelRef: { nativeElement: HTMLElement | null } = { nativeElement: null };
  createFocusTrap(panelRef, { active: openness, destroyRef: options.destroyRef });

  createScrollLock(openness, options.destroyRef);

  const { target: portalTarget } = createPortal({
    enabled: true,
    target: () => undefined,
  });

  createDismissal({
    open: () => openness(),
    closeOnEscape: () => options.closeOnEscape,
    onDismiss: () => { setOpenness(false); },
    destroyRef: options.destroyRef,
  });

  return {
    openness,
    setOpenness,
    panelRef,
    portalTarget,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

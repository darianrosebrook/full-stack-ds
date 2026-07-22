// @generated:start imports
import { DestroyRef, type Signal } from "@angular/core";
import { createControllableState, createDismissal, createFocusTrap, createScrollLock } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseSheetOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  destroyRef: DestroyRef;
}

export interface UseSheetResult {
  openness: Signal<boolean>;
  setOpenness: (next: boolean) => void;
  panelRef: { nativeElement: HTMLElement | null };
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useSheet(options: UseSheetOptions): UseSheetResult {
  const { value: openness, set: setOpenness } = createControllableState<boolean>({
    controlled: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });

  const panelRef: { nativeElement: HTMLElement | null } = { nativeElement: null };
  createFocusTrap(panelRef, { active: openness, destroyRef: options.destroyRef });

  createScrollLock(openness, options.destroyRef);

  createDismissal({
    open: () => openness(),
    closeOnEscape: () => true,
    onDismiss: () => { setOpenness(false); },
    destroyRef: options.destroyRef,
  });

  return {
    openness,
    setOpenness,
    panelRef,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

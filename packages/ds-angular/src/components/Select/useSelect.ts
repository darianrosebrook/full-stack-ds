// @generated:start imports
import { DestroyRef, type Signal } from "@angular/core";
import { createAnchorToggle, createControllableState, createPortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseSelectOptions {
  value?: () => string | string[] | undefined;
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  destroyRef: DestroyRef;
}

export interface UseSelectResult {
  selection: Signal<string | string[]>;
  setSelection: (next: string | string[]) => void;
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
export function useSelect(options: UseSelectOptions): UseSelectResult {
  const { value: selection, set: setSelection } = createControllableState<string | string[]>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? undefined as never,
    onChange: options.onChange,
  });

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
    selection,
    setSelection,
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

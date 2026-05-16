// @generated:start imports
import { DestroyRef, type Signal } from "@angular/core";
import { createControllableState, createDismissal, createPortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseWalkthroughOptions {
  index?: () => number | undefined;
  defaultIndex?: number;
  onStepChange?: (value: number) => void;
  closeOnOutsideClick?: boolean;
  destroyRef: DestroyRef;
}

export interface UseWalkthroughResult {
  step: Signal<number>;
  setStep: (next: number) => void;
  panelRef: { nativeElement: HTMLElement | null };
  portalTarget: Signal<Element | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useWalkthrough(options: UseWalkthroughOptions): UseWalkthroughResult {
  const { value: step, set: setStep } = createControllableState<number>({
    controlled: options.index,
    defaultValue: options.defaultIndex ?? 0,
    onChange: options.onStepChange,
  });

  const panelRef: { nativeElement: HTMLElement | null } = { nativeElement: null };
  const { target: portalTarget } = createPortal({
    enabled: true,
    target: () => undefined,
  });

  createDismissal({
    open: () => true,
    closeOnEscape: () => true,
    onDismiss: () => { void 0; },
    destroyRef: options.destroyRef,
  });

  return {
    step,
    setStep,
    panelRef,
    portalTarget,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

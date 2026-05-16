// @generated:start imports
import { ref, type Ref } from "vue";
import { useControllableState, useDismissal, usePortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseWalkthroughOptions {
  index?: () => number | undefined;
  defaultIndex?: number;
  onStepChange?: (value: number) => void;
  closeOnOutsideClick?: boolean;
}

export interface UseWalkthroughResult {
  step: Ref<number>;
  setStep: (next: number) => void;
  panelRef: Ref<HTMLElement | null>;
  portalTarget: Ref<Element | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useWalkthrough(options: UseWalkthroughOptions = {}): UseWalkthroughResult {
  const { value: step, set: setStep } = useControllableState<number>({
    controlled: options.index,
    defaultValue: options.defaultIndex ?? 0,
    onChange: options.onStepChange,
  });

  const panelRef = ref<HTMLElement | null>(null);
  const { target: portalTarget } = usePortal({
    enabled: true,
    target: () => undefined,
  });

  useDismissal({
    open: () => true,
    closeOnEscape: () => true,
    onDismiss: () => void 0,
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

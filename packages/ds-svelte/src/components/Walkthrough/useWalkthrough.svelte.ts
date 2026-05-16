// @generated:start imports
import { createControllableState, createDismissal, createPortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseWalkthroughOptions {
  index?: () => number | undefined;
  defaultIndex?: () => number | undefined;
  onStepChange?: () => ((value: number) => void) | undefined;
  closeOnOutsideClick?: () => boolean | undefined;
}

export interface UseWalkthroughResult {
  readonly step: number;
  setStep(next: number): void;
  panelRef: { el: HTMLElement | null };
  readonly portalTarget: Element | null;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useWalkthrough(opts: UseWalkthroughOptions = {}): UseWalkthroughResult {
  const stepState = createControllableState<number>({
    controlled: opts.index,
    defaultValue: opts.defaultIndex?.() ?? 0,
    onChange: (v) => opts.onStepChange?.()?.(v),
  });

  const panelRef = { el: null as HTMLElement | null };
  const portal = createPortal({
    enabled: true,
    target: () => undefined,
  });

  createDismissal({
    open: () => true,
    closeOnEscape: () => true,
    onDismiss: () => { void 0; },
  });

  return {
    get step() { return stepState.value; },
    setStep(v) { stepState.set(v); },
    panelRef,
    get portalTarget() { return portal.target; },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

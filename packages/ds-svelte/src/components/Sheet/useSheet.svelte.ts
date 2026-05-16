// @generated:start imports
import { createControllableState, createDismissal, createFocusTrap, createPortal, createScrollLock } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseSheetOptions {
  open?: () => boolean | undefined;
  defaultOpen?: () => boolean | undefined;
  onOpenChange?: () => ((value: boolean) => void) | undefined;
}

export interface UseSheetResult {
  readonly openness: boolean;
  setOpenness(next: boolean): void;
  panelRef: { el: HTMLElement | null };
  readonly portalTarget: Element | null;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useSheet(opts: UseSheetOptions = {}): UseSheetResult {
  const opennessState = createControllableState<boolean>({
    controlled: opts.open,
    defaultValue: opts.defaultOpen?.() ?? false,
    onChange: (v) => opts.onOpenChange?.()?.(v),
  });

  const panelRef = { el: null as HTMLElement | null };
  createFocusTrap({ getActive: () => opennessState.value, containerRef: panelRef });

  createScrollLock(() => opennessState.value);

  const portal = createPortal({
    enabled: true,
    target: () => undefined,
  });

  createDismissal({
    open: () => opennessState.value,
    closeOnEscape: () => true,
    onDismiss: () => { opennessState.set(false); },
  });

  return {
    get openness() { return opennessState.value; },
    setOpenness(v) { opennessState.set(v); },
    panelRef,
    get portalTarget() { return portal.target; },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

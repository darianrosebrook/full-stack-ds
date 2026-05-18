// @generated:start imports
import { createAnchorToggle, createControllableState, createPortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseToastOptions {
  open?: () => boolean | undefined;
  onOpenChange?: () => ((value: boolean) => void) | undefined;
}

export interface UseToastResult {
  readonly open: boolean;
  setOpen(next: boolean): void;
  panelRef: { el: HTMLElement | null };
  anchorRef: { el: HTMLElement | null };
  readonly portalTarget: Element | null;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useToast(opts: UseToastOptions = {}): UseToastResult {
  const anchorToggle = createAnchorToggle({
    open: opts.open,
    onOpenChange: (v) => opts.onOpenChange?.()?.(v),
  });

  const panelRef = { el: null as HTMLElement | null };
  const portal = createPortal({
    enabled: true,
    target: () => undefined,
  });

  return {
    get open() { return anchorToggle.open; },
    setOpen(v) { anchorToggle.setOpen(v); },
    anchorRef: anchorToggle.anchorRef,
    panelRef: anchorToggle.panelRef,
    get portalTarget() { return portal.target; },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

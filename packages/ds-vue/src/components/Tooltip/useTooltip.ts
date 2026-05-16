// @generated:start imports
import { ref, type Ref } from "vue";
import { useAnchorToggle, useControllableState, usePortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTooltipOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
}

export interface UseTooltipResult {
  open: Ref<boolean>;
  setOpen: (next: boolean) => void;
  panelRef: Ref<HTMLElement | null>;
  anchorRef: Ref<HTMLElement | null>;
  portalTarget: Ref<Element | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTooltip(options: UseTooltipOptions = {}): UseTooltipResult {
  const panelRef = ref<HTMLElement | null>(null);
  const anchorToggle = useAnchorToggle({
    open: options.open,
    defaultOpen: options.defaultOpen ?? false,
    onOpenChange: options.onOpenChange,
  });

  const { target: portalTarget } = usePortal({
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

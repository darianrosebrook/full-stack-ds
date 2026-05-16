// @generated:start imports
import { ref, type Ref } from "vue";
import { useControllableState, useDismissal, useFocusTrap, usePortal, useScrollLock } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseSheetOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
}

export interface UseSheetResult {
  openness: Ref<boolean>;
  setOpenness: (next: boolean) => void;
  panelRef: Ref<HTMLElement | null>;
  portalTarget: Ref<Element | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useSheet(options: UseSheetOptions = {}): UseSheetResult {
  const { value: openness, set: setOpenness } = useControllableState<boolean>({
    controlled: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });

  const panelRef = ref<HTMLElement | null>(null);
  useFocusTrap(panelRef, { active: openness });

  useScrollLock(openness);

  const { target: portalTarget } = usePortal({
    enabled: true,
    target: () => undefined,
  });

  useDismissal({
    open: () => openness.value,
    closeOnEscape: () => true,
    onDismiss: () => setOpenness(false),
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

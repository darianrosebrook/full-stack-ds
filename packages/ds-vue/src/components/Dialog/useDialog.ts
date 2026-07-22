// @generated:start imports
import { ref, type Ref } from "vue";
import { useControllableState, useDismissal, useFocusTrap, useScrollLock } from "../../primitives/index.js";
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
}

export interface UseDialogResult {
  openness: Ref<boolean>;
  setOpenness: (next: boolean) => void;
  panelRef: Ref<HTMLElement | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useDialog(options: UseDialogOptions = {}): UseDialogResult {
  const { value: openness, set: setOpenness } = useControllableState<boolean>({
    controlled: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });

  const panelRef = ref<HTMLElement | null>(null);
  useFocusTrap(panelRef, { active: openness });

  useScrollLock(openness);

  useDismissal({
    open: () => openness.value,
    closeOnEscape: () => options.closeOnEscape,
    onDismiss: () => setOpenness(false),
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

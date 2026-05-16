// @generated:start imports
import { ref, type Ref } from "vue";
import { useAnchorToggle, useControllableState, usePortal } from "../../primitives/index.js";
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
}

export interface UseSelectResult {
  selection: Ref<string | string[]>;
  setSelection: (next: string | string[]) => void;
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
export function useSelect(options: UseSelectOptions = {}): UseSelectResult {
  const { value: selection, set: setSelection } = useControllableState<string | string[]>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? undefined as never,
    onChange: options.onChange,
  });

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

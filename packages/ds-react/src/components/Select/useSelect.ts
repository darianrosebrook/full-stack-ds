// @generated:start imports
import { type RefObject, useRef } from "react";
import { useAnchorToggle, useControllableState } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseSelectOptions {
  /** Controlled "selection" value. */
  value?: string | string[];
  /** Initial uncontrolled "selection" value. */
  defaultValue?: string | string[];
  /** Called when "selection" changes. */
  onChange?: (value: string | string[]) => void;
  /** Controlled "open" value. */
  open?: boolean;
  /** Initial uncontrolled "open" value. */
  defaultOpen?: boolean;
  /** Called when "open" changes. */
  onOpenChange?: (value: boolean) => void;
}

export interface UseSelectResult {
  selection: string | string[];
  setSelection: (next: string | string[]) => void;
  open: boolean;
  setOpen: (next: boolean) => void;
  panelRef: RefObject<HTMLDivElement | null>;
  anchorRef: RefObject<HTMLElement | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useSelect(options: UseSelectOptions = {}): UseSelectResult {
  const [selection, setSelection] = useControllableState<string | string[]>({
    controlled: options.value,
    defaultValue: options.defaultValue ?? "beta",
    onChange: options.onChange,
  });

  // anchor + panel refs come from useAnchorToggle below.
  const anchorToggle = useAnchorToggle({
    open: options.open,
    defaultOpen: options.defaultOpen ?? false,
    onOpenChange: options.onOpenChange,
  });

  return {
    selection,
    setSelection,
    open: anchorToggle.open,
    setOpen: anchorToggle.setOpen,
    anchorRef: anchorToggle.anchorRef,
    panelRef: anchorToggle.panelRef as RefObject<HTMLDivElement | null>,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

// @generated:start imports
import { useControllableState } from "../../primitives/hooks";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseDetailsOptions {
  /** Controlled "open" value. */
  open?: boolean;
  /** Initial uncontrolled "open" value. */
  defaultOpen?: boolean;
  /** Called when "open" changes. */
  onOpenChange?: (value: boolean) => void;
}

export interface UseDetailsResult {
  open: boolean;
  setOpen: (next: boolean) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useDetails(options: UseDetailsOptions = {}): UseDetailsResult {
  const [open, setOpen] = useControllableState<boolean>({
    controlled: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });

  return {
    open,
    setOpen,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

// @generated:start imports
import { ref, type Ref } from "vue";
import { useAnchorToggle, useControllableState, usePortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseCommandOptions {
  open?: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (value: boolean) => void;
  search?: () => string | undefined;
  defaultSearch?: string;
  onSearchChange?: (value: string) => void;
}

export interface UseCommandResult {
  open: Ref<boolean>;
  setOpen: (next: boolean) => void;
  search: Ref<string>;
  setSearch: (next: string) => void;
  panelRef: Ref<HTMLElement | null>;
  anchorRef: Ref<HTMLElement | null>;
  portalTarget: Ref<Element | null>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useCommand(options: UseCommandOptions = {}): UseCommandResult {
  const { value: search, set: setSearch } = useControllableState<string>({
    controlled: options.search,
    defaultValue: options.defaultSearch ?? "",
    onChange: options.onSearchChange,
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
    open: anchorToggle.open,
    setOpen: anchorToggle.setOpen,
    search,
    setSearch,
    anchorRef: anchorToggle.anchorRef,
    panelRef: anchorToggle.panelRef,
    portalTarget,
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

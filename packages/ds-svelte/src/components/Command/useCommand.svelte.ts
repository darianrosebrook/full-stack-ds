// @generated:start imports
import { createAnchorToggle, createControllableState, createPortal } from "../../primitives/index.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseCommandOptions {
  open?: () => boolean | undefined;
  defaultOpen?: () => boolean | undefined;
  onOpenChange?: () => ((value: boolean) => void) | undefined;
  search?: () => string | undefined;
  defaultSearch?: () => string | undefined;
  onSearchChange?: () => ((value: string) => void) | undefined;
}

export interface UseCommandResult {
  readonly open: boolean;
  setOpen(next: boolean): void;
  readonly search: string;
  setSearch(next: string): void;
  panelRef: { el: HTMLElement | null };
  anchorRef: { el: HTMLElement | null };
  readonly portalTarget: Element | null;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useCommand(opts: UseCommandOptions = {}): UseCommandResult {
  const searchState = createControllableState<string>({
    controlled: opts.search,
    defaultValue: opts.defaultSearch?.() ?? "",
    onChange: (v) => opts.onSearchChange?.()?.(v),
  });

  const anchorToggle = createAnchorToggle({
    open: opts.open,
    defaultOpen: opts.defaultOpen?.() ?? false,
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
    get search() { return searchState.value; },
    setSearch(v) { searchState.set(v); },
    anchorRef: anchorToggle.anchorRef,
    panelRef: anchorToggle.panelRef,
    get portalTarget() { return portal.target; },
  };
}
// @generated:end

// @custom:start trailing

// @custom:end

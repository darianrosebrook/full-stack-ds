// @generated:start imports
import {
  createAnchoredSurface,
  provideSurfaceContext,
  useSurfaceContext,
  type CreateAnchoredSurfaceResult,
} from "../../primitives/surfaces/createAnchoredSurface.svelte.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UsePopoverOptions {
  open: () => boolean | undefined;
  defaultOpen?: () => boolean | undefined;
  onOpenChange?: (open: boolean) => void;
  disabled?: () => boolean;
  closeOnEscape?: () => boolean | undefined;
  closeOnOutsideClick?: () => boolean | undefined;
  closeOnBlur?: () => boolean | undefined;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function usePopover(options: UsePopoverOptions): CreateAnchoredSurfaceResult {
  const dismissal = () => [
      options.closeOnEscape?.() !== false ? "escape" as const : null,
      options.closeOnOutsideClick?.() !== false ? "outside-click" as const : null,
      options.closeOnBlur?.() !== false ? "blur" as const : null
    ].filter((d): d is Exclude<typeof d, null> => d !== null);

  return createAnchoredSurface({
    open: options.open,
    // defaultOpen is read once at substrate construction time.
    defaultOpen: options.defaultOpen?.() ?? false,
    onOpenChange: options.onOpenChange,
    openTriggers: () => ["click"],
    dismissal,
    anchorRelation: "controls-expanded",
    disabled: options.disabled,
    dataMarker: "data-popover-trigger",
  });
}

export function providePopoverContext(value: CreateAnchoredSurfaceResult): void {
  provideSurfaceContext("Popover", value);
}

export function usePopoverContext(): CreateAnchoredSurfaceResult {
  return useSurfaceContext("Popover");
}
// @generated:end

// @custom:start trailing

// @custom:end

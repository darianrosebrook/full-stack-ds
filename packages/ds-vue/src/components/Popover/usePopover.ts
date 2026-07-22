// @generated:start imports
import type { ComputedRef } from "vue";
import { createCompoundContext } from "../../primitives/index.js";
import { useAnchoredSurface, type SurfaceRefCallback, type SurfaceTriggerHandlers, type SurfaceTriggerProps } from "../../primitives/surfaces/useAnchoredSurface.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UsePopoverOptions {
  open: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: () => boolean;
  closeOnEscape?: () => boolean | undefined;
  closeOnOutsideClick?: () => boolean | undefined;
  closeOnBlur?: () => boolean | undefined;
}

export interface PopoverContextValue {
  open: ComputedRef<boolean>;
  contentId: string;
  registerAnchor: SurfaceRefCallback;
  registerAnchorRefOnly: SurfaceRefCallback;
  registerContent: SurfaceRefCallback;
  getTriggerHandlers: () => SurfaceTriggerHandlers;
  triggerProps: ComputedRef<SurfaceTriggerProps>;
  anchorEl: ComputedRef<HTMLElement | null>;
  contentEl: ComputedRef<HTMLElement | null>;
  placement: ComputedRef<string | undefined>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start context
export const [providePopoverContext, usePopoverContext] =
  createCompoundContext<PopoverContextValue>("Popover");
// @generated:end

// @generated:start hook
export function usePopover(options: UsePopoverOptions) {
  const dismissal = () => [
      options.closeOnEscape?.() !== false ? "escape" as const : null,
      options.closeOnOutsideClick?.() !== false ? "outside-click" as const : null,
      options.closeOnBlur?.() !== false ? "blur" as const : null
    ].filter((d): d is Exclude<typeof d, null> => d !== null);

  return useAnchoredSurface({
    open: options.open,
    defaultOpen: options.defaultOpen,
    onOpenChange: options.onOpenChange,
    openTriggers: () => ["click"],
    dismissal,
    anchorRelation: "controls-expanded",
    disabled: options.disabled,
    dataMarker: "data-popover-trigger",
  });
}
// @generated:end

// @custom:start trailing

// @custom:end

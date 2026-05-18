// @generated:start imports
import type { ComputedRef } from "vue";
import { createCompoundContext } from "../../primitives/index.js";
import { useAnchoredSurface, type SurfaceRefCallback, type SurfaceTriggerHandlers, type SurfaceTriggerProps } from "../../primitives/surfaces/useAnchoredSurface.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface UseTooltipOptions {
  open: () => boolean | undefined;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: () => boolean;
  closeOnEscape?: () => boolean | undefined;
  closeOnBlur?: () => boolean | undefined;
}

export interface TooltipContextValue {
  open: ComputedRef<boolean>;
  contentId: string;
  registerAnchor: SurfaceRefCallback;
  registerAnchorRefOnly: SurfaceRefCallback;
  registerContent: SurfaceRefCallback;
  getTriggerHandlers: () => SurfaceTriggerHandlers;
  triggerProps: ComputedRef<SurfaceTriggerProps>;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start context
export const [provideTooltipContext, useTooltipContext] =
  createCompoundContext<TooltipContextValue>("Tooltip");
// @generated:end

// @generated:start hook
export function useTooltip(options: UseTooltipOptions) {
  const dismissal = () => [
      options.closeOnEscape?.() !== false ? "escape" as const : null,
      options.closeOnBlur?.() !== false ? "blur" as const : null,
      "pointer-leave" as const
    ].filter((d): d is Exclude<typeof d, null> => d !== null);

  return useAnchoredSurface({
    open: options.open,
    defaultOpen: options.defaultOpen,
    onOpenChange: options.onOpenChange,
    openTriggers: () => ["hover","focus"],
    dismissal,
    anchorRelation: "describedby",
    disabled: options.disabled,
  });
}
// @generated:end

// @custom:start trailing

// @custom:end

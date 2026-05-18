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
export interface UseTooltipOptions {
  open: () => boolean | undefined;
  defaultOpen?: () => boolean | undefined;
  onOpenChange?: (open: boolean) => void;
  disabled?: () => boolean;
  closeOnEscape?: () => boolean | undefined;
  closeOnBlur?: () => boolean | undefined;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start hook
export function useTooltip(options: UseTooltipOptions): CreateAnchoredSurfaceResult {
  const dismissal = () => [
      options.closeOnEscape?.() !== false ? "escape" as const : null,
      options.closeOnBlur?.() !== false ? "blur" as const : null,
      "pointer-leave" as const
    ].filter((d): d is Exclude<typeof d, null> => d !== null);

  return createAnchoredSurface({
    open: options.open,
    // defaultOpen is read once at substrate construction time.
    defaultOpen: options.defaultOpen?.() ?? false,
    onOpenChange: options.onOpenChange,
    openTriggers: () => ["hover","focus"],
    dismissal,
    anchorRelation: "describedby",
    disabled: options.disabled,
  });
}

export function provideTooltipContext(value: CreateAnchoredSurfaceResult): void {
  provideSurfaceContext("Tooltip", value);
}

export function useTooltipContext(): CreateAnchoredSurfaceResult {
  return useSurfaceContext("Tooltip");
}
// @generated:end

// @custom:start trailing

// @custom:end

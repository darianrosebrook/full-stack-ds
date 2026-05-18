// @generated:start imports
import { InjectionToken, type Signal } from "@angular/core";
import {
  createAnchoredSurface,
  type CreateAnchoredSurfaceOptions,
  type CreateAnchoredSurfaceResult,
} from "../../primitives/surfaces/createAnchoredSurface.js";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export interface TooltipContextValue {
  open: Signal<boolean>;
  setOpen: (next: boolean) => void;
  contentId: string;
  anchorRelation: "describedby";
  registerAnchor: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start context
export const TooltipContextToken = new InjectionToken<TooltipContextValue>(
  "TooltipContext",
);
// @generated:end

// @generated:start hook
// anchorRelation is contract-derived for this surface kind and
// is set by useTooltip itself — consumers don't pass it.
export type UseTooltipOptions = Omit<CreateAnchoredSurfaceOptions, "anchorRelation">;

export function useTooltip(options: UseTooltipOptions): CreateAnchoredSurfaceResult {
  return createAnchoredSurface({
    ...options,
    anchorRelation: "describedby",
  });
}
// @generated:end

// @custom:start trailing

// @custom:end

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
export interface PopoverContextValue {
  open: Signal<boolean>;
  setOpen: (next: boolean) => void;
  contentId: string;
  anchorRelation: "controls-expanded";
  registerAnchor: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
}
// @generated:end

// @custom:start types

// @custom:end

// @generated:start context
export const PopoverContextToken = new InjectionToken<PopoverContextValue>(
  "PopoverContext",
);
// @generated:end

// @generated:start hook
// anchorRelation is contract-derived for this surface kind and
// is set by usePopover itself — consumers don't pass it.
export type UsePopoverOptions = Omit<CreateAnchoredSurfaceOptions, "anchorRelation">;

export function usePopover(options: UsePopoverOptions): CreateAnchoredSurfaceResult {
  return createAnchoredSurface({
    ...options,
    anchorRelation: "controls-expanded",
  });
}
// @generated:end

// @custom:start trailing

// @custom:end

/**
 * Internal substrate for the presence-surface family.
 *
 * NOT part of the public package API. Used only by generated surface
 * components (Tooltip, Popover, Menu, ...). Consumers interact via
 * the compound component API:
 *
 *   <Tooltip>
 *     <TooltipTrigger>Save</TooltipTrigger>
 *     <TooltipContent>Save the document</TooltipContent>
 *   </Tooltip>
 *
 * If you are reading this from outside the package: the substrate
 * shape is intentionally unstable. It will be promoted to public API
 * only after Popover and Menu prove it generalises.
 */
export type SurfaceOpenTrigger = "hover" | "focus" | "click";

export type SurfaceDismissalMode =
  | "escape"
  | "outside-click"
  | "blur"
  | "pointer-leave"
  | "close-button"
  | "timeout";

export type SurfaceAnchorRelation =
  | "describedby"
  | "controls-expanded"
  | "labelledby"
  | "activedescendant"
  | "none";

export interface SurfaceLifecycle {
  mount(): void;
  unmount(): void;
}

export abstract class SurfaceController implements SurfaceLifecycle {
  protected anchor: HTMLElement | null = null;
  protected content: HTMLElement | null = null;

  constructor(
    protected readonly options: {
      isOpen: () => boolean;
      setOpen: (next: boolean) => void;
    },
  ) {}

  setAnchor(node: HTMLElement | null): void {
    this.anchor = node;
  }

  setContent(node: HTMLElement | null): void {
    this.content = node;
  }

  abstract mount(): void;
  abstract unmount(): void;
}

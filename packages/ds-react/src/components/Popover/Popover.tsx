// @generated:start imports
import {
  type ReactNode,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  createContext,
  useContext,
} from "react";
import { useAnchoredSurface, type SurfaceTriggerHandlers } from "../../primitives/surfaces/useAnchoredSurface";
import { bindInteractionHost } from "../../primitives/InteractionHost";
import { createPortal } from "react-dom";
import { usePortalTarget } from "../../primitives/hooks";
import { useAnchoredPosition } from "../../primitives/surfaces/useAnchoredPosition";
import "./Popover.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnBlur?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}

export interface PopoverTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Adopt the consumer's single child element as the trigger host
   * instead of rendering a default `<button>`. The adopted element
   * receives the merged ref, ARIA props, data marker, and surface
   * event handlers. Consumer event handlers run first; if they call
   * `event.preventDefault()` the surface handler is suppressed.
   */
  asChild?: boolean;
  children?: ReactNode;
}

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
// @generated:end

// @generated:start context
interface PopoverContextValue {
  open: boolean;
  contentId: string;
  ariaAttrForAnchor: "aria-controls";
  registerAnchor: (node: HTMLElement | null) => void;
  registerAnchorRefOnly: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
  getTriggerHandlers: () => SurfaceTriggerHandlers;
  anchorEl: HTMLElement | null;
  contentEl: HTMLElement | null;
  placement: PopoverPlacement | undefined;
}

const PopoverContext = createContext<PopoverContextValue | null>(null);
PopoverContext.displayName = "PopoverContext";

function usePopoverContext(): PopoverContextValue {
  const value = useContext(PopoverContext);
  if (value === null) {
    throw new Error(
      "Popover compound component used outside of <Popover> provider.",
    );
  }
  return value;
}
// @generated:end

// @generated:start component
export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  placement,
  disabled,
  className,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  closeOnBlur = true,
  "data-testid": testId,
  children,
}: PopoverProps) {
  const dismissal = [
    closeOnEscape && "escape",
    closeOnOutsideClick && "outside-click",
    closeOnBlur && "blur",
  ].filter(Boolean) as readonly ("escape" | "outside-click" | "blur")[];

  const surface = useAnchoredSurface({
    open,
    defaultOpen,
    onOpenChange,
    openTriggers: ["click"],
    dismissal,
    anchorRelation: "controls-expanded",
    disabled,
  });

  const classNames = [
    "popover",
    placement && `popover--${placement}`,
    disabled && "popover--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <PopoverContext.Provider
      value={{
        open: surface.open,
        contentId: surface.contentId,
        ariaAttrForAnchor: "aria-controls",
        registerAnchor: surface.registerAnchor,
        registerAnchorRefOnly: surface.registerAnchorRefOnly,
        registerContent: surface.registerContent,
        getTriggerHandlers: surface.getTriggerHandlers,
        anchorEl: surface.anchorEl,
        contentEl: surface.contentEl,
        placement,
      }}
    >
      <span className={classNames} data-testid={testId}>
        {children}
      </span>
    </PopoverContext.Provider>
  );
}

Popover.Trigger = function PopoverTrigger({
  asChild,
  children,
  ...rest
}: PopoverTriggerProps) {
  const ctx = usePopoverContext();
  const ariaProps = {
    "aria-controls": ctx.contentId,
    "aria-expanded": ctx.open,
  };

  if (asChild) {
    return adoptChildAsTrigger({
      child: children,
      ctx,
      ariaProps,
      rest,
    });
  }

  return (
    <button
      type="button"
      ref={(node) => ctx.registerAnchor(node)}
      data-popover-trigger=""
      {...ariaProps}
      {...rest}
    >
      {children}
    </button>
  );
};

interface AdoptChildArgs {
  child: ReactNode;
  ctx: PopoverContextValue;
  ariaProps: Record<string, unknown>;
  rest: Omit<PopoverTriggerProps, "asChild" | "children">;
}

function adoptChildAsTrigger({ child, ctx, ariaProps, rest }: AdoptChildArgs) {
  return bindInteractionHost(child, rest, ariaProps, ctx.getTriggerHandlers() as Record<string, unknown>, {
    "data-popover-trigger": "",
    ref: ctx.registerAnchorRefOnly,
  });
}

Popover.Content = function PopoverContent({
  children,
  ...rest
}: PopoverContentProps) {
  const ctx = usePopoverContext();
  const portalTarget = usePortalTarget();
  const position = useAnchoredPosition({
    anchor: ctx.anchorEl,
    content: ctx.contentEl,
    open: ctx.open,
    placement: ctx.placement ?? "auto",
    collision: "flip-shift",
    boundary: portalTarget,
  });
  const { style: consumerStyle, ...restWithoutStyle } = rest;
  if (!ctx.open) return null;
  return portalTarget !== null
    ? createPortal(
        <div
          ref={(node) => ctx.registerContent(node)}
          id={ctx.contentId}
          style={{
            ...consumerStyle,
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            visibility: position.ready ? "visible" : "hidden",
          }}
          data-placement={position.placement}
          data-popover-content=""
          {...restWithoutStyle}
        >
          {children}
        </div>,
        portalTarget,
      )
    : (
        <div
          ref={(node) => ctx.registerContent(node)}
          id={ctx.contentId}
          style={{
            ...consumerStyle,
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            visibility: position.ready ? "visible" : "hidden",
          }}
          data-placement={position.placement}
          data-popover-content=""
          {...restWithoutStyle}
        >
          {children}
        </div>
      );
};
// @generated:end

// @custom:start trailing

// @custom:end

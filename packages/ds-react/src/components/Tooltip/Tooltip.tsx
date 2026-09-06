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
import "./Tooltip.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}

export interface TooltipTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
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

export interface TooltipContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}
// @generated:end

// @generated:start context
interface TooltipContextValue {
  open: boolean;
  contentId: string;
  ariaAttrForAnchor: "aria-describedby";
  registerAnchor: (node: HTMLElement | null) => void;
  registerAnchorRefOnly: (node: HTMLElement | null) => void;
  registerContent: (node: HTMLElement | null) => void;
  getTriggerHandlers: () => SurfaceTriggerHandlers;
  anchorEl: HTMLElement | null;
  contentEl: HTMLElement | null;
  placement: TooltipPlacement | undefined;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);
TooltipContext.displayName = "TooltipContext";

function useTooltipContext(): TooltipContextValue {
  const value = useContext(TooltipContext);
  if (value === null) {
    throw new Error(
      "Tooltip compound component used outside of <Tooltip> provider.",
    );
  }
  return value;
}
// @generated:end

// @generated:start component
export function Tooltip({
  open,
  defaultOpen,
  onOpenChange,
  placement,
  disabled,
  className,
  closeOnEscape = true,
  closeOnBlur = true,
  "data-testid": testId,
  children,
}: TooltipProps) {
  const dismissal = [
    closeOnEscape && "escape",
    closeOnBlur && "blur",
    "pointer-leave",
  ].filter(Boolean) as readonly ("escape" | "blur" | "pointer-leave")[];

  const surface = useAnchoredSurface({
    open,
    defaultOpen,
    onOpenChange,
    openTriggers: ["hover","focus"],
    dismissal,
    anchorRelation: "describedby",
    disabled,
  });

  const classNames = [
    "tooltip",
    placement && `tooltip--${placement}`,
    disabled && "tooltip--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <TooltipContext.Provider
      value={{
        open: surface.open,
        contentId: surface.contentId,
        ariaAttrForAnchor: "aria-describedby",
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
    </TooltipContext.Provider>
  );
}

Tooltip.Trigger = function TooltipTrigger({
  asChild,
  children,
  ...rest
}: TooltipTriggerProps) {
  const ctx = useTooltipContext();
  const ariaProps = ctx.open
    ? { "aria-describedby": ctx.contentId }
    : {};

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
      data-tooltip-trigger=""
      {...ariaProps}
      {...rest}
    >
      {children}
    </button>
  );
};

interface AdoptChildArgs {
  child: ReactNode;
  ctx: TooltipContextValue;
  ariaProps: Record<string, unknown>;
  rest: Omit<TooltipTriggerProps, "asChild" | "children">;
}

function adoptChildAsTrigger({ child, ctx, ariaProps, rest }: AdoptChildArgs) {
  return bindInteractionHost(child, rest, ariaProps, ctx.getTriggerHandlers() as Record<string, unknown>, {
    "data-tooltip-trigger": "",
    ref: ctx.registerAnchorRefOnly,
  });
}

Tooltip.Content = function TooltipContent({
  children,
  ...rest
}: TooltipContentProps) {
  const ctx = useTooltipContext();
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
          role="tooltip"
          style={{
            ...consumerStyle,
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            visibility: position.ready ? "visible" : "hidden",
          }}
          data-placement={position.placement}
          data-tooltip-content=""
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
          role="tooltip"
          style={{
            ...consumerStyle,
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            visibility: position.ready ? "visible" : "hidden",
          }}
          data-placement={position.placement}
          data-tooltip-content=""
          {...restWithoutStyle}
        >
          {children}
        </div>
      );
};
// @generated:end

// @custom:start trailing

// @custom:end

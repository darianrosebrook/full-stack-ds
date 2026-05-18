// @generated:start imports
import { type ReactNode, type HTMLAttributes, type ButtonHTMLAttributes, createContext, useContext } from "react";
import { useAnchoredSurface } from "../../primitives/surfaces/useAnchoredSurface";
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
  registerContent: (node: HTMLElement | null) => void;
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
        registerContent: surface.registerContent,
      }}
    >
      <span className={classNames} data-testid={testId}>
        {children}
      </span>
    </TooltipContext.Provider>
  );
}

Tooltip.Trigger = function TooltipTrigger({
  children,
  ...rest
}: TooltipTriggerProps) {
  const ctx = useTooltipContext();
  const ariaProps = ctx.open
    ? { "aria-describedby": ctx.contentId }
    : {};
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

Tooltip.Content = function TooltipContent({
  children,
  ...rest
}: TooltipContentProps) {
  const ctx = useTooltipContext();
  if (!ctx.open) return null;
  return (
    <div
      ref={(node) => ctx.registerContent(node)}
      id={ctx.contentId}
      role="tooltip"
      data-tooltip-content=""
      {...rest}
    >
      {children}
    </div>
  );
};
// @generated:end

// @custom:start trailing

// @custom:end

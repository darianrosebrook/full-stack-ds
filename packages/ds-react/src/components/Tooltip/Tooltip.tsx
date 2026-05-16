// @generated:start imports
import { type ReactNode } from "react";
import { useTooltip } from "./useTooltip";
import "./Tooltip.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type TooltipTrigger = "hover" | "focus" | "manual";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface TooltipProps {
  content: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  trigger?: TooltipTrigger;
  delay?: number;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Tooltip({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  placement,
  disabled,
  className,
  "data-testid": testId,
  children,
  content,
  trigger = "hover",
  delay,
  closeOnEscape = true,
  closeOnBlur = true,
  ...rest
}: TooltipProps) {
  const { open, setOpen } = useTooltip({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    closeOnEscape,
    closeOnBlur,
  });

  const classNames = [
    "tooltip",
    placement && `tooltip--${placement}`,
    disabled && "tooltip--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (!open) return null;
  return (
    <div className={`${classNames}`} role="tooltip" data-testid={testId} {...rest}>
      {children}
    </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

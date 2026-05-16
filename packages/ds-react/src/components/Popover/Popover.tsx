// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import { usePopover } from "./usePopover";
import "./Popover.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type PopoverTriggerStrategy = "click" | "hover";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  triggerStrategy?: PopoverTriggerStrategy;
  offset?: number;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  anchor?: HTMLElement | null;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface PopoverTriggerProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function PopoverTrigger({
  children,
  className,
  "data-testid": testId,
}: PopoverTriggerProps) {
  const classNames = ["popover__trigger", className].filter(Boolean).join(" ");
  return (
    <Stack as="button" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface PopoverContentProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function PopoverContent({
  children,
  className,
  "data-testid": testId,
}: PopoverContentProps) {
  const classNames = ["popover__content", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Popover({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  placement = "auto",
  className,
  "data-testid": testId,
  children,
  triggerStrategy = "click",
  offset = 8,
  closeOnOutsideClick,
  closeOnEscape,
  anchor,
  ...rest
}: PopoverProps) {
  const { open, setOpen } = usePopover({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    closeOnEscape,
    closeOnOutsideClick,
  });

  const classNames = [
    "popover",
    placement && `popover--${placement}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-testid={testId} {...rest}>
    <button className="popover__trigger" type="button" aria-haspopup="true" aria-expanded={open} aria-controls={"popover-content"}>
      {children}
    </button>
    {open && (
      <div className="popover__content" id="popover-content">
        {children}
      </div>
    )}
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

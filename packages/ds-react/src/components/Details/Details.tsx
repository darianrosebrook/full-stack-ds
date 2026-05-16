// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useDetails } from "./useDetails";
import "./Details.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DetailsVariant = "default" | "inline" | "compact";

export type DetailsIcon = "left" | "right" | "none";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface DetailsProps {
  summary: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  variant?: DetailsVariant;
  icon?: DetailsIcon;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface DetailsContentProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function DetailsContent({
  children,
  className,
  "data-testid": testId,
}: DetailsContentProps) {
  const classNames = ["details__content", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Details({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  variant,
  icon,
  disabled,
  className,
  "data-testid": testId,
  children,
  summary,
  ...rest
}: DetailsProps) {
  const { open, setOpen } = useDetails({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  const classNames = [
    "details",
    variant && `details--${variant}`,
    icon && `details--${icon}`,
    open && "details--open",
    disabled && "details--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <details className={`${classNames}`} open={open} role="group" data-testid={testId} {...rest}>
    <summary className="details__summary">
      <span className="details__summaryContent">
        <span className="details__icon" />
        <span className="details__summaryText">
          {summary}
        </span>
      </span>
    </summary>
    {open && (
      <div className="details__content">
        {children}
      </div>
    )}
  </details>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

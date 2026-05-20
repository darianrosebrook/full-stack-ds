// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./Spinner.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SpinnerSize = "xs" | "sm" | "md" | "lg";

export type SpinnerVariant = "ring" | "dots" | "bars";

export type SpinnerThickness = "hairline" | "regular" | "bold";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface SpinnerProps extends Omit<HTMLAttributes<HTMLDivElement>, "ariaHidden" | "children" | "className" | "data-testid" | "inline" | "label" | "showAfterMs" | "size" | "thickness" | "variant"> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  thickness?: SpinnerThickness;
  ariaHidden?: boolean;
  label?: string;
  inline?: boolean;
  showAfterMs?: number;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Spinner({
  size,
  variant,
  thickness,
  className,
  "data-testid": testId,
  ariaHidden,
  label,
  inline,
  showAfterMs,
  ...rest
}: SpinnerProps) {
  const classNames = [
    "spinner",
    size && `spinner--${size}`,
    variant && `spinner--${variant}`,
    thickness && `spinner--${thickness}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} role="status" data-testid={testId} {...rest}>
    <span className="spinner__visual" aria-hidden="true" />
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

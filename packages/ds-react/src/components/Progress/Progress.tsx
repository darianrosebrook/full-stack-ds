// @generated:start imports
import { type ReactNode } from "react";
import "./Progress.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ProgressVariant = "linear" | "circular";

export type ProgressSize = "sm" | "md" | "lg";

export type ProgressIntent = "info" | "success" | "warning" | "danger";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface ProgressProps {
  value?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  intent?: ProgressIntent;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number, max: number) => string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Progress({
  variant,
  size,
  intent,
  className,
  "data-testid": testId,
  children,
  value,
  label,
  showValue,
  formatValue,
  ...rest
}: ProgressProps) {
  const classNames = [
    "progress",
    variant && `progress--${variant}`,
    size && `progress--${size}`,
    intent && `progress--${intent}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label} data-testid={testId} {...rest}>
    <span className="progress__track" aria-hidden="true">
      <span className="progress__fill" />
    </span>
    {showValue && (
      <span className="progress__value">
        {children}
      </span>
    )}
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

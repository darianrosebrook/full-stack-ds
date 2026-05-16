// @generated:start imports
import { type ReactNode } from "react";
import "./Chip.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ChipType = "button" | "submit" | "reset";

export type ChipVariant = "default" | "selected" | "dismissible";

export type ChipSize = "small" | "medium" | "large";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface ChipProps {
  type?: ChipType;
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  icon?: ReactNode;
  title?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Chip({
  variant,
  size,
  disabled,
  className,
  "data-testid": testId,
  children,
  type,
  icon,
  title,
  ariaLabel,
  ariaExpanded,
  ariaPressed,
  ...rest
}: ChipProps) {
  const classNames = [
    "chip",
    variant && `chip--${variant}`,
    size && `chip--${size}`,
    disabled && "chip--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <button className={`${classNames}`} type={type} disabled={disabled} aria-label={ariaLabel} aria-expanded={ariaExpanded} aria-pressed={ariaPressed} data-testid={testId} {...rest}>
    {icon && (
      <span className="chip__icon" aria-hidden="true" />
    )}
    <span className="chip__text">
      {children}
    </span>
  </button>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

// @generated:start imports
import { type ButtonHTMLAttributes, type ReactNode } from "react";
import "./Button.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ButtonSize = "small" | "medium" | "large";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "outline";

export type ButtonType = "button" | "submit" | "reset";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "ariaExpanded" | "ariaLabel" | "ariaPressed" | "children" | "className" | "data-testid" | "disabled" | "loading" | "size" | "title" | "type" | "variant"> {
  size?: ButtonSize;
  variant?: ButtonVariant;
  type?: ButtonType;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  title?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Button({
  size = "medium",
  variant = "primary",
  disabled,
  className,
  "data-testid": testId,
  children,
  type = "button",
  loading,
  ariaLabel,
  ariaExpanded,
  ariaPressed,
  title,
  ...rest
}: ButtonProps) {
  const classNames = [
    "button",
    size && `button--${size}`,
    variant && `button--${variant}`,
    disabled && "button--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <button className={`${classNames}`} type={type} disabled={disabled} aria-label={ariaLabel} aria-expanded={ariaExpanded} aria-pressed={ariaPressed} aria-busy={loading} data-testid={testId} {...rest}>
    {children}
  </button>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

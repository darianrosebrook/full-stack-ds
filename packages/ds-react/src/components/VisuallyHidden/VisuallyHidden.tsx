// @generated:start imports
import { type ReactNode } from "react";
import "./VisuallyHidden.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface VisuallyHiddenProps {
  focusable?: boolean;
  title?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function VisuallyHidden({
  className,
  "data-testid": testId,
  children,
  focusable,
  title,
  ...rest
}: VisuallyHiddenProps) {
  const classNames = [
    "visually-hidden",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <span className={`${classNames}`} data-testid={testId} {...rest}>
    {children}
  </span>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

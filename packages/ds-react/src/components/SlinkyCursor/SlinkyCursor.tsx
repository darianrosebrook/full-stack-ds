// @generated:start imports
import { type ReactNode } from "react";
import "./SlinkyCursor.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface SlinkyCursorProps {
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function SlinkyCursor({
  className,
  "data-testid": testId,
  ...rest
}: SlinkyCursorProps) {
  const classNames = [
    "slinky-cursor",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-testid={testId} {...rest}>
    <div className="slinky-cursor__pest" />
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

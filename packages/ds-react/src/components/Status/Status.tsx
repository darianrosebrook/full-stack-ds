// @generated:start imports
import { type ReactNode } from "react";
import "./Status.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type StatusIntent = "info" | "success" | "warning" | "danger" | "error";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface StatusProps {
  status: StatusIntent;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Status({
  status,
  className,
  "data-testid": testId,
  children,
  ...rest
}: StatusProps) {
  const classNames = [
    "status",
    status && `status--${status}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <span className={`${classNames}`} data-testid={testId} {...rest}>
    <span className="status__icon" aria-hidden="true" />
    <span className="status__label">
      {children}
    </span>
  </span>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

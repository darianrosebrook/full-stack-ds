// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./PageTransition.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface PageTransitionProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "duration" | "enabled" | "transitionName"> {
  transitionName?: string;
  duration?: number;
  enabled?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function PageTransition({
  className,
  "data-testid": testId,
  children,
  transitionName,
  duration,
  enabled = true,
  ...rest
}: PageTransitionProps) {
  const classNames = [
    "page-transition",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-testid={testId} {...rest}>
    {children}
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

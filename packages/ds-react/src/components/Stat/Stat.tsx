// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./Stat.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type StatSize = "sm" | "md" | "lg";

export type StatTrend = "up" | "down" | "neutral";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface StatProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "size" | "trend"> {
  size?: StatSize;
  trend?: StatTrend;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Stat({
  size = "md",
  trend,
  className,
  "data-testid": testId,
  children,
  ...rest
}: StatProps) {
  const classNames = [
    "stat",
    size && `stat--${size}`,
    trend && `stat--${trend}`,
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

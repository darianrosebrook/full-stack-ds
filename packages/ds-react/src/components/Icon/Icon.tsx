// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./Icon.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type IconDefinition = { iconName: string; prefix?: string; icon?: unknown };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface IconProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className" | "data-testid" | "height" | "icon" | "width"> {
  icon: IconDefinition;
  width?: number;
  height?: number;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Icon({
  className,
  "data-testid": testId,
  icon,
  width = 20,
  height = 20,
  ...rest
}: IconProps) {
  const classNames = [
    "icon",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <span className={`${classNames}`} aria-hidden="true" data-testid={testId} {...rest}>
    <svg viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      <circle cx="8.5" cy="8.5" r="8" stroke="currentColor" strokeLinecap="round" strokeDasharray="2 4" />
      <circle cx="8.5" cy="8.5" r="3" stroke="currentColor" strokeLinecap="round" strokeDasharray=".125 3" />
    </svg>
  </span>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

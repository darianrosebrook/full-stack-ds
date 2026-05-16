// @generated:start imports
import { type ReactNode } from "react";
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
export interface IconProps {
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
  <span className={`${classNames}`} aria-hidden="true" data-testid={testId} {...rest} />
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

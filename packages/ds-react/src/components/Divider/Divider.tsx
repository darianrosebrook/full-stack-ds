// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./Divider.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface DividerProps extends Omit<HTMLAttributes<HTMLHRElement>, "children" | "className" | "data-testid" | "decorative" | "orientation" | "thickness" | "title"> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  thickness?: string;
  title?: string;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Divider({
  orientation,
  className,
  "data-testid": testId,
  decorative,
  thickness,
  title,
  ...rest
}: DividerProps) {
  const classNames = [
    "divider",
    orientation && `divider--${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <hr className={`${classNames}`} data-testid={testId} {...rest} />
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

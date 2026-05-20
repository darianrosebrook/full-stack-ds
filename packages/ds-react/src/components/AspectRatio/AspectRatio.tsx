// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./AspectRatio.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AspectRatioPreset = "square" | "video" | "photo" | "wide" | "portrait";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface AspectRatioProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "preset" | "ratio"> {
  ratio?: number;
  preset?: AspectRatioPreset;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function AspectRatio({
  className,
  "data-testid": testId,
  children,
  ratio,
  preset,
  ...rest
}: AspectRatioProps) {
  const classNames = [
    "aspect-ratio",
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

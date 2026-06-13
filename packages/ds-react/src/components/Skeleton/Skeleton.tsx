// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./Skeleton.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SkeletonVariant = "block" | "text" | "avatar" | "media" | "dataviz" | "actions";

export type SkeletonAnimate = "shimmer" | "wipe" | "pulse" | "none";

export type SkeletonDensity = "compact" | "regular" | "spacious";

export type SkeletonRadius = "sm" | "md" | "lg";

export type SkeletonLines = number | { min: number; max: number };
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface SkeletonProps extends Omit<HTMLAttributes<HTMLDivElement>, "animate" | "ariaLabel" | "aspectRatio" | "children" | "className" | "data-testid" | "decorative" | "density" | "lines" | "radius" | "variant"> {
  variant?: SkeletonVariant;
  animate?: SkeletonAnimate;
  density?: SkeletonDensity;
  aspectRatio?: string;
  lines?: SkeletonLines;
  radius?: SkeletonRadius;
  decorative?: boolean;
  ariaLabel?: string;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Skeleton({
  variant = "block",
  animate = "shimmer",
  density = "regular",
  className,
  "data-testid": testId,
  aspectRatio,
  lines,
  radius,
  decorative = true,
  ariaLabel,
  ...rest
}: SkeletonProps) {
  const classNames = [
    "skeleton",
    variant && `skeleton--${variant}`,
    animate && `skeleton--${animate}`,
    density && `skeleton--${density}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <Stack layout="native" className={`${classNames}`} aria-busy="true" aria-label={ariaLabel} role="status" data-testid={testId} {...rest} />
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

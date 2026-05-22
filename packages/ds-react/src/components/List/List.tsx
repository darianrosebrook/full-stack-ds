// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./List.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ListElement = "ul" | "ol" | "dl";

export type ListVariant = "default" | "unstyled" | "inline" | "divided" | "spaced";

export type ListMarker = "default" | "none" | "disc" | "circle" | "square" | "decimal" | "alpha" | "roman";

export type ListSpacing = "none" | "sm" | "md" | "lg";

export type ListSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface ListProps extends Omit<HTMLAttributes<HTMLUListElement>, "as" | "children" | "className" | "data-testid" | "marker" | "size" | "spacing" | "variant"> {
  as?: ListElement;
  variant?: ListVariant;
  marker?: ListMarker;
  spacing?: ListSpacing;
  size?: ListSize;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function List({
  as,
  variant,
  marker,
  spacing,
  size,
  className,
  "data-testid": testId,
  children,
  ...rest
}: ListProps) {
  const classNames = [
    "list",
    as && `list--${as}`,
    variant && `list--${variant}`,
    marker && `list--${marker}`,
    spacing && `list--${spacing}`,
    size && `list--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const As = as ?? "ul";

  return (
  <As className={`${classNames}`} data-testid={testId} {...rest}>
    {children}
  </As>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

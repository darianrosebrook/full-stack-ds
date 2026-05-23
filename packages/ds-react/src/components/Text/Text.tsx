// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./Text.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type TextElement = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export type TextVariant = "display" | "headline" | "title" | "body" | "caption" | "overline" | "code";

export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";

export type TextWeight = "light" | "normal" | "medium" | "semibold" | "bold";

export type TextAlign = "left" | "center" | "right" | "justify";

export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface TextProps extends Omit<HTMLAttributes<HTMLParagraphElement>, "align" | "as" | "children" | "className" | "data-testid" | "size" | "transform" | "truncate" | "variant" | "weight"> {
  as?: TextElement;
  variant?: TextVariant;
  size?: TextSize;
  weight?: TextWeight;
  align?: TextAlign;
  transform?: TextTransform;
  truncate?: boolean;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Text({
  variant,
  size,
  weight,
  align,
  transform,
  className,
  "data-testid": testId,
  as,
  truncate,
  ...rest
}: TextProps) {
  const classNames = [
    "text",
    variant && `text--${variant}`,
    size && `text--${size}`,
    weight && `text--${weight}`,
    align && `text--${align}`,
    transform && `text--${transform}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const As = as ?? "p";

  return (
  <As className={`${classNames}`} data-testid={testId} {...rest} />
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

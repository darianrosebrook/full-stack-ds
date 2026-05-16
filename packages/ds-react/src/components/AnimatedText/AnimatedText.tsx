// @generated:start imports
import { type ReactNode } from "react";
import "./AnimatedText.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedTextAs = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

export type AnimatedTextVariant = "blur-in" | "fade-up" | "slide-in";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface AnimatedTextProps {
  text: string;
  as?: AnimatedTextAs;
  variant?: AnimatedTextVariant;
  duration?: number;
  stagger?: number;
  delay?: number;
  triggerOnScroll?: boolean;
  scrollStart?: string;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function AnimatedText({
  as,
  variant,
  className,
  "data-testid": testId,
  text,
  duration,
  stagger,
  delay,
  triggerOnScroll,
  scrollStart,
  ...rest
}: AnimatedTextProps) {
  const classNames = [
    "animated-text",
    as && `animated-text--${as}`,
    variant && `animated-text--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-text={text} data-testid={testId} {...rest} />
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./AnimatedSection.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedSectionAs = "section" | "div" | "article" | "main" | "aside" | "header" | "footer";

export type AnimatedSectionVariant = "fade-up" | "fade-in" | "slide-in" | "stagger-children";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface AnimatedSectionProps extends Omit<HTMLAttributes<HTMLElement>, "as" | "children" | "className" | "data-testid" | "delay" | "duration" | "scrollStart" | "stagger" | "triggerOnScroll" | "variant"> {
  as?: AnimatedSectionAs;
  variant?: AnimatedSectionVariant;
  duration?: number;
  stagger?: number;
  delay?: number;
  triggerOnScroll?: boolean;
  scrollStart?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function AnimatedSection({
  as,
  variant,
  className,
  "data-testid": testId,
  children,
  duration,
  stagger,
  delay,
  triggerOnScroll,
  scrollStart,
  ...rest
}: AnimatedSectionProps) {
  const classNames = [
    "animated-section",
    as && `animated-section--${as}`,
    variant && `animated-section--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <section className={`${classNames}`} data-testid={testId} {...rest}>
    {children}
  </section>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

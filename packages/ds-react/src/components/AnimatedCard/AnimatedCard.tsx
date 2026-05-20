// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./AnimatedCard.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AnimatedCardAs = "article" | "div" | "li" | "a";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface AnimatedCardProps extends Omit<HTMLAttributes<HTMLDivElement>, "as" | "children" | "className" | "data-testid" | "delay" | "duration" | "enableHover" | "href" | "scrollStart" | "triggerOnScroll"> {
  as?: AnimatedCardAs;
  duration?: number;
  delay?: number;
  triggerOnScroll?: boolean;
  scrollStart?: string;
  enableHover?: boolean;
  href?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface AnimatedCardTitleProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AnimatedCardTitle({
  children,
  className,
  "data-testid": testId,
}: AnimatedCardTitleProps) {
  const classNames = ["animated-card__title", className].filter(Boolean).join(" ");
  return (
    <Stack as="h3" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function AnimatedCard({
  as,
  className,
  "data-testid": testId,
  children,
  duration,
  delay,
  triggerOnScroll,
  scrollStart,
  enableHover,
  href,
  ...rest
}: AnimatedCardProps) {
  const classNames = [
    "animated-card",
    as && `animated-card--${as}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-as={as} data-testid={testId} {...rest}>
    {children}
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./Card.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CardStatus = "completed" | "in-progress" | "planned" | "deprecated" | "category" | "complexity";

export type CardDensity = "default" | "inset";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface CardProps {
  interactive?: boolean;
  status?: CardStatus;
  density?: CardDensity;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface CardHeaderProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function CardHeader({
  children,
  className,
  "data-testid": testId,
}: CardHeaderProps) {
  const classNames = ["card__header", className].filter(Boolean).join(" ");
  return (
    <Stack as="header" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface CardContentProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function CardContent({
  children,
  className,
  "data-testid": testId,
}: CardContentProps) {
  const classNames = ["card__content", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface CardFooterProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function CardFooter({
  children,
  className,
  "data-testid": testId,
}: CardFooterProps) {
  const classNames = ["card__footer", className].filter(Boolean).join(" ");
  return (
    <Stack as="footer" variant="horizontal" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface CardDescriptionProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function CardDescription({
  children,
  className,
  "data-testid": testId,
}: CardDescriptionProps) {
  const classNames = ["card__description", className].filter(Boolean).join(" ");
  return (
    <Stack as="p" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Card({
  status,
  density = "default",
  interactive,
  className,
  "data-testid": testId,
  children,
  ...rest
}: CardProps) {
  const classNames = [
    "card",
    status && `card--${status}`,
    density && `card--${density}`,
    interactive && "card--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Stack
      role="group"
      className={classNames}
      data-testid={testId}
      {...rest}
    >
      {children}
    </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

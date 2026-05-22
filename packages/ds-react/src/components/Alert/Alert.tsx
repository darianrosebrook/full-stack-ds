// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./Alert.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertIntent = "info" | "success" | "warning" | "danger";

export type AlertLevel = "inline" | "section" | "page";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface AlertProps {
  intent?: AlertIntent;
  level?: AlertLevel;
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  icon?: ReactNode;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface AlertBodyProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AlertBody({
  children,
  className,
  "data-testid": testId,
}: AlertBodyProps) {
  const classNames = ["alert__body", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface AlertTitleProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AlertTitle({
  children,
  className,
  "data-testid": testId,
}: AlertTitleProps) {
  const classNames = ["alert__title", className].filter(Boolean).join(" ");
  return (
    <Stack as="h3" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Alert({
  intent,
  level,
  className,
  "data-testid": testId,
  children,
  dismissible,
  onDismiss,
  dismissLabel = "Dismiss",
  icon,
  ...rest
}: AlertProps) {
  const classNames = [
    "alert",
    intent && `alert--${intent}`,
    level && `alert--${level}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Stack
      role="alert"
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

// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./AlertNotice.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertNoticeStatus = "info" | "success" | "warning" | "danger" | "error";

export type AlertNoticeLevel = "page" | "section" | "inline";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface AlertNoticeProps {
  status?: AlertNoticeStatus;
  level?: AlertNoticeLevel;
  dismissible?: boolean;
  icon?: ReactNode;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface AlertNoticeBodyProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AlertNoticeBody({
  children,
  className,
  "data-testid": testId,
}: AlertNoticeBodyProps) {
  const classNames = ["alert-notice__body", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface AlertNoticeTitleProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function AlertNoticeTitle({
  children,
  className,
  "data-testid": testId,
}: AlertNoticeTitleProps) {
  const classNames = ["alert-notice__title", className].filter(Boolean).join(" ");
  return (
    <Stack as="h3" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function AlertNotice({
  status,
  level,
  className,
  "data-testid": testId,
  children,
  dismissible,
  icon,
  ...rest
}: AlertNoticeProps) {
  const classNames = [
    "alert-notice",
    status && `alert-notice--${status}`,
    level && `alert-notice--${level}`,
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

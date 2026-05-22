// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./AlertNotice.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type AlertNoticeStatus = "info" | "success" | "warning" | "error";

export type AlertNoticeLevel = "page" | "section" | "inline";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface AlertNoticeProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "dismissLabel" | "dismissible" | "icon" | "level" | "onDismiss" | "status"> {
  status?: AlertNoticeStatus;
  level?: AlertNoticeLevel;
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
  onDismiss,
  dismissLabel = "Dismiss",
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
  <div className={`${classNames}`} role="alert" data-testid={testId} {...rest}>
    {icon && (
      <span className="alert-notice__icon" aria-hidden="true">
        {icon}
      </span>
    )}
    {children}
    {dismissible && (
      <button className="alert-notice__dismiss" type="button" onClick={onDismiss} aria-label={dismissLabel} />
    )}
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useToast } from "./useToast";
import "./Toast.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type ToastVariant = "info" | "success" | "warning" | "error";

export type ToastPoliteness = "polite" | "assertive";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface ToastProps extends Omit<HTMLAttributes<HTMLDivElement>, "action" | "children" | "className" | "data-testid" | "onOpenChange" | "open" | "politeness" | "title" | "variant"> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  variant?: ToastVariant;
  politeness?: ToastPoliteness;
  action?: ReactNode;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface ToastItemProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ToastItem({
  children,
  className,
  "data-testid": testId,
}: ToastItemProps) {
  const classNames = ["toast__item", className].filter(Boolean).join(" ");
  return (
    <Stack as="li" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface ToastTitleProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ToastTitle({
  children,
  className,
  "data-testid": testId,
}: ToastTitleProps) {
  const classNames = ["toast__title", className].filter(Boolean).join(" ");
  return (
    <Stack as="h3" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface ToastDescriptionProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ToastDescription({
  children,
  className,
  "data-testid": testId,
}: ToastDescriptionProps) {
  const classNames = ["toast__description", className].filter(Boolean).join(" ");
  return (
    <Stack as="p" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Toast({
  open: controlledOpen,
  onOpenChange,
  variant = "info",
  politeness = "polite",
  className,
  "data-testid": testId,
  children,
  title,
  action,
  ...rest
}: ToastProps) {
  const { open, setOpen } = useToast({
    open: controlledOpen,
    onOpenChange,
  });

  const classNames = [
    "toast",
    variant && `toast--${variant}`,
    politeness && `toast--${politeness}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} aria-live="polite" aria-label="Notifications" role="alert" data-testid={testId} {...rest}>
    {open && (
      <div className="toast__item" role="status">
        <div className="toast__row">
          {title && (
            <div className="toast__title" />
          )}
          <div className="toast__description">
            {children}
          </div>
          {action && (
            <div className="toast__action" />
          )}
          <button className="toast__close" type="button" aria-label="Dismiss" onClick={() => setOpen(!open)} />
        </div>
      </div>
    )}
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useDialog } from "./useDialog";
import "./Dialog.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, "aria-label" | "aria-labelledby" | "children" | "className" | "closeOnBackdropClick" | "closeOnEscape" | "data-testid" | "defaultOpen" | "dismissible" | "initialFocus" | "modal" | "onOpenChange" | "open" | "returnFocus" | "size"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  size?: DialogSize;
  dismissible?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  initialFocus?: string;
  returnFocus?: string;
  className?: string;
  "data-testid"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
  slots?: {
    title?: ReactNode;
  };
}
// @generated:end

// @generated:start subcomponents
export interface DialogHeaderProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function DialogHeader({
  children,
  className,
  "data-testid": testId,
}: DialogHeaderProps) {
  const classNames = ["dialog__header", className].filter(Boolean).join(" ");
  return (
    <Stack as="header" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface DialogTitleProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function DialogTitle({
  children,
  className,
  "data-testid": testId,
}: DialogTitleProps) {
  const classNames = ["dialog__title", className].filter(Boolean).join(" ");
  return (
    <Stack as="h3" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface DialogBodyProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function DialogBody({
  children,
  className,
  "data-testid": testId,
}: DialogBodyProps) {
  const classNames = ["dialog__body", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface DialogFooterProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function DialogFooter({
  children,
  className,
  "data-testid": testId,
}: DialogFooterProps) {
  const classNames = ["dialog__footer", className].filter(Boolean).join(" ");
  return (
    <Stack as="footer" variant="horizontal" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Dialog({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  size = "md",
  className,
  "data-testid": testId,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  modal = true,
  dismissible = true,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  initialFocus,
  returnFocus,
  slots,
  ...rest
}: DialogProps) {
  const { openness, setOpenness } = useDialog({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
    closeOnEscape,
    closeOnBackdropClick,
  });

  const classNames = [
    "dialog",
    size && `dialog--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <Stack layout="native" className={`${classNames}`} role="dialog" data-testid={testId} onClick={closeOnBackdropClick ? (e) => { if (e.target === e.currentTarget) setOpenness(false); } : undefined} {...rest}>
    {openness && (
      <div className="dialog__backdrop" aria-hidden="true" />
    )}
    {openness && (
      <div className="dialog__modal" role="dialog" aria-modal="true" aria-labelledby={"dialog-title-id"} aria-describedby={"dialog-body-id"} aria-label={ariaLabel}>
        <div className="dialog__header">
          <h2 className="dialog__title">
            {slots?.title}
          </h2>
          <button className="dialog__closeButton" type="button" aria-label="Close dialog" onClick={() => setOpenness(!openness)} />
        </div>
        <div className="dialog__body">
          {children}
        </div>
        <div className="dialog__footer" />
      </div>
    )}
  </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

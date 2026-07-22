// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useSheet } from "./useSheet";
import "./Sheet.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SheetSide = "top" | "right" | "bottom" | "left";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface SheetProps extends Omit<HTMLAttributes<HTMLDivElement>, "aria-label" | "aria-labelledby" | "children" | "className" | "data-testid" | "defaultOpen" | "modal" | "onOpenChange" | "open" | "side"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SheetSide;
  modal?: boolean;
  className?: string;
  "data-testid"?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: ReactNode;
  slots?: {
    description?: ReactNode;
    title?: ReactNode;
  };
}
// @generated:end

// @generated:start subcomponents
export interface SheetContentProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function SheetContent({
  children,
  className,
  "data-testid": testId,
}: SheetContentProps) {
  const classNames = ["sheet__content", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface SheetHeaderProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function SheetHeader({
  children,
  className,
  "data-testid": testId,
}: SheetHeaderProps) {
  const classNames = ["sheet__header", className].filter(Boolean).join(" ");
  return (
    <Stack as="header" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface SheetTitleProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function SheetTitle({
  children,
  className,
  "data-testid": testId,
}: SheetTitleProps) {
  const classNames = ["sheet__title", className].filter(Boolean).join(" ");
  return (
    <Stack as="h3" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface SheetDescriptionProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function SheetDescription({
  children,
  className,
  "data-testid": testId,
}: SheetDescriptionProps) {
  const classNames = ["sheet__description", className].filter(Boolean).join(" ");
  return (
    <Stack as="p" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface SheetBodyProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function SheetBody({
  children,
  className,
  "data-testid": testId,
}: SheetBodyProps) {
  const classNames = ["sheet__body", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface SheetFooterProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function SheetFooter({
  children,
  className,
  "data-testid": testId,
}: SheetFooterProps) {
  const classNames = ["sheet__footer", className].filter(Boolean).join(" ");
  return (
    <Stack as="footer" variant="horizontal" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Sheet({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  side = "right",
  className,
  "data-testid": testId,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  children,
  modal = true,
  slots,
  ...rest
}: SheetProps) {
  const { openness, setOpenness, renderInPortal } = useSheet({
    open: controlledOpen,
    defaultOpen,
    onOpenChange,
  });

  const classNames = [
    "sheet",
    side && `sheet--${side}`,
    openness && "sheet--open",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    renderInPortal(
    <Stack layout="native" className={`${classNames}`} role="dialog" data-testid={testId} onClick={(e) => { if (e.target === e.currentTarget) setOpenness(false); }} {...rest}>
      {openness && (
        <div className="sheet__overlay" aria-hidden="true" />
      )}
      {openness && (
        <div className="sheet__content" role="dialog" aria-modal="true" aria-labelledby={"sheet-title-id"} aria-describedby={"sheet-description-id"} data-side={side} aria-label={ariaLabel}>
          <div className="sheet__header">
            <h2 className="sheet__title">
              {slots?.title}
            </h2>
            <p className="sheet__description">
              {slots?.description}
            </p>
            <button className="sheet__close" type="button" aria-label="Close sheet" onClick={() => setOpenness(!openness)} />
          </div>
          <div className="sheet__body">
            {children}
          </div>
          <div className="sheet__footer" />
        </div>
      )}
    </Stack>
    )
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

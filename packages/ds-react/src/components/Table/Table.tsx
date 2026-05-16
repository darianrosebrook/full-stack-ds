// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./Table.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface TableProps {
  responsive?: boolean;
  ariaLabel?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface TableBodyProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TableBody({
  children,
  className,
  "data-testid": testId,
}: TableBodyProps) {
  const classNames = ["table__body", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface TableFooterProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TableFooter({
  children,
  className,
  "data-testid": testId,
}: TableFooterProps) {
  const classNames = ["table__footer", className].filter(Boolean).join(" ");
  return (
    <Stack as="footer" variant="horizontal" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface TableHeaderProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TableHeader({
  children,
  className,
  "data-testid": testId,
}: TableHeaderProps) {
  const classNames = ["table__header", className].filter(Boolean).join(" ");
  return (
    <Stack as="header" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Table({
  className,
  "data-testid": testId,
  children,
  responsive,
  ariaLabel,
  ...rest
}: TableProps) {
  const classNames = [
    "table",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Stack
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

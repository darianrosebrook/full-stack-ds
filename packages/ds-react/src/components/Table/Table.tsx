// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import "./Table.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface TableProps extends Omit<HTMLAttributes<HTMLDivElement>, "ariaLabel" | "children" | "className" | "data-testid" | "responsive"> {
  responsive?: boolean;
  ariaLabel?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface TableCaptionProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TableCaption({
  children,
  className,
  "data-testid": testId,
}: TableCaptionProps) {
  const classNames = ["table__caption", className].filter(Boolean).join(" ");
  return (
    <caption className={classNames} data-testid={testId}>
      {children}
    </caption>
  );
}

export interface TableHeadProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TableHead({
  children,
  className,
  "data-testid": testId,
}: TableHeadProps) {
  const classNames = ["table__head", className].filter(Boolean).join(" ");
  return (
    <thead className={classNames} data-testid={testId}>
      {children}
    </thead>
  );
}

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
    <tbody className={classNames} data-testid={testId}>
      {children}
    </tbody>
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
    <tfoot className={classNames} data-testid={testId}>
      {children}
    </tfoot>
  );
}

export interface TableRowProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TableRow({
  children,
  className,
  "data-testid": testId,
}: TableRowProps) {
  const classNames = ["table__row", className].filter(Boolean).join(" ");
  return (
    <tr className={classNames} data-testid={testId}>
      {children}
    </tr>
  );
}

export interface TableHeaderCellProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TableHeaderCell({
  children,
  className,
  "data-testid": testId,
}: TableHeaderCellProps) {
  const classNames = ["table__headerCell", className].filter(Boolean).join(" ");
  return (
    <th className={classNames} data-testid={testId}>
      {children}
    </th>
  );
}

export interface TableCellProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TableCell({
  children,
  className,
  "data-testid": testId,
}: TableCellProps) {
  const classNames = ["table__cell", className].filter(Boolean).join(" ");
  return (
    <td className={classNames} data-testid={testId}>
      {children}
    </td>
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
  <div className={`${classNames}`} data-testid={testId} {...rest}>
    <table className="table__container" aria-label={ariaLabel}>
      {children}
    </table>
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

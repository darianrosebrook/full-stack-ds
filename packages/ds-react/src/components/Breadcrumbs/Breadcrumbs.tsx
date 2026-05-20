// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./Breadcrumbs.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, "ariaLabel" | "children" | "className" | "data-testid" | "separator"> {
  ariaLabel?: string;
  separator?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface BreadcrumbsListProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function BreadcrumbsList({
  children,
  className,
  "data-testid": testId,
}: BreadcrumbsListProps) {
  const classNames = ["breadcrumbs__list", className].filter(Boolean).join(" ");
  return (
    <Stack as="ul" variant="horizontal" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Breadcrumbs({
  className,
  "data-testid": testId,
  children,
  ariaLabel = "Breadcrumb",
  separator,
  ...rest
}: BreadcrumbsProps) {
  const classNames = [
    "breadcrumbs",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <nav className={`${classNames}`} aria-label={ariaLabel} data-testid={testId} {...rest}>
    <ol className="breadcrumbs__list">
      {children}
    </ol>
  </nav>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

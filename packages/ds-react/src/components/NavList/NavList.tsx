// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./NavList.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type NavListOrientation = "vertical" | "horizontal";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface NavListProps extends Omit<HTMLAttributes<HTMLElement>, "ariaLabel" | "children" | "className" | "data-testid" | "orientation"> {
  orientation?: NavListOrientation;
  ariaLabel?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface NavListListProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function NavListList({
  children,
  className,
  "data-testid": testId,
}: NavListListProps) {
  const classNames = ["nav-list__list", className].filter(Boolean).join(" ");
  return (
    <Stack as="ul" variant="horizontal" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}

export interface NavListItemProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function NavListItem({
  children,
  className,
  "data-testid": testId,
}: NavListItemProps) {
  const classNames = ["nav-list__item", className].filter(Boolean).join(" ");
  return (
    <Stack as="li" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function NavList({
  orientation = "vertical",
  className,
  "data-testid": testId,
  children,
  ariaLabel,
  ...rest
}: NavListProps) {
  const classNames = [
    "nav-list",
    orientation && `nav-list--${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <Stack layout="native" as="nav" className={`${classNames}`} aria-label={ariaLabel} data-testid={testId} {...rest}>
    <ul className="nav-list__list">
      {children}
    </ul>
  </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

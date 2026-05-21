// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./Shuttle.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface ShuttleProps {
  ariaLabel?: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface ShuttleItemProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function ShuttleItem({
  children,
  className,
  "data-testid": testId,
}: ShuttleItemProps) {
  const classNames = ["shuttle__item", className].filter(Boolean).join(" ");
  return (
    <Stack as="li" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Shuttle({
  className,
  "data-testid": testId,
  children,
  ariaLabel,
  value,
  defaultValue,
  onValueChange,
  ...rest
}: ShuttleProps) {
  const classNames = [
    "shuttle",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Stack
      role="listbox"
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

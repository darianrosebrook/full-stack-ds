// @generated:start imports
import { type ReactNode } from "react";
import "./Label.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface LabelProps {
  htmlFor?: string;
  form?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Label({
  className,
  "data-testid": testId,
  children,
  htmlFor,
  form,
  ...rest
}: LabelProps) {
  const classNames = [
    "label",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <label className={`${classNames}`} htmlFor={htmlFor} form={form} data-testid={testId} {...rest}>
    {children}
  </label>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

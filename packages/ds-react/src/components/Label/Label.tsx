// @generated:start imports
import { type LabelHTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import "./Label.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, "children" | "className" | "data-testid" | "form" | "htmlFor"> {
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
  <Stack layout="native" as="label" className={`${classNames}`} htmlFor={htmlFor} form={form} data-testid={testId} {...rest}>
    {children}
  </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

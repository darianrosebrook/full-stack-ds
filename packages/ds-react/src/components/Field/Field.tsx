// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useField } from "./useField";
import "./Field.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type FieldStatus = "idle" | "validating" | "valid" | "invalid";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface FieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "defaultValue" | "disabled" | "error" | "helpText" | "id" | "label" | "name" | "onChange" | "readOnly" | "required" | "status" | "validate" | "validating" | "value"> {
  name: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  value?: unknown;
  defaultValue?: unknown;
  onChange?: (value: unknown) => void;
  validate?: ((value: unknown, context: { name: string; touched: boolean; dirty: boolean }) => string | string[] | null | Promise<string | string[] | null>);
  label?: ReactNode;
  helpText?: ReactNode;
  error?: string;
  status?: FieldStatus;
  validating?: boolean;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface FieldHeaderProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function FieldHeader({
  children,
  className,
  "data-testid": testId,
}: FieldHeaderProps) {
  const classNames = ["field__header", className].filter(Boolean).join(" ");
  return (
    <Stack as="header" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function Field({
  value: controlledValue,
  defaultValue,
  onChange,
  status,
  disabled,
  className,
  "data-testid": testId,
  children,
  name,
  id,
  required,
  readOnly,
  validate,
  label,
  helpText,
  error,
  validating,
  ...rest
}: FieldProps) {
  const { value, setValue } = useField({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const classNames = [
    "field",
    status && `field--${status}`,
    disabled && "field--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} role="group" data-testid={testId} {...rest}>
    <div className="field__header">
      {label && (
        <label className="field__label">
          {children}
        </label>
      )}
    </div>
    <div className="field__control">
      {children}
    </div>
    <div className="field__meta">
      {helpText && (
        <span className="field__help" />
      )}
      {error && (
        <span className="field__error" />
      )}
      {validating && (
        <span className="field__validatingIndicator" />
      )}
    </div>
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

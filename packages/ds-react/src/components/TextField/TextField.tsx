// @generated:start imports
import { type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useTextField } from "./useTextField";
import "./TextField.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface TextFieldProps {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  invalid?: boolean;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  ariaDescribedby?: string;
  className?: string;
  "data-testid"?: string;
  children?: ReactNode;
}
// @generated:end

// @generated:start subcomponents
export interface TextFieldDescriptionProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function TextFieldDescription({
  children,
  className,
  "data-testid": testId,
}: TextFieldDescriptionProps) {
  const classNames = ["text-field__description", className].filter(Boolean).join(" ");
  return (
    <Stack as="p" className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function TextField({
  value: controlledValue,
  defaultValue,
  onChange,
  invalid,
  disabled,
  className,
  "data-testid": testId,
  children,
  label,
  description,
  error,
  type,
  required,
  name,
  ariaDescribedby,
  ...rest
}: TextFieldProps) {
  const { value, setValue } = useTextField({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const classNames = [
    "text-field",
    invalid && "text-field--invalid",
    disabled && "text-field--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <div className={`${classNames}`} data-testid={testId} {...rest}>
    {label && (
      <label className="text-field__label">
        {children}
      </label>
    )}
    <input className="text-field__field" type={type} value={value} onChange={(e) => setValue(e.target.value)} disabled={disabled} name={name} required={required} aria-invalid={invalid} aria-describedby={ariaDescribedby} />
    {description && (
      <span className="text-field__description">
        {children}
      </span>
    )}
    {error && (
      <span className="text-field__error" role="alert">
        {children}
      </span>
    )}
  </div>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

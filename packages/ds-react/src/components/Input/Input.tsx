// @generated:start imports
import { type InputHTMLAttributes, type ReactNode } from "react";
import { useInput } from "./useInput";
import "./Input.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types

// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "children" | "className" | "data-testid" | "defaultValue" | "disabled" | "invalid" | "name" | "onChange" | "placeholder" | "required" | "type" | "value"> {
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Input({
  value: controlledValue,
  defaultValue,
  onChange,
  disabled,
  invalid,
  className,
  "data-testid": testId,
  type,
  placeholder,
  required,
  name,
  ...rest
}: InputProps) {
  const { value, setValue } = useInput({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const classNames = [
    "input",
    disabled && "input--disabled",
    invalid && "input--invalid",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <input className={`${classNames}`} value={value} onChange={(e) => setValue(e.target.value)} disabled={disabled} aria-invalid={invalid} type={type} role="textbox" data-testid={testId} {...rest} />
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

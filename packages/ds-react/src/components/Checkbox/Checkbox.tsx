// @generated:start imports
import { type ReactNode } from "react";
import { useCheckbox } from "./useCheckbox";
import "./Checkbox.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type CheckboxSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface CheckboxProps {
  size?: CheckboxSize;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  name?: string;
  value?: string;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents

// @generated:end

// @generated:start component
export function Checkbox({
  checked: controlledChecked,
  defaultChecked,
  onChange,
  size = "md",
  disabled,
  className,
  "data-testid": testId,
  indeterminate,
  name,
  value,
  ...rest
}: CheckboxProps) {
  const { checked, setChecked } = useCheckbox({
    checked: controlledChecked,
    defaultChecked,
    onChange,
  });

  const classNames = [
    "checkbox",
    size && `checkbox--${size}`,
    checked && "checkbox--checked",
    disabled && "checkbox--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <input className={`${classNames}`} type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} disabled={disabled} role="checkbox" data-testid={testId} {...rest} />
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

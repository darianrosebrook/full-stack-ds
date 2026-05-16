// @generated:start imports
import { type ReactNode } from "react";
import { useSwitch } from "./useSwitch";
import "./Switch.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type SwitchSize = "sm" | "md" | "lg";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: SwitchSize;
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
export function Switch({
  checked: controlledChecked,
  defaultChecked,
  onChange,
  size = "md",
  disabled,
  className,
  "data-testid": testId,
  name,
  value,
  ...rest
}: SwitchProps) {
  const { checked, setChecked } = useSwitch({
    checked: controlledChecked,
    defaultChecked,
    onChange,
  });

  const classNames = [
    "switch",
    size && `switch--${size}`,
    checked && "switch--checked",
    disabled && "switch--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <label className={`${classNames}`} data-testid={testId} {...rest}>
    <input className="switch__input" type="checkbox" role="switch" checked={checked} onChange={(e) => setChecked(e.target.checked)} disabled={disabled} name={name} value={value} />
    <span className="switch__track" aria-hidden="true">
      <span className="switch__thumb" />
    </span>
  </label>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

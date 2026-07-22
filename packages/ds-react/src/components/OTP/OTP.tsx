// @generated:start imports
import { type HTMLAttributes, type ReactNode } from "react";
import { Stack } from "../../primitives";
import { useOTP } from "./useOTP";
import "./OTP.css";
// @generated:end

// @custom:start imports

// @custom:end

// @generated:start types
export type OTPMode = "numeric" | "alphanumeric";
// @generated:end

// @custom:start types

// @custom:end

// @generated:start props
export interface OTPProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "data-testid" | "defaultValue" | "disabled" | "label" | "length" | "mode" | "onChange" | "onComplete" | "readOnly" | "value"> {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  mode?: OTPMode;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  className?: string;
  "data-testid"?: string;
}
// @generated:end

// @generated:start subcomponents
export interface OTPGroupProps {
  children?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

export function OTPGroup({
  children,
  className,
  "data-testid": testId,
}: OTPGroupProps) {
  const classNames = ["otp__group", className].filter(Boolean).join(" ");
  return (
    <Stack className={classNames} data-testid={testId}>
      {children}
    </Stack>
  );
}
// @generated:end

// @generated:start component
export function OTP({
  value: controlledValue,
  defaultValue,
  onChange,
  mode = "numeric",
  disabled,
  className,
  "data-testid": testId,
  length = 6,
  onComplete,
  readOnly,
  label = "One-time password",
  ...rest
}: OTPProps) {
  const { value, setValue } = useOTP({
    value: controlledValue,
    defaultValue,
    onChange,
  });

  const classNames = [
    "otp",
    mode && `otp--${mode}`,
    disabled && "otp--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
  <Stack layout="native" className={`${classNames}`} role="group" aria-label={label} aria-describedby={"otp-error-id"} data-testid={testId} {...rest}>
    <div className="otp__group">
      {Array.from({ length: length }, (_, index) => <input className="otp__field" type="text" inputMode="numeric" autoComplete="one-time-code" maxLength={1} onInput={(e) => setValue(String(value ?? '').padEnd(index, ' ').slice(0, index) + String(e.currentTarget.value ?? '').slice(-1) + String(value ?? '').slice(index + 1))} disabled={disabled} aria-readonly={readOnly} data-otp-index={index} key={index} />)}
    </div>
  </Stack>
  );
}
// @generated:end

// @custom:start trailing

// @custom:end

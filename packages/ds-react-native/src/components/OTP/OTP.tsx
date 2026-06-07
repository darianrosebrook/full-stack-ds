// @generated:start imports
import { StyleProp, TextInput, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createOTPStyles } from "./OTP.styles";
// @generated:end

// @generated:start types
export type OTPMode = "numeric" | "alphanumeric";
// @generated:end

// @generated:start props
export interface OTPProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  mode?: OTPMode;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function OTP({
  length = 6,
  value: controlledValue,
  defaultValue,
  onChange,
  onComplete,
  mode = "numeric",
  disabled,
  readOnly,
  label = "One-time password",
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: OTPProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createOTPStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledValue, setUncontrolledValue] = useState<string>((defaultValue ?? "") as string);
  const value = controlledValue ?? uncontrolledValue;
  const setValueValue = useCallback((next: string) => {
    if (controlledValue === undefined) setUncontrolledValue(next);
    onChange?.(next);
  }, [controlledValue, onChange]);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={label}
    >
      <View
        style={styles.group}
      >
        {Array.from({ length: Number(length ?? 0) }).map((_, index) => (
            <TextInput
              style={styles.field}
              editable={!disabled}
              accessibilityState={{ disabled: disabled }}
            />
          ))}
      </View>
    </View>
  );
}
// @generated:end

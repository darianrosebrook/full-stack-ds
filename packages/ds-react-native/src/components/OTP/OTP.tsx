// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { TextInput, View } from "react-native";
import { type ReactNode, useMemo } from "react";
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
  disabled,
  readOnly,
  label = "One-time password",
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: OTPProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createOTPStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      <View
        style={styles.group}
      >
        {Array.from({ length: Number(length ?? 0) }).map((_, index) => (
            <TextInput
              key={index}
              style={styles.field}
              editable={!(disabled || Boolean(readOnly))}
              readOnly={Boolean(readOnly)}
              accessibilityState={{ disabled: disabled }}
            />
          ))}
      </View>
    </View>
  );
}
// @generated:end

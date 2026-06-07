// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Text as RNText, TextInput, View } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createTextFieldStyles } from "./TextField.styles";
// @generated:end

// @generated:start types

// @generated:end

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
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function TextField({
  label,
  description,
  error,
  type,
  value: controlledValue,
  disabled,
  defaultValue = "",
  onChange,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: TextFieldProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createTextFieldStyles(fsdsTheme), [fsdsTheme]);
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
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      {label ? (
      <View
        style={styles.label}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
      ) : null}
      <TextInput
        style={styles.field}
        secureTextEntry={type === "password"}
        value={String(value ?? "")}
        editable={!(disabled)}
        onChangeText={(next: string) => setValueValue(next)}
        accessibilityState={{ disabled: disabled }}
      />
      {description ? (
      <View
        style={styles.description}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
      ) : null}
      {error ? (
      <View
        style={styles.error}
        accessibilityRole="alert"
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
      ) : null}
    </View>
  );
}
// @generated:end

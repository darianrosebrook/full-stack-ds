// @generated:start imports
import { StyleProp, Text as RNText, TextInput, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createInputStyles } from "./Input.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface InputProps {
  type?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  name?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Input({
  type,
  value: controlledValue,
  defaultValue,
  onChange,
  placeholder,
  disabled,
  invalid,
  required,
  name,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: InputProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createInputStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledValue, setUncontrolledValue] = useState<string>((defaultValue ?? "") as string);
  const value = controlledValue ?? uncontrolledValue;
  const setValueValue = useCallback((next: string) => {
    if (controlledValue === undefined) setUncontrolledValue(next);
    onChange?.(next);
  }, [controlledValue, onChange]);

  return (
    <TextInput
      testID={testID}
      style={[styles.root, style]}
      value={String(value ?? "")}
      editable={!disabled}
      secureTextEntry={type === "password"}
      placeholder={placeholder}
      onChangeText={(next: string) => setValueValue(next)}
      accessibilityState={{ disabled: disabled }}
    />
  );
}
// @generated:end

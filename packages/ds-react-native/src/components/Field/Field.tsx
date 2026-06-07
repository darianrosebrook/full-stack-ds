// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createFieldStyles } from "./Field.styles";
// @generated:end

// @generated:start types
export type FieldStatus = "idle" | "validating" | "valid" | "invalid";
// @generated:end

// @generated:start props
export interface FieldProps {
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
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Field({
  name,
  id,
  required,
  disabled,
  readOnly,
  value: controlledValue,
  defaultValue,
  onChange,
  validate,
  label,
  helpText,
  error,
  status,
  validating,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: FieldProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createFieldStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledValue, setUncontrolledValue] = useState<unknown>((defaultValue ?? undefined) as unknown);
  const value = controlledValue ?? uncontrolledValue;
  const setValueValue = useCallback((next: unknown) => {
    if (controlledValue === undefined) setUncontrolledValue(next);
    onChange?.(next);
  }, [controlledValue, onChange]);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      <View
        style={styles.header}
      >
        <View
          style={styles.label}
        >
          {typeof children === "string" ? <RNText>{children}</RNText> : children}
        </View>
      </View>
      <View
        style={styles.control}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
      <View
        style={styles.meta}
      >
        <View
          style={styles.help}
        />
        <View
          style={styles.error}
        />
        <View
          style={styles.validatingIndicator}
        />
      </View>
    </View>
  );
}
// @generated:end

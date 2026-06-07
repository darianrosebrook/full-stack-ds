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
    <View testID={testID} style={[styles.root, style]}>
      {label ? (
        <RNText nativeID={id ? `${id}-label` : undefined} style={styles.label}>
          {label}
        </RNText>
      ) : null}
      <View style={styles.control}>
        {children}
      </View>
      {helpText || error || validating ? (
        <View style={styles.meta}>
          {helpText ? <RNText style={styles.help}>{helpText}</RNText> : null}
          {error ? <RNText accessibilityRole="alert" style={styles.error}>{error}</RNText> : null}
          {validating ? <RNText style={styles.validatingIndicator}>Validating</RNText> : null}
        </View>
      ) : null}
    </View>
  );
}
// @generated:end

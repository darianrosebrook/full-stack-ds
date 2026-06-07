// @generated:start imports
import { StyleProp, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createSpinnerStyles } from "./Spinner.styles";
// @generated:end

// @generated:start types
export type SpinnerSize = "xs" | "sm" | "md" | "lg";
export type SpinnerThickness = "hairline" | "regular" | "bold";
// @generated:end

// @generated:start props
export interface SpinnerProps {
  size?: SpinnerSize;
  thickness?: SpinnerThickness;
  ariaHidden?: boolean;
  label?: string;
  inline?: boolean;
  showAfterMs?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Spinner({
  size,
  thickness,
  ariaHidden,
  label,
  inline,
  showAfterMs,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: SpinnerProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createSpinnerStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      <View
        style={styles.visual}
        accessible={false}
      />
    </View>
  );
}
// @generated:end

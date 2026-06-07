// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createStatusStyles } from "./Status.styles";
// @generated:end

// @generated:start types
export type StatusIntent = "info" | "success" | "warning" | "danger" | "error";
// @generated:end

// @generated:start props
export interface StatusProps {
  status: StatusIntent;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Status({
  status,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: StatusProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createStatusStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      <View
        style={styles.icon}
        accessible={false}
      />
      <View
        style={styles.label}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
    </View>
  );
}
// @generated:end

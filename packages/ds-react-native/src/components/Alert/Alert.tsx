// @generated:start imports
import { Pressable, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createAlertStyles } from "./Alert.styles";
// @generated:end

// @generated:start types
export type AlertIntent = "info" | "success" | "warning" | "danger";
export type AlertLevel = "inline" | "section" | "page";
// @generated:end

// @generated:start props
export interface AlertProps {
  intent?: AlertIntent;
  level?: AlertLevel;
  dismissible?: boolean;
  onDismiss?: () => void;
  dismissLabel?: string;
  icon?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Alert({
  intent,
  level,
  dismissible,
  onDismiss,
  dismissLabel = "Dismiss",
  icon,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: AlertProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createAlertStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityRole="alert"
    >
      <View
        style={styles.icon}
        accessible={false}
      >
        <RNText>{icon}</RNText>
      </View>
      {typeof children === "string" ? <RNText>{children}</RNText> : children}
      <Pressable
        style={styles.dismiss}
        accessibilityLabel={dismissLabel}
        onPress={() => undefined}
        accessibilityRole="button"
      />
    </View>
  );
}
// @generated:end

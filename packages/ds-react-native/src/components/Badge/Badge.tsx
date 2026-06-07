// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createBadgeStyles } from "./Badge.styles";
// @generated:end

// @generated:start types
export type BadgeVariant = "default" | "status" | "counter" | "tag";
export type BadgeIntent = "info" | "success" | "warning" | "danger";
export type BadgeSize = "sm" | "md" | "lg";
// @generated:end

// @generated:start props
export interface BadgeProps {
  variant?: BadgeVariant;
  intent?: BadgeIntent;
  size?: BadgeSize;
  icon?: ReactNode;
  showStatusIcon?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Badge({
  variant,
  intent,
  size,
  icon,
  showStatusIcon,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: BadgeProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createBadgeStyles(fsdsTheme), [fsdsTheme]);
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
        style={styles.content}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
    </View>
  );
}
// @generated:end

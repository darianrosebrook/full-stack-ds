// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Text as RNText, View } from "react-native";
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
  const variantStyleForStatus = status !== undefined ? ({ "info": styles.root_variant_info, "success": styles.root_variant_success, "warning": styles.root_variant_warning, "danger": styles.root_variant_danger, "error": styles.root_variant_error } as Record<string, ViewStyle | undefined>)[status] : undefined;
  return (
    <View
      testID={testID}
      style={[styles.root, variantStyleForStatus, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
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

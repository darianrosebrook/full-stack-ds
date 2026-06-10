// @generated:start imports
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Pressable, Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createAlertNoticeStyles } from "./AlertNotice.styles";
// @generated:end

// @generated:start types
export type AlertNoticeStatus = "info" | "success" | "warning" | "error";
export type AlertNoticeLevel = "page" | "section" | "inline";
// @generated:end

// @generated:start props
export interface AlertNoticeProps {
  status?: AlertNoticeStatus;
  level?: AlertNoticeLevel;
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
export function AlertNotice({
  status,
  dismissible,
  onDismiss,
  dismissLabel = "Dismiss",
  icon,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: AlertNoticeProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createAlertNoticeStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForStatus = status !== undefined ? ({ "info": styles.root_variant_info, "success": styles.root_variant_success, "warning": styles.root_variant_warning, "error": styles.root_variant_error } as Record<string, ViewStyle | undefined>)[status] : undefined;
  const textVariantStyleForStatus = status !== undefined ? ({ "info": styles.rootText_variant_info, "success": styles.rootText_variant_success, "warning": styles.rootText_variant_warning, "error": styles.rootText_variant_error } as Record<string, TextStyle | undefined>)[status] : undefined;
  return (
    <View
      testID={testID}
      style={[styles.root, variantStyleForStatus, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
      accessibilityRole="alert"
    >
      {icon ? (
      <View
        style={styles.icon}
        accessible={false}
      >
        <RNText>{icon}</RNText>
      </View>
      ) : null}
      {typeof children === "string" ? <RNText style={[styles.rootText, textVariantStyleForStatus]}>{children}</RNText> : children}
      {dismissible ? (
      <Pressable
        style={styles.dismiss}
        accessibilityLabel={dismissLabel}
        onPress={() => onDismiss?.()}
        accessibilityRole="button"
      />
      ) : null}
    </View>
  );
}
// @generated:end

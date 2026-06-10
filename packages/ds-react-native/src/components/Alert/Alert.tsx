// @generated:start imports
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Pressable, Text as RNText, View } from "react-native";
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
  const variantStyleForIntent = intent !== undefined ? ({ "info": styles.root_variant_info, "success": styles.root_variant_success, "warning": styles.root_variant_warning, "danger": styles.root_variant_danger } as Record<string, ViewStyle | undefined>)[intent] : undefined;
  const textVariantStyleForIntent = intent !== undefined ? ({ "info": styles.rootText_variant_info, "success": styles.rootText_variant_success, "warning": styles.rootText_variant_warning, "danger": styles.rootText_variant_danger } as Record<string, TextStyle | undefined>)[intent] : undefined;
  return (
    <View
      testID={testID}
      style={[styles.root, variantStyleForIntent, style]}
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
      {typeof children === "string" ? <RNText style={[styles.rootText, textVariantStyleForIntent]}>{children}</RNText> : children}
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

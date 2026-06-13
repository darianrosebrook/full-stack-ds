// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Text as RNText, View } from "react-native";
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
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: BadgeProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createBadgeStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForVariant = variant !== undefined ? ({ "counter": styles.root_variant_counter, "tag": styles.root_variant_tag } as Record<string, ViewStyle | undefined>)[variant] : undefined;
  const variantStyleForIntent = intent !== undefined ? ({ "info": styles.root_variant_info, "success": styles.root_variant_success, "warning": styles.root_variant_warning, "danger": styles.root_variant_danger } as Record<string, ViewStyle | undefined>)[intent] : undefined;
  const variantStyleForSize = size !== undefined ? ({ "sm": styles.root_variant_sm, "md": styles.root_variant_md, "lg": styles.root_variant_lg } as Record<string, ViewStyle | undefined>)[size] : undefined;
  return (
    <View
      testID={testID}
      style={[styles.root, variantStyleForVariant, variantStyleForIntent, variantStyleForSize, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      {icon ? (
      <View
        style={styles.icon}
        accessible={false}
      />
      ) : null}
      <View
        style={styles.content}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
    </View>
  );
}
// @generated:end

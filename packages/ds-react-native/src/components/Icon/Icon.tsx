// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createIconStyles } from "./Icon.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface IconProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Icon({
  size = "md",
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: IconProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createIconStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForSize = size !== undefined ? ({ "sm": styles.root_variant_sm, "md": styles.root_variant_md, "lg": styles.root_variant_lg, "xl": styles.root_variant_xl } as Record<string, ViewStyle | undefined>)[size] : undefined;
  return (
    <View
      testID={testID}
      style={[styles.root, variantStyleForSize, style]}
      accessible={false}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      <View
        style={styles.root}
      />
    </View>
  );
}
// @generated:end

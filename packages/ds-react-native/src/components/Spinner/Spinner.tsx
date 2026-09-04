// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
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
  ariaHidden,
  label,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: SpinnerProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createSpinnerStyles(fsdsTheme), [fsdsTheme]);
  const visualStyleForSize = size !== undefined ? ({ "xs": styles.visual_variant_xs, "sm": styles.visual_variant_sm, "md": styles.visual_variant_md, "lg": styles.visual_variant_lg } as Record<string, ViewStyle | undefined>)[size] : undefined;
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel ?? label}
      accessible={!(String(ariaHidden) === "true")}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      <View
        style={[styles.visual, visualStyleForSize]}
        accessible={false}
      />
    </View>
  );
}
// @generated:end

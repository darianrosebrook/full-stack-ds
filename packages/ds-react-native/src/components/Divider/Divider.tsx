// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createDividerStyles } from "./Divider.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface DividerProps {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  thickness?: string;
  title?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Divider({
  orientation,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: DividerProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createDividerStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForOrientation = orientation !== undefined ? ({ "vertical": styles.root_variant_vertical } as Record<string, ViewStyle | undefined>)[orientation] : undefined;
  return (
    <View
      testID={testID}
      style={[styles.root, variantStyleForOrientation, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      {typeof children === "string" ? <RNText>{children}</RNText> : children}
    </View>
  );
}
// @generated:end

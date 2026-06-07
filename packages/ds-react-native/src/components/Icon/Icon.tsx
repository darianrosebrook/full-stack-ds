// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createIconStyles } from "./Icon.styles";
// @generated:end

// @generated:start types
export type IconDefinition = { iconName: string; prefix?: string; icon?: unknown };
// @generated:end

// @generated:start props
export interface IconProps {
  icon: IconDefinition;
  width?: number;
  height?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Icon({
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: IconProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createIconStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessible={false}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      {typeof children === "string" ? <RNText>{children}</RNText> : children}
    </View>
  );
}
// @generated:end

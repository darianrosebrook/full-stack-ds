// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createStatStyles } from "./Stat.styles";
// @generated:end

// @generated:start types
export type StatSize = "sm" | "md" | "lg";
export type StatTrend = "up" | "down" | "neutral";
// @generated:end

// @generated:start props
export interface StatProps {
  size?: StatSize;
  trend?: StatTrend;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Stat({
  size = "md",
  trend,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: StatProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createStatStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      {typeof children === "string" ? <RNText>{children}</RNText> : children}
    </View>
  );
}
// @generated:end

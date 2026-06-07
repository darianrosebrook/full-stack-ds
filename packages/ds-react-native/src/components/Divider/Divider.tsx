// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
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
  decorative,
  thickness,
  title,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: DividerProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createDividerStyles(fsdsTheme), [fsdsTheme]);
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

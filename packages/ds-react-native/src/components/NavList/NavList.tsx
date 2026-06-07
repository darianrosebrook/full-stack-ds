// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createNavListStyles } from "./NavList.styles";
// @generated:end

// @generated:start types
export type NavListOrientation = "vertical" | "horizontal";
// @generated:end

// @generated:start props
export interface NavListProps {
  orientation?: NavListOrientation;
  ariaLabel?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function NavList({
  orientation = "vertical",
  ariaLabel,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: NavListProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createNavListStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={ariaLabel}
    >
      <View
        style={styles.list}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
    </View>
  );
}
// @generated:end

// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createBreadcrumbsStyles } from "./Breadcrumbs.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface BreadcrumbsProps {
  ariaLabel?: string;
  separator?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Breadcrumbs({
  ariaLabel = "Breadcrumb",
  separator,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: BreadcrumbsProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createBreadcrumbsStyles(fsdsTheme), [fsdsTheme]);
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

// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createTableStyles } from "./Table.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface TableProps {
  responsive?: boolean;
  ariaLabel?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Table({
  responsive,
  ariaLabel,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: TableProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createTableStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      <View
        style={styles.container}
        accessibilityLabel={ariaLabel}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
    </View>
  );
}
// @generated:end

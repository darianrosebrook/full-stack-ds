// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createBlockquoteStyles } from "./Blockquote.styles";
// @generated:end

// @generated:start types
export type BlockquoteVariant = "default" | "bordered" | "highlighted";
export type BlockquoteSize = "sm" | "md" | "lg";
// @generated:end

// @generated:start props
export interface BlockquoteProps {
  cite?: string;
  variant?: BlockquoteVariant;
  size?: BlockquoteSize;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Blockquote({
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: BlockquoteProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createBlockquoteStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      {typeof children === "string" ? <RNText style={styles.rootText}>{children}</RNText> : children}
    </View>
  );
}
// @generated:end

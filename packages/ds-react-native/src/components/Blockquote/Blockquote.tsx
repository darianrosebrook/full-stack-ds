// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
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
  cite,
  variant,
  size,
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
    >
      {typeof children === "string" ? <RNText>{children}</RNText> : children}
    </View>
  );
}
// @generated:end

// @generated:start imports
import type { StyleProp, TextStyle } from "react-native";
import { Text as RNText } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createTextStyles } from "./Text.styles";
// @generated:end

// @generated:start types
export type TextElement = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type TextVariant = "display" | "headline" | "title" | "body" | "caption" | "overline" | "code";
export type TextSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
export type TextWeight = "light" | "normal" | "medium" | "semibold" | "bold";
export type TextAlign = "left" | "center" | "right" | "justify";
export type TextTransform = "none" | "uppercase" | "lowercase" | "capitalize";
// @generated:end

// @generated:start props
export interface TextProps {
  as?: TextElement;
  variant?: TextVariant;
  size?: TextSize;
  weight?: TextWeight;
  align?: TextAlign;
  transform?: TextTransform;
  truncate?: boolean;
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Text({
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: TextProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createTextStyles(fsdsTheme), [fsdsTheme]);
  return (
    <RNText
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
      accessibilityRole="text"
    >
      {children}
    </RNText>
  );
}
// @generated:end

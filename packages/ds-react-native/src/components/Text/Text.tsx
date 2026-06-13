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
  variant,
  size,
  weight,
  align,
  transform,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: TextProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createTextStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForVariant = variant !== undefined ? ({ "display": styles.root_variant_display, "headline": styles.root_variant_headline, "title": styles.root_variant_title, "body": styles.root_variant_body, "caption": styles.root_variant_caption, "overline": styles.root_variant_overline, "code": styles.root_variant_code } as Record<string, TextStyle | undefined>)[variant] : undefined;
  const variantStyleForSize = size !== undefined ? ({ "xs": styles.root_variant_xs, "sm": styles.root_variant_sm, "md": styles.root_variant_md, "lg": styles.root_variant_lg, "xl": styles.root_variant_xl, "2xl": styles.root_variant_2xl, "3xl": styles.root_variant_3xl } as Record<string, TextStyle | undefined>)[size] : undefined;
  const variantStyleForWeight = weight !== undefined ? ({ "light": styles.root_variant_light, "normal": styles.root_variant_normal, "medium": styles.root_variant_medium, "semibold": styles.root_variant_semibold, "bold": styles.root_variant_bold } as Record<string, TextStyle | undefined>)[weight] : undefined;
  const variantStyleForAlign = align !== undefined ? ({ "left": styles.root_variant_left, "center": styles.root_variant_center, "right": styles.root_variant_right, "justify": styles.root_variant_justify } as Record<string, TextStyle | undefined>)[align] : undefined;
  const variantStyleForTransform = transform !== undefined ? ({ "uppercase": styles.root_variant_uppercase, "lowercase": styles.root_variant_lowercase, "capitalize": styles.root_variant_capitalize } as Record<string, TextStyle | undefined>)[transform] : undefined;
  return (
    <RNText
      testID={testID}
      style={[styles.root, variantStyleForVariant, variantStyleForSize, variantStyleForWeight, variantStyleForAlign, variantStyleForTransform, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
      accessibilityRole="text"
    >
      {children}
    </RNText>
  );
}
// @generated:end

// @generated:start imports
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Linking, Pressable, Text as RNText } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createLinksStyles } from "./Links.styles";
// @generated:end

// @generated:start types
export type LinkTarget = "_self" | "_blank" | "_parent" | "_top";
export type LinkSize = "small" | "medium" | "large";
// @generated:end

// @generated:start props
export interface LinksProps {
  href?: string;
  target?: LinkTarget;
  rel?: string;
  size?: LinkSize;
  disabled?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Links({
  href,
  size,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: LinksProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createLinksStyles(fsdsTheme), [fsdsTheme]);
  const textVariantStyleForSize = size !== undefined ? ({ "small": styles.rootText_variant_small, "medium": styles.rootText_variant_medium, "large": styles.rootText_variant_large } as Record<string, TextStyle | undefined>)[size] : undefined;
  return (
    <Pressable
      testID={testID}
      style={[styles.root, style]}
      onPress={() => { if (href) void Linking.openURL(String(href)); }}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
      accessibilityRole="link"
    >
      {typeof children === "string" ? <RNText style={[styles.rootText, textVariantStyleForSize]}>{children}</RNText> : children}
    </Pressable>
  );
}
// @generated:end

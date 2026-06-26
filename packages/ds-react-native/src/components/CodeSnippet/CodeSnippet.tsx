// @generated:start imports
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createCodeSnippetStyles } from "./CodeSnippet.styles";
// @generated:end

// @generated:start types
export type CodeSnippetElement = "code" | "kbd" | "samp";
// @generated:end

// @generated:start props
export interface CodeSnippetProps {
  text: string;
  as?: CodeSnippetElement;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function CodeSnippet({
  text,
  as = "code",
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: CodeSnippetProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createCodeSnippetStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForAs = as !== undefined ? ({ "samp": styles.root_variant_samp } as Record<string, ViewStyle | undefined>)[as] : undefined;
  const textVariantStyleForAs = as !== undefined ? ({ "kbd": styles.rootText_variant_kbd } as Record<string, TextStyle | undefined>)[as] : undefined;
  return (
    <View
      testID={testID}
      style={[styles.root, variantStyleForAs, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      <RNText style={[styles.rootText, textVariantStyleForAs]}>{text}</RNText>
    </View>
  );
}
// @generated:end

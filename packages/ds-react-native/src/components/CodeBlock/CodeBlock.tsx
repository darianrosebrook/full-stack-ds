// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createCodeBlockStyles } from "./CodeBlock.styles";
// @generated:end

// @generated:start types
export type CodeBlockLanguage = "bash" | "css" | "html" | "javascript" | "json" | "jsx" | "markdown" | "plaintext" | "tsx" | "typescript";
// @generated:end

// @generated:start props
export interface CodeBlockProps {
  code: string;
  language: CodeBlockLanguage;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function CodeBlock({
  code,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: CodeBlockProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createCodeBlockStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      <View
        style={styles.code}
      >
        <RNText>{code}</RNText>
      </View>
    </View>
  );
}
// @generated:end

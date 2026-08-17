// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createMarkdownStyles } from "./Markdown.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface MarkdownProps {
  content: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Markdown({
  content,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: MarkdownProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createMarkdownStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      <RNText style={styles.rootText}>{content}</RNText>
    </View>
  );
}
// @generated:end

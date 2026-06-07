// @generated:start imports
import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";
import { Pressable, Text as RNText } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createButtonStyles } from "./Button.styles";
// @generated:end

// @generated:start types
export type ButtonSize = "small" | "medium" | "large";
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "destructive" | "outline";
export type ButtonType = "button" | "submit" | "reset";
// @generated:end

// @generated:start props
export interface ButtonProps {
  size?: ButtonSize;
  variant?: ButtonVariant;
  type?: ButtonType;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  title?: string;
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Button({
  loading,
  disabled,
  ariaLabel,
  ariaExpanded,
  children,
  onPress,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ButtonProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createButtonStyles(fsdsTheme), [fsdsTheme]);
  return (
    <Pressable
      testID={testID}
      style={[styles.root, style]}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? ariaLabel}
      onPress={onPress}
      accessibilityLabelledBy={accessibilityLabelledBy}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled, expanded: Boolean(ariaExpanded), busy: Boolean(loading) }}
    >
      {typeof children === "string" ? <RNText>{children}</RNText> : children}
    </Pressable>
  );
}
// @generated:end

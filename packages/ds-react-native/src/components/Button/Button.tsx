// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, Text as RNText, View } from "react-native";
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
  onClick?: () => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Button({
  size = "medium",
  variant = "primary",
  loading,
  disabled,
  ariaLabel,
  ariaExpanded,
  ariaPressed,
  onClick,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ButtonProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createButtonStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForSize = size !== undefined ? ({ "small": styles.root_variant_small, "medium": styles.root_variant_medium, "large": styles.root_variant_large } as Record<string, ViewStyle | undefined>)[size] : undefined;
  const variantStyleForVariant = variant !== undefined ? ({ "primary": styles.root_variant_primary, "secondary": styles.root_variant_secondary, "tertiary": styles.root_variant_tertiary, "ghost": styles.root_variant_ghost, "destructive": styles.root_variant_destructive, "outline": styles.root_variant_outline } as Record<string, ViewStyle | undefined>)[variant] : undefined;
  const pressedStyleForVariant = variant !== undefined ? ({ "primary": styles.root_variant_primary_pressed, "secondary": styles.root_variant_secondary_pressed, "destructive": styles.root_variant_destructive_pressed } as Record<string, ViewStyle | undefined>)[variant] : undefined;
  const disabledStyleForVariant = variant !== undefined ? ({ "primary": styles.root_variant_primary_disabled, "secondary": styles.root_variant_secondary_disabled, "destructive": styles.root_variant_destructive_disabled } as Record<string, ViewStyle | undefined>)[variant] : undefined;
  const spinnerStyleForSize = size !== undefined ? ({ "small": styles.spinner_variant_small, "medium": styles.spinner_variant_medium, "large": styles.spinner_variant_large } as Record<string, ViewStyle | undefined>)[size] : undefined;
  return (
    <Pressable
      testID={testID}
      style={({ pressed }) => [styles.root, variantStyleForSize, variantStyleForVariant, pressed ? styles.root_state_pressed : undefined, pressed ? pressedStyleForVariant : undefined, disabled ? styles.root_state_disabled : undefined, disabled ? disabledStyleForVariant : undefined, style]}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? ariaLabel}
      onPress={() => onClick?.()}
      accessibilityLabelledBy={accessibilityLabelledBy}
      accessibilityRole="togglebutton"
      accessibilityState={{ disabled: disabled, expanded: String(ariaExpanded) === "true", selected: String(ariaPressed) === "true", busy: String(loading) === "true" }}
    >
      {loading ? (
      <View
        style={[styles.spinner, spinnerStyleForSize]}
        accessible={false}
      />
      ) : null}
      <View
        style={styles.loadingText}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
    </Pressable>
  );
}
// @generated:end

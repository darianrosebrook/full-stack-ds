// @generated:start imports
import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";
import { Pressable, Text as RNText, View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createChipStyles } from "./Chip.styles";
// @generated:end

// @generated:start types
export type ChipType = "button" | "submit" | "reset";
export type ChipVariant = "default" | "selected" | "dismissible";
export type ChipSize = "small" | "medium" | "large";
// @generated:end

// @generated:start props
export interface ChipProps {
  type?: ChipType;
  variant?: ChipVariant;
  size?: ChipSize;
  disabled?: boolean;
  icon?: ReactNode;
  title?: string;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaPressed?: boolean;
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Chip({
  variant,
  size,
  disabled,
  icon,
  ariaLabel,
  ariaExpanded,
  ariaPressed,
  children,
  onPress,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ChipProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createChipStyles(fsdsTheme), [fsdsTheme]);
  const variantStyleForVariant = variant !== undefined ? ({ "selected": styles.root_variant_selected } as Record<string, ViewStyle | undefined>)[variant] : undefined;
  const variantStyleForSize = size !== undefined ? ({ "small": styles.root_variant_small, "medium": styles.root_variant_medium, "large": styles.root_variant_large } as Record<string, ViewStyle | undefined>)[size] : undefined;
  return (
    <Pressable
      testID={testID}
      style={({ pressed }) => [styles.root, variantStyleForVariant, variantStyleForSize, pressed ? styles.root_state_pressed : undefined, style]}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel ?? ariaLabel}
      onPress={onPress}
      accessibilityLabelledBy={accessibilityLabelledBy}
      accessibilityRole="togglebutton"
      accessibilityState={{ disabled: disabled, expanded: Boolean(ariaExpanded), selected: Boolean(ariaPressed) }}
    >
      {icon ? (
      <View
        style={styles.icon}
        accessible={false}
      />
      ) : null}
      <View
        style={styles.text}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
    </Pressable>
  );
}
// @generated:end

// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createPopoverStyles } from "./Popover.styles";
// @generated:end

// @generated:start types
export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end

// @generated:start props
export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnBlur?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Popover({
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: PopoverProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createPopoverStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      {children}
    </View>
  );
}
// @generated:end

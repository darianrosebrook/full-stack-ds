// @generated:start imports
import { StyleProp, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
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
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  placement,
  disabled,
  closeOnEscape = true,
  closeOnOutsideClick = true,
  closeOnBlur = true,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: PopoverProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createPopoverStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>((defaultOpen ?? false) as boolean);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpenValue = useCallback((next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [controlledOpen, onOpenChange]);

  return (
    <View testID={testID} style={[styles.root, style]}>{children}</View>
  );
}
// @generated:end

// @generated:start imports
import { StyleProp, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createTooltipStyles } from "./Tooltip.styles";
// @generated:end

// @generated:start types
export type TooltipPlacement = "top" | "bottom" | "left" | "right" | "auto";
// @generated:end

// @generated:start props
export interface TooltipProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  disabled?: boolean;
  closeOnEscape?: boolean;
  closeOnBlur?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Tooltip({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  placement,
  disabled,
  closeOnEscape = true,
  closeOnBlur = true,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: TooltipProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createTooltipStyles(fsdsTheme), [fsdsTheme]);
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

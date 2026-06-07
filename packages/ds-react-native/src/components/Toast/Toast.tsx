// @generated:start imports
import { Pressable, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createToastStyles } from "./Toast.styles";
// @generated:end

// @generated:start types
export type ToastVariant = "info" | "success" | "warning" | "error";
export type ToastPoliteness = "polite" | "assertive";
// @generated:end

// @generated:start props
export interface ToastProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  variant?: ToastVariant;
  politeness?: ToastPoliteness;
  action?: unknown;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Toast({
  open: controlledOpen,
  onOpenChange,
  title,
  variant = "info",
  politeness = "polite",
  action,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ToastProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createToastStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>((false) as boolean);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpenValue = useCallback((next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [controlledOpen, onOpenChange]);

  return (
    <View
      testID={testID}
      style={[styles.viewport, style]}
    >
      <View
        style={styles.item}
      >
        <View
          style={styles.row}
        >
          <View
            style={styles.title}
          />
          <View
            style={styles.description}
          >
            {typeof children === "string" ? <RNText>{children}</RNText> : children}
          </View>
          <View
            style={styles.action}
          />
          <Pressable
            style={styles.close}
            accessibilityRole="button"
          />
        </View>
      </View>
    </View>
  );
}
// @generated:end

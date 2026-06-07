// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, Text as RNText, View } from "react-native";
import { type ReactNode, useMemo, useState } from "react";
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
  title,
  action,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ToastProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createToastStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledOpen] = useState<boolean>((false) as boolean);
  const open = controlledOpen ?? uncontrolledOpen;

  return (
    <View
      testID={testID}
      style={[styles.viewport, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      {open ? (
      <View
        style={styles.item}
      >
        <View
          style={styles.row}
        >
          {title ? (
          <View
            style={styles.title}
          />
          ) : null}
          <View
            style={styles.description}
          >
            {typeof children === "string" ? <RNText>{children}</RNText> : children}
          </View>
          {action ? (
          <View
            style={styles.action}
          />
          ) : null}
          <Pressable
            style={styles.close}
            accessibilityRole="button"
          />
        </View>
      </View>
      ) : null}
    </View>
  );
}
// @generated:end

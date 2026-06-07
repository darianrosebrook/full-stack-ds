// @generated:start imports
import { Pressable, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createDialogStyles } from "./Dialog.styles";
// @generated:end

// @generated:start types
export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";
// @generated:end

// @generated:start props
export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  size?: DialogSize;
  dismissible?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  initialFocus?: string;
  returnFocus?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Dialog({
  open: controlledOpenness,
  defaultOpen,
  onOpenChange,
  modal = true,
  size = "md",
  dismissible = true,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  initialFocus,
  returnFocus,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: DialogProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createDialogStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledOpenness, setUncontrolledOpenness] = useState<boolean>((defaultOpen ?? false) as boolean);
  const openness = controlledOpenness ?? uncontrolledOpenness;
  const setOpennessValue = useCallback((next: boolean) => {
    if (controlledOpenness === undefined) setUncontrolledOpenness(next);
    onOpenChange?.(next);
  }, [controlledOpenness, onOpenChange]);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      <View
        style={styles.backdrop}
        accessible={false}
      />
      <View
        style={styles.modal}
        accessibilityLabelledBy={"dialog-title-id"}
      >
        <View
          style={styles.header}
        >
          <View
            style={styles.title}
          >
            {typeof children === "string" ? <RNText>{children}</RNText> : children}
          </View>
          <Pressable
            style={styles.closeButton}
            accessibilityRole="button"
          />
        </View>
        <View
          style={styles.body}
        >
          {typeof children === "string" ? <RNText>{children}</RNText> : children}
        </View>
        <View
          style={styles.footer}
        />
      </View>
    </View>
  );
}
// @generated:end

// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Modal, Pressable, Text as RNText, View } from "react-native";
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
  slots?: {
    title?: ReactNode;
  };
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
  closeOnEscape = true,
  closeOnBackdropClick = true,
  defaultOpen = false,
  onOpenChange,
  slots,
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
    <Modal
      visible={Boolean(openness)}
      transparent
      animationType="fade"
      onRequestClose={() => { if (closeOnEscape ?? true) setOpennessValue(false); }}
    >
      <View
        testID={testID}
        style={[styles.root, style]}
        accessibilityLabel={accessibilityLabel}
        accessibilityLabelledBy={accessibilityLabelledBy}
      >
        {openness ? (
        <Pressable
          style={styles.backdrop}
          onPress={() => { if (closeOnBackdropClick ?? true) setOpennessValue(false); }}
          accessible={false}
        />
        ) : null}
        {openness ? (
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
              {slots?.title}
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={() => setOpennessValue(!openness)}
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
        ) : null}
      </View>
    </Modal>
  );
}
// @generated:end

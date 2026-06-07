// @generated:start imports
import { Pressable, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createSheetStyles } from "./Sheet.styles";
// @generated:end

// @generated:start types
export type SheetSide = "top" | "right" | "bottom" | "left";
// @generated:end

// @generated:start props
export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: SheetSide;
  modal?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Sheet({
  open: controlledOpenness,
  defaultOpen,
  onOpenChange,
  side = "right",
  modal = true,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: SheetProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createSheetStyles(fsdsTheme), [fsdsTheme]);
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
        style={styles.overlay}
        accessible={false}
      />
      <View
        style={styles.content}
        accessibilityLabelledBy={"sheet-title-id"}
      >
        <View
          style={styles.header}
        >
          <View
            style={styles.title}
          >
            {typeof children === "string" ? <RNText>{children}</RNText> : children}
          </View>
          <RNText
            style={styles.description}
            accessibilityRole="text"
          >
            {children}
          </RNText>
          <Pressable
            style={styles.close}
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

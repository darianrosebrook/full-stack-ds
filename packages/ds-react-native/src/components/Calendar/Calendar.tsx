// @generated:start imports
import { Pressable, StyleProp, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createCalendarStyles } from "./Calendar.styles";
// @generated:end

// @generated:start types
export type CalendarMode = "single" | "range";
// @generated:end

// @generated:start props
export interface CalendarProps {
  value?: Date | Date[] | null;
  defaultValue?: Date | Date[] | null;
  onChange?: (value: Date | Date[] | null) => void;
  mode?: CalendarMode;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  locale?: string;
  shouldCloseOnSelect?: boolean;
  daysShown?: number;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Calendar({
  value: controlledValue,
  defaultValue,
  onChange,
  mode = "single",
  disabled,
  minDate,
  maxDate,
  locale = "en-US",
  shouldCloseOnSelect = true,
  daysShown = 42,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: CalendarProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createCalendarStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | Date[] | null>((defaultValue ?? undefined) as Date | Date[] | null);
  const value = controlledValue ?? uncontrolledValue;
  const setValueValue = useCallback((next: Date | Date[] | null) => {
    if (controlledValue === undefined) setUncontrolledValue(next);
    onChange?.(next);
  }, [controlledValue, onChange]);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      <View
        style={styles.header}
      >
        <Pressable
          style={styles.nav}
          accessibilityRole="button"
        />
        <View
          style={styles.caption}
        />
        <Pressable
          style={styles.nav}
          accessibilityRole="button"
        />
      </View>
      <View
        style={styles.grid}
      >
        <View
          style={styles.root}
        >
          <View
            style={styles.root}
          >
            {Array.from({ length: Number(daysShown ?? 0) }).map((_, index) => (
                <View
                  style={styles.cell}
                >
                  <Pressable
                    style={styles.day}
                    accessibilityRole="button"
                  />
                </View>
              ))}
          </View>
        </View>
      </View>
    </View>
  );
}
// @generated:end

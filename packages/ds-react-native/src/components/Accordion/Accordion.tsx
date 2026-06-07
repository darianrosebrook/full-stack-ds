// @generated:start imports
import { Pressable, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createAccordionStyles } from "./Accordion.styles";
// @generated:end

// @generated:start types
export type AccordionType = "single" | "multiple";
// @generated:end

// @generated:start props
export interface AccordionProps {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  disabled?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Accordion({
  type = "single",
  value: controlledOpenness,
  defaultValue,
  onValueChange,
  collapsible = false,
  disabled,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: AccordionProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createAccordionStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledOpenness, setUncontrolledOpenness] = useState<string | string[]>((defaultValue ?? undefined) as string | string[]);
  const openness = controlledOpenness ?? uncontrolledOpenness;
  const setOpennessValue = useCallback((next: string | string[]) => {
    if (controlledOpenness === undefined) setUncontrolledOpenness(next);
    onValueChange?.(next);
  }, [controlledOpenness, onValueChange]);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      <View
        style={styles.item}
      >
        <View
          style={styles.header}
        >
          <Pressable
            style={styles.trigger}
            accessibilityRole="button"
            accessibilityState={{ expanded: Boolean(openness) }}
          >
            {typeof children === "string" ? <RNText>{children}</RNText> : children}
            <View
              style={styles.chevron}
            />
          </Pressable>
        </View>
        <View
          style={styles.content}
        >
          <View
            style={styles.contentInner}
          >
            {typeof children === "string" ? <RNText>{children}</RNText> : children}
          </View>
        </View>
      </View>
    </View>
  );
}
// @generated:end

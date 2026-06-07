// @generated:start imports
import { StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createShuttleStyles } from "./Shuttle.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface ShuttleProps {
  ariaLabel?: string;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Shuttle({
  ariaLabel,
  value: controlledSelection,
  defaultValue = ["alpha","beta","gamma"],
  onValueChange,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ShuttleProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createShuttleStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledSelection, setUncontrolledSelection] = useState<string[]>((defaultValue ?? undefined) as string[]);
  const selection = controlledSelection ?? uncontrolledSelection;
  const setSelectionValue = useCallback((next: string[]) => {
    if (controlledSelection === undefined) setUncontrolledSelection(next);
    onValueChange?.(next);
  }, [controlledSelection, onValueChange]);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={ariaLabel}
    >
      {(selection ?? []).map((item, index) => (
          <View
            style={styles.item}
          >
            <View
              style={styles.root}
            >
              <RNText>{item}</RNText>
            </View>
          </View>
        ))}
    </View>
  );
}
// @generated:end

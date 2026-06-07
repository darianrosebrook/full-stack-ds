// @generated:start imports
import { Pressable, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createToggleSwitchStyles } from "./ToggleSwitch.styles";
// @generated:end

// @generated:start types
export type ToggleSwitchSize = "small" | "medium" | "large";
// @generated:end

// @generated:start props
export interface ToggleSwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  size?: ToggleSwitchSize;
  disabled?: boolean;
  ariaLabel?: string;
  ariaDescribedby?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function ToggleSwitch({
  checked: controlledChecked,
  defaultChecked,
  onChange,
  size = "medium",
  disabled,
  ariaLabel,
  ariaDescribedby,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ToggleSwitchProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createToggleSwitchStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledChecked, setUncontrolledChecked] = useState<boolean>((defaultChecked ?? false) as boolean);
  const checked = controlledChecked ?? uncontrolledChecked;
  const setCheckedValue = useCallback((next: boolean) => {
    if (controlledChecked === undefined) setUncontrolledChecked(next);
    onChange?.(next);
  }, [controlledChecked, onChange]);

  return (
    <Pressable
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={ariaLabel}
      disabled={disabled}
      onPress={() => setCheckedValue(!checked)}
      accessibilityRole="button"
      accessibilityState={{ checked: Boolean(checked), disabled: disabled }}
    >
      {typeof children === "string" ? <RNText>{children}</RNText> : children}
    </Pressable>
  );
}
// @generated:end

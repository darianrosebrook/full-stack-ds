// @generated:start imports
import { Pressable, StyleProp, Text as RNText, TextInput, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createSelectStyles } from "./Select.styles";
// @generated:end

// @generated:start types
export type SelectSize = "sm" | "md" | "lg";
export type SelectOption = unknown;
// @generated:end

// @generated:start props
export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  multiple?: boolean;
  disabled?: boolean;
  size?: SelectSize;
  filterFn?: ((option: SelectOption, searchTerm: string) => boolean);
  searchable?: boolean;
  empty?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Select({
  options = [{"value":"alpha","label":"Alpha"},{"value":"beta","label":"Beta"},{"value":"gamma","label":"Gamma"}],
  value: controlledSelection,
  defaultValue = "beta",
  onChange,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  multiple,
  disabled,
  size = "md",
  filterFn,
  searchable,
  empty,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: SelectProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createSelectStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledSelection, setUncontrolledSelection] = useState<string | string[]>((defaultValue ?? undefined) as string | string[]);
  const selection = controlledSelection ?? uncontrolledSelection;
  const setSelectionValue = useCallback((next: string | string[]) => {
    if (controlledSelection === undefined) setUncontrolledSelection(next);
    onChange?.(next);
  }, [controlledSelection, onChange]);

  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>((defaultOpen ?? false) as boolean);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpenValue = useCallback((next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [controlledOpen, onOpenChange]);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityState={{ expanded: Boolean(open) }}
    >
      <Pressable
        style={styles.trigger}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled }}
      >
        <View
          style={styles.text}
        />
      </Pressable>
      <View
        style={styles.content}
        nativeID="fsds-select-listbox"
      >
        <View
          style={styles.search}
        >
          <TextInput
            style={styles.root}
          />
        </View>
        <View
          style={styles.options}
        >
          {(options ?? []).map((item, index) => (
              <View
                style={styles.option}
                accessibilityState={{ selected: Boolean(Array.isArray(selection) ? selection.includes((item as any).value) : (item as any).value === selection) }}
              >
                <View
                  style={styles.root}
                >
                  <RNText>{(item as any).label}</RNText>
                </View>
              </View>
            ))}
        </View>
        <View
          style={styles.emptyState}
        />
      </View>
    </View>
  );
}
// @generated:end

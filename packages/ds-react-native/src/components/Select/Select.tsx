// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, Text as RNText, TextInput, View } from "react-native";
import { type ReactNode, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createSelectStyles } from "./Select.styles";
// @generated:end

// @generated:start types
export type SelectSize = "sm" | "md" | "lg";
export type SelectOption = { value: string; label: string; disabled?: boolean };
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
  open: controlledOpen,
  disabled,
  searchable,
  empty,
  defaultValue = undefined,
  defaultOpen = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: SelectProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createSelectStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledSelection] = useState<string | string[]>((defaultValue ?? undefined) as string | string[]);
  const selection = controlledSelection ?? uncontrolledSelection;

  const [uncontrolledOpen] = useState<boolean>((defaultOpen ?? false) as boolean);
  const open = controlledOpen ?? uncontrolledOpen;

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
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
      {open ? (
      <View
        style={styles.content}
        nativeID="fsds-select-listbox"
      >
        {searchable ? (
        <View
          style={styles.search}
        >
          <TextInput
            style={styles.root}
          />
        </View>
        ) : null}
        <View
          style={styles.options}
        >
          {(options ?? []).map((item, index) => (
              <View
                key={index}
                style={styles.option}
                accessibilityState={{ selected: Boolean(Array.isArray(selection) ? selection.includes(item.value) : item.value === selection) }}
              >
                <View
                  style={styles.root}
                >
                  <RNText>{item.label}</RNText>
                </View>
              </View>
            ))}
        </View>
        {empty ? (
        <View
          style={styles.emptyState}
        />
        ) : null}
      </View>
      ) : null}
    </View>
  );
}
// @generated:end

// @generated:start imports
import { StyleProp, TextInput, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createCommandStyles } from "./Command.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface CommandProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
  label?: string;
  shouldFilter?: boolean;
  filter?: ((value: string, search: string) => number) | undefined;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Command({
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
  search: controlledSearch,
  defaultSearch,
  onSearchChange,
  placeholder = "Search...",
  emptyMessage = "No results found.",
  label = "Command palette",
  shouldFilter = true,
  filter,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: CommandProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createCommandStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>((defaultOpen ?? false) as boolean);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpenValue = useCallback((next: boolean) => {
    if (controlledOpen === undefined) setUncontrolledOpen(next);
    onOpenChange?.(next);
  }, [controlledOpen, onOpenChange]);

  const [uncontrolledSearch, setUncontrolledSearch] = useState<string>((defaultSearch ?? "") as string);
  const search = controlledSearch ?? uncontrolledSearch;
  const setSearchValue = useCallback((next: string) => {
    if (controlledSearch === undefined) setUncontrolledSearch(next);
    onSearchChange?.(next);
  }, [controlledSearch, onSearchChange]);

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
        style={styles.dialog}
        accessibilityLabel={label}
      >
        <View
          style={styles.inputWrapper}
        >
          <View
            style={styles.searchIcon}
            accessible={false}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={String(search ?? "")}
            onChangeText={(next: string) => setSearchValue(next)}
            accessibilityState={{ expanded: Boolean(open) }}
          />
        </View>
        <View
          style={styles.list}
          nativeID="fsds-command-listbox"
        >
          <View
            style={styles.empty}
          />
          <View
            style={styles.group}
          >
            <View
              style={styles.groupHeading}
            />
            <View
              style={styles.groupItems}
            >
              <View
                style={styles.item}
              >
                <View
                  style={styles.itemIcon}
                />
                <View
                  style={styles.itemContent}
                >
                  <View
                    style={styles.itemLabel}
                  />
                  <View
                    style={styles.itemDescription}
                  />
                </View>
              </View>
            </View>
          </View>
          <View
            style={styles.separator}
            accessible={false}
          />
        </View>
      </View>
    </View>
  );
}
// @generated:end

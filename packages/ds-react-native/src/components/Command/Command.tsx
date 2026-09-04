// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Modal, Pressable, Text as RNText, TextInput, View } from "react-native";
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
  searchLabel?: string;
  emptyMessage?: string;
  label?: string;
  shouldFilter?: boolean;
  filter?: ((value: string, search: string) => number) | undefined;
  slots?: {
    items?: ReactNode;
  };
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
  search: controlledSearch,
  placeholder = "Search...",
  searchLabel = "Search commands",
  label = "Command palette",
  defaultOpen = false,
  onOpenChange,
  defaultSearch = "",
  onSearchChange,
  slots,
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
    <Modal
      visible={Boolean(open)}
      transparent
      animationType="fade"
      onRequestClose={() => setOpenValue(false)}
    >
      <View
        testID={testID}
        style={[styles.root, style]}
        accessibilityLabel={accessibilityLabel}
        accessibilityLabelledBy={accessibilityLabelledBy}
      >
        {open ? (
        <Pressable
          style={styles.overlay}
          onPress={() => setOpenValue(false)}
          accessible={false}
        />
        ) : null}
        {open ? (
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
              accessibilityLabel={searchLabel}
              placeholder={placeholder}
              value={String(search ?? "")}
              onChangeText={(next: string) => setSearchValue(next)}
              accessibilityState={{ expanded: String(open) === "true" }}
            />
          </View>
          <View
            style={styles.list}
          >
            <View
              style={styles.empty}
            />
            {slots?.items}
            <View
              style={styles.separator}
              accessible={false}
            />
          </View>
        </View>
        ) : null}
      </View>
    </Modal>
  );
}
// @generated:end

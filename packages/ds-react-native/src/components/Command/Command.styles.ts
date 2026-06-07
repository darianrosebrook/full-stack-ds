// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveCommandTokens } from "./Command.tokens";
// @generated:end

// @generated:start styles
export function createCommandStyles(theme?: FsdsTheme) {
  const tokens = resolveCommandTokens(theme);
  return StyleSheet.create({
    dialog: {},
    empty: {},
    group: {},
    groupHeading: {},
    groupItems: {},
    input: {},
    inputWrapper: {},
    item: {},
    itemContent: {},
    itemDescription: {},
    itemIcon: {},
    itemLabel: {},
    list: {},
    overlay: {},
    root: {},
    searchIcon: {},
    separator: {},
  });
}

export const styles = createCommandStyles();
// @generated:end

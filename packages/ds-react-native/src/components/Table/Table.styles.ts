// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveTableTokens } from "./Table.tokens";
// @generated:end

// @generated:start styles
export function createTableStyles(theme?: FsdsTheme) {
  const tokens = resolveTableTokens(theme);
  return StyleSheet.create({
    body: {},
    caption: {},
    cell: {},
    container: {},
    footer: {},
    head: {},
    headerCell: {},
    root: {},
    row: {},
  });
}

export const styles = createTableStyles();
// @generated:end

// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveSelectTokens } from "./Select.tokens";
// @generated:end

// @generated:start styles
export function createSelectStyles(theme?: FsdsTheme) {
  const tokens = resolveSelectTokens(theme);
  return StyleSheet.create({
    content: {},
    emptyState: {},
    option: {},
    options: {},
    root: {},
    search: {},
    text: {},
    trigger: {},
  });
}

export const styles = createSelectStyles();
// @generated:end

// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveTextFieldTokens } from "./TextField.tokens";
// @generated:end

// @generated:start styles
export function createTextFieldStyles(theme?: FsdsTheme) {
  const tokens = resolveTextFieldTokens(theme);
  return StyleSheet.create({
    description: {},
    error: {},
    field: {},
    label: {},
    root: {},
  });
}

export const styles = createTextFieldStyles();
// @generated:end

// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveCheckboxTokens } from "./Checkbox.tokens";
// @generated:end

// @generated:start styles
export function createCheckboxStyles(theme?: FsdsTheme) {
  const tokens = resolveCheckboxTokens(theme);
  return StyleSheet.create({
    indicator: {},
    input: {},
    root: {},
  });
}

export const styles = createCheckboxStyles();
// @generated:end

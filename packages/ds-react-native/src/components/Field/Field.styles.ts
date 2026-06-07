// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveFieldTokens } from "./Field.tokens";
// @generated:end

// @generated:start styles
export function createFieldStyles(theme?: FsdsTheme) {
  const tokens = resolveFieldTokens(theme);
  return StyleSheet.create({
    control: {},
    error: {},
    header: {},
    help: {},
    label: {},
    meta: {},
    root: {},
    validatingIndicator: {},
  });
}

export const styles = createFieldStyles();
// @generated:end

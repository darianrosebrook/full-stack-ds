// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveButtonTokens } from "./Button.tokens";
// @generated:end

// @generated:start styles
export function createButtonStyles(theme?: FsdsTheme) {
  const tokens = resolveButtonTokens(theme);
  return StyleSheet.create({
    loadingText: {},
    root: {},
    spinner: {},
  });
}

export const styles = createButtonStyles();
// @generated:end

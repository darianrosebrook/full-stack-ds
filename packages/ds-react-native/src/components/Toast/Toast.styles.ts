// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveToastTokens } from "./Toast.tokens";
// @generated:end

// @generated:start styles
export function createToastStyles(theme?: FsdsTheme) {
  const tokens = resolveToastTokens(theme);
  return StyleSheet.create({
    action: {},
    close: {},
    description: {},
    item: {},
    root: {},
    row: {},
    title: {},
    viewport: {},
  });
}

export const styles = createToastStyles();
// @generated:end

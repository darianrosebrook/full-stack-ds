// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveSheetTokens } from "./Sheet.tokens";
// @generated:end

// @generated:start styles
export function createSheetStyles(theme?: FsdsTheme) {
  const tokens = resolveSheetTokens(theme);
  return StyleSheet.create({
    body: {},
    close: {},
    content: {},
    description: {},
    footer: {},
    header: {},
    overlay: {},
    root: {},
    title: {},
  });
}

export const styles = createSheetStyles();
// @generated:end

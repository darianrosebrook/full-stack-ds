// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveProgressTokens } from "./Progress.tokens";
// @generated:end

// @generated:start styles
export function createProgressStyles(theme?: FsdsTheme) {
  const tokens = resolveProgressTokens(theme);
  return StyleSheet.create({
    fill: {},
    root: {},
    track: {},
    value: {},
  });
}

export const styles = createProgressStyles();
// @generated:end

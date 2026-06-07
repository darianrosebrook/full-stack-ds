// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveAlertTokens } from "./Alert.tokens";
// @generated:end

// @generated:start styles
export function createAlertStyles(theme?: FsdsTheme) {
  const tokens = resolveAlertTokens(theme);
  return StyleSheet.create({
    body: {},
    dismiss: {},
    icon: {},
    root: {},
    title: {},
  });
}

export const styles = createAlertStyles();
// @generated:end

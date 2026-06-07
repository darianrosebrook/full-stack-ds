// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveBadgeTokens } from "./Badge.tokens";
// @generated:end

// @generated:start styles
export function createBadgeStyles(theme?: FsdsTheme) {
  const tokens = resolveBadgeTokens(theme);
  return StyleSheet.create({
    content: {},
    icon: {},
    root: {},
  });
}

export const styles = createBadgeStyles();
// @generated:end

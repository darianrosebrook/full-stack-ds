// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveTabsTokens } from "./Tabs.tokens";
// @generated:end

// @generated:start styles
export function createTabsStyles(theme?: FsdsTheme) {
  const tokens = resolveTabsTokens(theme);
  return StyleSheet.create({
    indicator: {},
    list: {},
    panel: {},
    root: {},
    tab: {},
  });
}

export const styles = createTabsStyles();
// @generated:end

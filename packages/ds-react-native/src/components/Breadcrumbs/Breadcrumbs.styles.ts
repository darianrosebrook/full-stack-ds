// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveBreadcrumbsTokens } from "./Breadcrumbs.tokens";
// @generated:end

// @generated:start styles
export function createBreadcrumbsStyles(theme?: FsdsTheme) {
  const tokens = resolveBreadcrumbsTokens(theme);
  return StyleSheet.create({
    current: {},
    link: {},
    list: {},
    overflow: {},
    root: {},
    separator: {},
  });
}

export const styles = createBreadcrumbsStyles();
// @generated:end

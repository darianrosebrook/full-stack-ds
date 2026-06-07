// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveCardTokens } from "./Card.tokens";
// @generated:end

// @generated:start styles
export function createCardStyles(theme?: FsdsTheme) {
  const tokens = resolveCardTokens(theme);
  return StyleSheet.create({
    actions: {},
    badge: {},
    content: {},
    description: {},
    footer: {},
    header: {},
    link: {},
    media: {},
    note: {},
    root: {},
  });
}

export const styles = createCardStyles();
// @generated:end

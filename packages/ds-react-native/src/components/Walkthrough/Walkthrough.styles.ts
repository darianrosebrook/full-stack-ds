// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveWalkthroughTokens } from "./Walkthrough.tokens";
// @generated:end

// @generated:start styles
export function createWalkthroughStyles(theme?: FsdsTheme) {
  const tokens = resolveWalkthroughTokens(theme);
  return StyleSheet.create({
    content: {},
    controls: {},
    counter: {},
    description: {},
    dot: {},
    dots: {},
    next: {},
    prev: {},
    root: {},
    skip: {},
    title: {},
  });
}

export const styles = createWalkthroughStyles();
// @generated:end

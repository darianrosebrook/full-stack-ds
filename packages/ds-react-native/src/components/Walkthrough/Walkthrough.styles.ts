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
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderRadius: (tokens.root?.["walkthrough.surface.radius"] as number | undefined) },
    skip: {},
    title: {},
  });
}

export const styles = createWalkthroughStyles();
// @generated:end

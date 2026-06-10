// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveIconTokens } from "./Icon.tokens";
// @generated:end

// @generated:start styles
export function createIconStyles(theme?: FsdsTheme) {
  const tokens = resolveIconTokens(theme);
  return StyleSheet.create({
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined) },
    rootText: { color: (tokens.root?.["icon.color.foreground.default"] as string | undefined) },
  });
}

export const styles = createIconStyles();
// @generated:end

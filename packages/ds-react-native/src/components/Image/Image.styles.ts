// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveImageTokens } from "./Image.tokens";
// @generated:end

// @generated:start styles
export function createImageStyles(theme?: FsdsTheme) {
  const tokens = resolveImageTokens(theme);
  return StyleSheet.create({
    errorState: {},
    img: {},
    placeholder: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["image.color.background.default"] as string | undefined), borderRadius: (tokens.root?.["image.radius.none"] as number | undefined) },
  });
}

export const styles = createImageStyles();
// @generated:end

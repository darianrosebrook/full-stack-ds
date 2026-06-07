// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveTextFieldTokens } from "./TextField.tokens";
// @generated:end

// @generated:start styles
export function createTextFieldStyles(theme?: FsdsTheme) {
  const tokens = resolveTextFieldTokens(theme);
  return StyleSheet.create({
    description: {},
    error: {},
    field: {},
    label: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderWidth: (tokens.root?.["text-field.border.width"] as number | undefined), borderRadius: (tokens.root?.["text-field.border.radius"] as number | undefined) },
  });
}

export const styles = createTextFieldStyles();
// @generated:end

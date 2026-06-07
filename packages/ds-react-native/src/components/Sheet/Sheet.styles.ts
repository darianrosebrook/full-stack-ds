// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveSheetTokens } from "./Sheet.tokens";
// @generated:end

// @generated:start styles
export function createSheetStyles(theme?: FsdsTheme) {
  const tokens = resolveSheetTokens(theme);
  return StyleSheet.create({
    body: {},
    close: {},
    content: {},
    description: {},
    footer: {},
    header: {},
    overlay: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderColor: (tokens.root?.["sheet.color.border"] as string | undefined), borderWidth: (tokens.root?.["sheet.border.width"] as number | undefined), borderRadius: (tokens.root?.["sheet.border.radius"] as number | undefined) },
    title: {},
  });
}

export const styles = createSheetStyles();
// @generated:end

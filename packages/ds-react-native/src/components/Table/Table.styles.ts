// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveTableTokens } from "./Table.tokens";
// @generated:end

// @generated:start styles
export function createTableStyles(theme?: FsdsTheme) {
  const tokens = resolveTableTokens(theme);
  return StyleSheet.create({
    body: {},
    caption: {},
    cell: {},
    container: {},
    footer: {},
    head: {},
    headerCell: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderColor: (tokens.root?.["table.color.border"] as string | undefined), borderWidth: (tokens.root?.["table.border.width"] as number | undefined), borderRadius: (tokens.root?.["table.size.radius"] as number | undefined) },
    rootText: { color: (tokens.root?.["table.color.text"] as string | undefined), fontSize: (tokens.root?.["table.text.size"] as number | undefined) },
    row: {},
  });
}

export const styles = createTableStyles();
// @generated:end

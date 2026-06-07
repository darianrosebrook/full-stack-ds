// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveCommandTokens } from "./Command.tokens";
// @generated:end

// @generated:start styles
export function createCommandStyles(theme?: FsdsTheme) {
  const tokens = resolveCommandTokens(theme);
  return StyleSheet.create({
    dialog: {},
    empty: {},
    group: {},
    groupHeading: {},
    groupItems: {},
    input: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderColor: (tokens.root?.["command.color.border"] as string | undefined), borderWidth: (tokens.root?.["command.border.width"] as number | undefined), borderRadius: (tokens.root?.["command.border.radius"] as number | undefined) },
    inputWrapper: {},
    item: {},
    itemContent: {},
    itemDescription: {},
    itemIcon: {},
    itemLabel: {},
    list: {},
    overlay: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderColor: (tokens.root?.["command.color.border"] as string | undefined), borderWidth: (tokens.root?.["command.border.width"] as number | undefined), borderRadius: (tokens.root?.["command.border.radius"] as number | undefined) },
    searchIcon: {},
    separator: {},
  });
}

export const styles = createCommandStyles();
// @generated:end

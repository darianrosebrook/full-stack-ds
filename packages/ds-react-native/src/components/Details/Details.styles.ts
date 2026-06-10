// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveDetailsTokens } from "./Details.tokens";
// @generated:end

// @generated:start styles
export function createDetailsStyles(theme?: FsdsTheme) {
  const tokens = resolveDetailsTokens(theme);
  return StyleSheet.create({
    content: {},
    icon: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["details.color.background.default"] as string | undefined), borderColor: (tokens.root?.["details.color.border.default"] as string | undefined), borderRadius: (tokens.root?.["details.size.radius.default"] as number | undefined) },
    rootText: { color: (tokens.root?.["details.color.foreground.primary"] as string | undefined) },
    summary: {},
    summaryContent: {},
    summaryText: {},
  });
}

export const styles = createDetailsStyles();
// @generated:end

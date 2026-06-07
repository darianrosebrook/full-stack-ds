// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveAlertTokens } from "./Alert.tokens";
// @generated:end

// @generated:start styles
export function createAlertStyles(theme?: FsdsTheme) {
  const tokens = resolveAlertTokens(theme);
  return StyleSheet.create({
    body: {},
    dismiss: {},
    icon: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderColor: (tokens.root?.["alert.color.border.primary"] as string | undefined), borderRadius: (tokens.root?.["alert.size.radius"] as number | undefined) },
    title: {},
  });
}

export const styles = createAlertStyles();
// @generated:end

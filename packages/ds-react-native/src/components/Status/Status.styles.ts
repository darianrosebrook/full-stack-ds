// @generated:start imports
import { StyleSheet } from "react-native";
import { definedStyle, type FsdsTheme } from "../../tokens";
import { resolveStatusTokens } from "./Status.tokens";
// @generated:end

// @generated:start styles
export function createStatusStyles(theme?: FsdsTheme) {
  const tokens = resolveStatusTokens(theme);
  return StyleSheet.create({
    icon: {},
    label: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["status.color.background.default"] as string | undefined), borderColor: (tokens.root?.["status.color.border.default"] as string | undefined), borderWidth: (tokens.root?.["status.size.border.default"] as number | undefined), borderRadius: (tokens.root?.["status.size.radius.default"] as number | undefined) },
    rootText: definedStyle({ color: (tokens.root?.["status.color.foreground.primary"] as string | undefined) }),
  });
}

export const styles = createStatusStyles();
// @generated:end

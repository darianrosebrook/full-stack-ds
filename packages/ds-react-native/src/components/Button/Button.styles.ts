// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveButtonTokens } from "./Button.tokens";
// @generated:end

// @generated:start styles
export function createButtonStyles(theme?: FsdsTheme) {
  const tokens = resolveButtonTokens(theme);
  return StyleSheet.create({
    loadingText: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["button.color.background.default"] as string | undefined), borderColor: (tokens.root?.["button.color.border.default"] as string | undefined), borderWidth: (tokens.root?.["button.size.border"] as number | undefined), borderRadius: (tokens.root?.["button.size.radius"] as number | undefined), alignItems: "center", justifyContent: "center" },
    spinner: {},
  });
}

export const styles = createButtonStyles();
// @generated:end

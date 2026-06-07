// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveAvatarTokens } from "./Avatar.tokens";
// @generated:end

// @generated:start styles
export function createAvatarStyles(theme?: FsdsTheme) {
  const tokens = resolveAvatarTokens(theme);
  return StyleSheet.create({
    image: {},
    initials: {},
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), backgroundColor: (tokens.root?.["avatar.color.background.default"] as string | undefined), borderColor: (tokens.root?.["avatar.color.border.default"] as string | undefined), borderWidth: (tokens.root?.["avatar.size.border.default"] as number | undefined), borderRadius: (tokens.root?.["avatar.size.radius.default"] as number | undefined) },
    status: {},
  });
}

export const styles = createAvatarStyles();
// @generated:end

// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveSwitchTokens } from "./Switch.tokens";
// @generated:end

// @generated:start styles
export function createSwitchStyles(theme?: FsdsTheme) {
  const tokens = resolveSwitchTokens(theme);
  return StyleSheet.create({
    input: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderRadius: (tokens.root?.["switch.size.md.track.radius"] as number | undefined) },
    root: { paddingTop: (tokens.root?.["box-model.padding-block-start"] as number | undefined), paddingBottom: (tokens.root?.["box-model.padding-block-end"] as number | undefined), minHeight: (tokens.root?.["box-model.min-height"] as number | undefined), paddingLeft: (tokens.root?.["box-model.padding-inline-start"] as number | undefined), paddingRight: (tokens.root?.["box-model.padding-inline-end"] as number | undefined), gap: (tokens.root?.["box-model.gap"] as number | undefined), minWidth: (tokens.root?.["box-model.min-width"] as number | undefined), borderRadius: (tokens.root?.["switch.size.md.track.radius"] as number | undefined) },
    root_lg: { width: (tokens.root?.["switch.size.lg.track.width"] as number | undefined), height: (tokens.root?.["switch.size.lg.track.height"] as number | undefined) },
    root_md: { width: (tokens.root?.["switch.size.md.track.width"] as number | undefined), height: (tokens.root?.["switch.size.md.track.height"] as number | undefined) },
    root_sm: { width: (tokens.root?.["switch.size.sm.track.width"] as number | undefined), height: (tokens.root?.["switch.size.sm.track.height"] as number | undefined) },
    thumb: {},
    track: {},
  });
}

export const styles = createSwitchStyles();
// @generated:end

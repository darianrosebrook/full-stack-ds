// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveSwitchTokens } from "./Switch.tokens";
// @generated:end

// @generated:start styles
export function createSwitchStyles(theme?: FsdsTheme) {
  const tokens = resolveSwitchTokens(theme);
  return StyleSheet.create({
    input: {},
    root: {},
    root_lg: { width: (tokens.root?.["switch.size.lg.track.width"] as number | undefined), height: (tokens.root?.["switch.size.lg.track.height"] as number | undefined) },
    root_md: { width: (tokens.root?.["switch.size.md.track.width"] as number | undefined), height: (tokens.root?.["switch.size.md.track.height"] as number | undefined) },
    root_sm: { width: (tokens.root?.["switch.size.sm.track.width"] as number | undefined), height: (tokens.root?.["switch.size.sm.track.height"] as number | undefined) },
    thumb: {},
    track: {},
  });
}

export const styles = createSwitchStyles();
// @generated:end

// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveSkeletonTokens } from "./Skeleton.tokens";
// @generated:end

// @generated:start styles
export function createSkeletonStyles(theme?: FsdsTheme) {
  const tokens = resolveSkeletonTokens(theme);
  return StyleSheet.create({
    root: {},
    row: {},
    shape: {},
    stack: {},
  });
}

export const styles = createSkeletonStyles();
// @generated:end

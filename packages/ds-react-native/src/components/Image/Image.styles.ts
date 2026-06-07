// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveImageTokens } from "./Image.tokens";
// @generated:end

// @generated:start styles
export function createImageStyles(theme?: FsdsTheme) {
  const tokens = resolveImageTokens(theme);
  return StyleSheet.create({
    errorState: {},
    img: {},
    placeholder: {},
    root: {},
  });
}

export const styles = createImageStyles();
// @generated:end

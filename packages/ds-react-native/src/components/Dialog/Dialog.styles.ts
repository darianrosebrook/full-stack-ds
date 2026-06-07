// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveDialogTokens } from "./Dialog.tokens";
// @generated:end

// @generated:start styles
export function createDialogStyles(theme?: FsdsTheme) {
  const tokens = resolveDialogTokens(theme);
  return StyleSheet.create({
    backdrop: {},
    body: {},
    closeButton: {},
    footer: {},
    header: {},
    modal: {},
    root: {},
    title: {},
  });
}

export const styles = createDialogStyles();
// @generated:end

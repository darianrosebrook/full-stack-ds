// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveAccordionTokens } from "./Accordion.tokens";
// @generated:end

// @generated:start styles
export function createAccordionStyles(theme?: FsdsTheme) {
  const tokens = resolveAccordionTokens(theme);
  return StyleSheet.create({
    chevron: {},
    content: {},
    contentInner: {},
    header: {},
    item: {},
    root: {},
    trigger: {},
  });
}

export const styles = createAccordionStyles();
// @generated:end

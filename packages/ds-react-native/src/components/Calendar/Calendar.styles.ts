// @generated:start imports
import { StyleSheet } from "react-native";
import type { FsdsTheme } from "../../tokens";
import { resolveCalendarTokens } from "./Calendar.tokens";
// @generated:end

// @generated:start styles
export function createCalendarStyles(theme?: FsdsTheme) {
  const tokens = resolveCalendarTokens(theme);
  return StyleSheet.create({
    caption: {},
    cell: {},
    day: {},
    grid: {},
    header: {},
    nav: {},
    root: {},
  });
}

export const styles = createCalendarStyles();
// @generated:end

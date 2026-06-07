// @generated:start imports
import { StyleProp, View, ViewStyle } from "react-native";
import { type ReactNode, useMemo } from "react";
import { useFsdsTheme } from "../../tokens";
import { createCardStyles } from "./Card.styles";
// @generated:end

// @generated:start types
export type CardStatus = "completed" | "in-progress" | "planned" | "deprecated" | "category" | "complexity";
export type CardDensity = "default" | "inset";
// @generated:end

// @generated:start props
export interface CardProps {
  interactive?: boolean;
  status?: CardStatus;
  density?: CardDensity;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Card({
  interactive,
  status,
  density = "default",
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: CardProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createCardStyles(fsdsTheme), [fsdsTheme]);
  return (
    <View testID={testID} style={[styles.root, style]}>{children}</View>
  );
}
// @generated:end

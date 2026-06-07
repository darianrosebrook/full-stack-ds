import { View, type StyleProp, type ViewStyle } from "react-native";
import type { ReactNode } from "react";

type StackVariant = "vertical" | "horizontal";

export interface StackProps {
  variant?: StackVariant;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function Stack({
  variant = "vertical",
  children,
  style,
  testID,
}: StackProps) {
  const layoutStyle: ViewStyle = {
    display: "flex",
    flexDirection: variant === "horizontal" ? "row" : "column",
  };

  return (
    <View testID={testID} style={[layoutStyle, style]}>
      {children}
    </View>
  );
}

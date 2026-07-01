// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, Text as RNText, View } from "react-native";
import { type ReactNode, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createTabsStyles } from "./Tabs.styles";
// @generated:end

// @generated:start types
export type TabsOrientation = "horizontal" | "vertical";
export type TabsAppearance = "underline" | "pills";
export type TabsActivationMode = "automatic" | "manual";
// @generated:end

// @generated:start props
export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  appearance?: TabsAppearance;
  activationMode?: TabsActivationMode;
  loop?: boolean;
  unmountInactive?: boolean;
  idBase?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Tabs({
  value: controlledActiveTab,
  defaultValue = "",
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: TabsProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createTabsStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledActiveTab] = useState<string>((defaultValue ?? "") as string);
  const activeTab = controlledActiveTab ?? uncontrolledActiveTab;

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      <View
        style={styles.list}
      >
        <Pressable
          style={styles.tab}
          accessibilityRole="tab"
          accessibilityState={{ selected: String(activeTab) === "true" }}
        />
        <View
          style={styles.indicator}
          accessible={false}
        />
      </View>
      <View
        style={styles.panel}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
    </View>
  );
}
// @generated:end

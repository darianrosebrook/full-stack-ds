// @generated:start imports
import type { StyleProp, ViewStyle } from "react-native";
import { Pressable, Text as RNText, View } from "react-native";
import { type ReactNode, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createTruncateStyles } from "./Truncate.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface TruncateProps {
  lines?: number;
  expandable?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  expandText?: string;
  collapseText?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function Truncate({
  lines,
  expandable,
  expanded: controlledExpanded,
  defaultExpanded = false,
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: TruncateProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createTruncateStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledExpanded] = useState<boolean>((defaultExpanded ?? false) as boolean);
  const expanded = controlledExpanded ?? uncontrolledExpanded;

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityLabelledBy={accessibilityLabelledBy}
    >
      <View
        style={styles.content}
      >
        {typeof children === "string" ? <RNText numberOfLines={expanded ? undefined : lines}>{children}</RNText> : children}
      </View>
      {expandable ? (
      <Pressable
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: Boolean(expanded) }}
      />
      ) : null}
    </View>
  );
}
// @generated:end

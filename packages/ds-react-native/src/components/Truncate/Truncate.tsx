// @generated:start imports
import { Pressable, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
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
  defaultExpanded,
  onExpandedChange,
  expandText = "Show more",
  collapseText = "Show less",
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: TruncateProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createTruncateStyles(fsdsTheme), [fsdsTheme]);
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<boolean>((defaultExpanded ?? false) as boolean);
  const expanded = controlledExpanded ?? uncontrolledExpanded;
  const setExpandedValue = useCallback((next: boolean) => {
    if (controlledExpanded === undefined) setUncontrolledExpanded(next);
    onExpandedChange?.(next);
  }, [controlledExpanded, onExpandedChange]);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
    >
      <View
        style={styles.content}
      >
        {typeof children === "string" ? <RNText>{children}</RNText> : children}
      </View>
      <Pressable
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: Boolean(expanded) }}
      />
    </View>
  );
}
// @generated:end

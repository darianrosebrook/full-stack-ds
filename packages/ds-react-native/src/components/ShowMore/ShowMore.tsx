// @generated:start imports
import { Pressable, StyleProp, Text as RNText, View, ViewStyle } from "react-native";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { useFsdsTheme } from "../../tokens";
import { createShowMoreStyles } from "./ShowMore.styles";
// @generated:end

// @generated:start types

// @generated:end

// @generated:start props
export interface ShowMoreProps {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  maxLines?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityLabelledBy?: string | string[];
}
// @generated:end

// @generated:start component
export function ShowMore({
  expanded: controlledExpanded,
  defaultExpanded,
  onExpandedChange,
  maxLines = 3,
  showMoreLabel = "Show more",
  showLessLabel = "Show less",
  children,
  style,
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: ShowMoreProps) {
  const fsdsTheme = useFsdsTheme();
  const styles = useMemo(() => createShowMoreStyles(fsdsTheme), [fsdsTheme]);
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
        {typeof children === "string" ? <RNText numberOfLines={expanded ? undefined : maxLines}>{children}</RNText> : children}
      </View>
      <Pressable
        style={styles.trigger}
        onPress={() => setExpandedValue(!expanded)}
        accessibilityRole="button"
        accessibilityState={{ expanded: Boolean(expanded) }}
      >
        <RNText>{(expanded ? showLessLabel : showMoreLabel)}</RNText>
      </Pressable>
    </View>
  );
}
// @generated:end

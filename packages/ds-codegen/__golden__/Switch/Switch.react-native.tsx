// Hand-authored golden output. Not generated.
// See ../README.md for annotation conventions.

// SRC: framework-grammar (RN module imports)
// SRC: anatomy.dom: <label> wrapping <input type=checkbox role=switch>
//      → RN ships a native <Switch> primitive that IS the entire anatomy.
//      Track and thumb are platform-rendered; the spans collapse the
//      same way SwiftUI's Toggle collapses them.
import {
  Switch as RNSwitch,
  View,
  StyleSheet,
  type AccessibilityProps,
} from "react-native";
import { useState, useCallback, useRef } from "react";

// SRC: contract.types.SwitchSize
export type SwitchSize = "sm" | "md" | "lg";

// SRC: ir.normalizedChannels[0] + contract.props.styled.members
// SRC: framework-grammar (RN/React props interface)
export interface SwitchProps
  extends Pick<AccessibilityProps, "accessibilityLabel" | "accessibilityLabelledBy"> {
  // SRC: contract.channels.checked.value=checked, valueType=boolean
  checked?: boolean;
  // SRC: contract.channels.checked.defaultValue=defaultChecked
  defaultChecked?: boolean;
  // SRC: contract.channels.checked.onChange=onChange
  // SRC: ir.normalizedChannels[0].callbackKind=value → (boolean) => void
  onChange?: (checked: boolean) => void;
  // SRC: contract.props.styled.members[name=size], default=md
  size?: SwitchSize;
  // SRC: contract.props.styled.members[name=disabled, type=boolean]
  disabled?: boolean;
  // SRC: contract.props.styled.members[name=name, type=string]
  // SRC: form.participates=true — RN has no native <form>; `name` is
  //      retained for consumers that wire to a form-submission layer.
  name?: string;
  // SRC: contract.props.styled.members[name=value, type=string]
  // SRC: form.serialization.valueSource=static:on
  value?: string;
  // SRC: framework-grammar (RN testing convention)
  testID?: string;
}

// SRC: contract.name → component identifier
export function Switch({
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  size = "md",
  disabled = false,
  name: _name,        // SRC: form-only, unused at runtime
  value: _value,      // SRC: form-only, unused at runtime
  testID,
  accessibilityLabel,
  accessibilityLabelledBy,
}: SwitchProps) {
  // SRC: ir.normalizedChannels[0] → useControllableState pattern
  // SRC: semantic (controlled-takes-precedence-over-uncontrolled)
  const [uncontrolledChecked, setUncontrolledChecked] = useState(defaultChecked);
  const checked = controlledChecked ?? uncontrolledChecked;

  // SRC: framework-grammar (React: stable callback identity via useCallback)
  // SRC: ir.normalizedChannels[0].changeHandlerProp=onChange
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleValueChange = useCallback(
    (next: boolean) => {
      if (controlledChecked === undefined) {
        setUncontrolledChecked(next);
      }
      onChangeRef.current?.(next);
    },
    [controlledChecked],
  );

  return (
    // SRC: anatomy.dom: root <label>
    // SRC: framework-grammar (RN: View wrapper for layout + testID)
    // SRC: contract.variants.size — applied via stylesheet lookup
    <View style={styles[`root_${size}`]} testID={testID}>
      <RNSwitch
        // SRC: ir.normalizedChannels[0] → controlled value
        value={checked}
        // SRC: ir.normalizedChannels[0] → controlled change handler
        onValueChange={handleValueChange}
        // SRC: contract.props.disabled
        disabled={disabled}
        // SRC: contract.a11y.labeling[0]=aria-label
        // SRC: framework-a11y (RN accessibilityLabel ≡ aria-label)
        accessibilityLabel={accessibilityLabel}
        // SRC: contract.a11y.labeling[1]=aria-labelledby
        accessibilityLabelledBy={accessibilityLabelledBy}
        // SRC: contract.anatomy.dom.children[0].attrs.role=switch
        // SRC: framework-a11y (RN accessibilityRole="switch" projects to
        //      both iOS AXSwitch trait and Android role.Switch)
        accessibilityRole="switch"
        // SRC: contract.a11y.labeling[2]=aria-checked
        // SRC: framework-a11y (RN accessibilityState.checked ≡ aria-checked)
        accessibilityState={{ checked, disabled }}
      />
    </View>
  );
}

// SRC: contract.tokens.root["switch.size.md.track.width|height"]
// SRC: framework-grammar (RN StyleSheet.create)
// GAP: only md tokens shipped; sm/lg are guessed.
// GAP: RN's native <Switch> ignores width/height on iOS — sizing the
//      wrapper View is the only available knob and not all tokens
//      translate.
const styles = StyleSheet.create({
  root_sm: { width: 36, height: 18 },  // GAP: not in contract
  root_md: { width: 48, height: 24 },  // SRC: contract.tokens.root.switch.size.md.*
  root_lg: { width: 60, height: 30 },  // GAP: not in contract
});

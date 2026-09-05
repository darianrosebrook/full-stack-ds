// Hand-written behavioral companion to the generated ToggleSwitch scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { ToggleSwitch } from "../ToggleSwitch";

function mountToggle(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<ToggleSwitch testID="subject" {...props} />);
  });
  return renderer!;
}

const switchNode = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ accessibilityRole: "switch" })[0]!;

describe("ToggleSwitch — behavioral surfaces", () => {
  it("wires track colors from the declared component token slots", () => {
    const node = switchNode(mountToggle());
    // No theme → each token resolves to its contract fallback.
    expect(node.props.trackColor).toEqual({
      false: "#f7f7f7",
      true: "#0566fe",
    });
    expect(node.props.ios_backgroundColor).toBe("#f7f7f7");
  });

  it("toggles the uncontrolled channel and reports the change", () => {
    let reported: unknown;
    const renderer = mountToggle({ onChange: (next: unknown) => (reported = next) });
    const node = switchNode(renderer);
    expect(node.props.value).toBe(false);
    act(() => node.props.onValueChange(true));
    expect(reported).toBe(true);
    expect(switchNode(renderer).props.accessibilityState).toEqual({
      checked: true,
      disabled: undefined,
    });
  });

  it("keeps a controlled value pinned while reporting flips", () => {
    let reported: unknown;
    const renderer = mountToggle({ checked: false, onChange: (next: unknown) => (reported = next) });
    act(() => switchNode(renderer).props.onValueChange(true));
    expect(reported).toBe(true);
    expect(switchNode(renderer).props.value).toBe(false);
  });

  it("carries the disabled state into the switch", () => {
    const node = switchNode(mountToggle({ disabled: true }));
    expect(node.props.disabled).toBe(true);
    expect(node.props.accessibilityState.disabled).toBe(true);
  });
});

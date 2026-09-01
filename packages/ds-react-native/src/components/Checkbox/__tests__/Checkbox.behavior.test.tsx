// Hand-written behavioral companion to the generated Checkbox scaffold.
import { describe, expect, it, vi } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Checkbox } from "../Checkbox";

function mountCheckbox(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Checkbox testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Checkbox — behavioral surfaces", () => {
  it("carries the checkbox role and unchecked state by default", () => {
    const subject = host(mountCheckbox());
    expect(subject.props.accessibilityRole).toBe("checkbox");
    expect(subject.props.accessibilityState.checked).toBe(false);
  });

  it("reflects the checked and disabled states", () => {
    const subject = host(mountCheckbox({ checked: true, disabled: true }));
    expect(subject.props.accessibilityState.checked).toBe(true);
    expect(subject.props.accessibilityState.disabled).toBe(true);
  });

  it("reflects the indeterminate mixed state", () => {
    const subject = host(mountCheckbox({ checked: true, indeterminate: true }));
    expect(subject.props.accessibilityState.checked).toBe("mixed");
  });

  it("toggles the uncontrolled value on press", () => {
    const renderer = mountCheckbox();
    const subject = host(renderer);
    act(() => {
      subject.props.onPress();
    });
    expect(
      host(renderer).props.accessibilityState.checked,
    ).toBe(true);
  });

  it("fires onChange with the toggled value", () => {
    const onChange = vi.fn();
    const renderer = mountCheckbox({ checked: false, onChange });
    const subject = host(renderer);
    act(() => {
      subject.props.onPress();
    });
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

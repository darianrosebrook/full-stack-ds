// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Switch } from "../Switch";
// @generated:end

// @generated:start tests
describe("Switch React Native", () => {
  it("renders native switch state and change handler", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Switch checked={false} onChange={() => undefined} testID="subject" />);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("switch");
    expect(subject.props.value).toBe(false);
    expect(subject.props.onValueChange).toEqual(expect.any(Function));
  });
});
// @generated:end

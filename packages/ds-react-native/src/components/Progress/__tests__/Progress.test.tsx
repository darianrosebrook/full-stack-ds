// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Progress } from "../Progress";
// @generated:end

// @generated:start tests
describe("Progress React Native", () => {
  it("renders progressbar accessibility value and fill width", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Progress value={42} label="Loading" testID="subject" />);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("progressbar");
    expect(subject.props.accessibilityValue).toMatchObject({ min: 0, max: 100, now: 42 });
    const fill = renderer!.root.findAll((node) => Array.isArray(node.props.style) && node.props.style.some((entry: { width?: string }) => entry?.width === "42%"))[0];
    expect(fill).toBeTruthy();
  });
});
// @generated:end

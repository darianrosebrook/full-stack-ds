// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Checkbox } from "../Checkbox";
// @generated:end

// @generated:start tests
describe("Checkbox React Native", () => {
  it("renders checkbox semantics and press handler", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Checkbox checked={true} onChange={() => undefined} testID="subject" />);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("checkbox");
    expect(subject.props.accessibilityState).toMatchObject({ checked: true });
    expect(subject.props.onPress).toEqual(expect.any(Function));
    expect(renderer!.root.findAll((node) => node.props.children === "x").length).toBeGreaterThan(0);
  });
});
// @generated:end

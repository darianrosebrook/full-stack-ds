// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Button } from "../Button";
// @generated:end

// @generated:start tests
describe("Button React Native", () => {
  it("renders button semantics and press passthrough", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Button onPress={() => undefined} testID="subject">Save</Button>);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("button");
    expect(subject.props.onPress).toEqual(expect.any(Function));
    expect(renderer!.root.findAll((node) => node.props.children === "Save").length).toBeGreaterThan(0);
  });
});
// @generated:end

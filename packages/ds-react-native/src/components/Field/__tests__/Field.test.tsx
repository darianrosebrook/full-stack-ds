// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Field } from "../Field";
// @generated:end

// @generated:start tests
describe("Field React Native", () => {
  it("renders label, control, help, and error slots from props", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Field name="email" label="Email" helpText="Use work email" error="Required" testID="subject">Control</Field>);
  });
    const subject = renderer!.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject).toBeTruthy();
    expect(renderer!.root.findAll((node) => node.props.children === "Email").length).toBeGreaterThan(0);
    expect(renderer!.root.findAll((node) => node.props.children === "Control").length).toBeGreaterThan(0);
    expect(renderer!.root.findAll((node) => node.props.children === "Use work email").length).toBeGreaterThan(0);
    expect(renderer!.root.findAll((node) => node.props.children === "Required").length).toBeGreaterThan(0);
  });
});
// @generated:end

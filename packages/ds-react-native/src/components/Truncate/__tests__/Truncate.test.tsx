// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Truncate } from "../Truncate";
// @generated:end

// @generated:start tests
describe("Truncate React Native", () => {
  it("renders collapsed content and expanded trigger state", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Truncate expanded={false} expandable lines={2} expandText="More" collapseText="Less" testID="subject">Long copy</Truncate>);
  });
    const trigger = renderer!.root.findByProps({ accessibilityRole: "button" });
    expect(trigger.props.accessibilityState).toMatchObject({ expanded: false });
    expect(renderer!.root.findAll((node) => node.props.children === "More").length).toBeGreaterThan(0);
    const content = renderer!.root.findAll((node) => node.props.children === "Long copy").at(-1);
    expect(content?.props.numberOfLines).toBe(2);
  });
  it("updates uncontrolled state and fires the change callback on trigger press", () => {
    const seen: boolean[] = [];
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Truncate expandable lines={2} expandText="More" collapseText="Less" onExpandedChange={(next: boolean) => seen.push(next)} testID="subject">Long copy</Truncate>);
  });
    const trigger = renderer!.root.findByProps({ accessibilityRole: "button" });
    expect(trigger.props.accessibilityState).toMatchObject({ expanded: false });
    act(() => { trigger.props.onPress(); });
    expect(seen).toEqual([true]);
    const pressed = renderer!.root.findByProps({ accessibilityRole: "button" });
    expect(pressed.props.accessibilityState).toMatchObject({ expanded: true });
    expect(renderer!.root.findAll((node) => node.props.children === "Less").length).toBeGreaterThan(0);
  });
});
// @generated:end

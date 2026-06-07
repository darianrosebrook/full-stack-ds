// @generated:start imports
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { ShowMore } from "../ShowMore";
// @generated:end

// @generated:start tests
describe("ShowMore React Native", () => {
  it("renders collapsed content and expanded trigger state", () => {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<ShowMore expanded={false} maxLines={2} showMoreLabel="More" showLessLabel="Less" testID="subject">Long copy</ShowMore>);
  });
    const trigger = renderer!.root.findByProps({ accessibilityRole: "button" });
    expect(trigger.props.accessibilityState).toMatchObject({ expanded: false });
    expect(renderer!.root.findAll((node) => node.props.children === "More").length).toBeGreaterThan(0);
    const content = renderer!.root.findAll((node) => node.props.children === "Long copy").at(-1);
    expect(content?.props.numberOfLines).toBe(2);
  });
});
// @generated:end

// Hand-written behavioral companion to the generated Divider scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Divider } from "../Divider";

function mountDivider(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Divider testID="subject" {...props} />);
  });
  return renderer!;
}

describe("Divider — behavioral surfaces", () => {
  it("renders without an orientation-specific style entry by default", () => {
    const subject = mountDivider().root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.style[1]).toBeFalsy();
  });

  it("adds the vertical orientation style entry when requested", () => {
    const vertical = mountDivider({ orientation: "vertical" }).root
      .findAllByProps({ testID: "subject" })
      .at(-1)!;
    expect(vertical.props.style[1]).toBeTruthy();
  });

  it("wraps string children in a text node", () => {
    const renderer = mountDivider({ children: "or" });
    const subject = renderer.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.findAllByType("Text" as never).length).toBeGreaterThan(0);
  });
});

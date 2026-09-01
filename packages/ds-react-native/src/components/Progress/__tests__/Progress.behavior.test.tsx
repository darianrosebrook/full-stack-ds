// Hand-written behavioral companion to the generated Progress scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Progress } from "../Progress";

function mountProgress(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Progress testID="subject" {...props} />);
  });
  return renderer!;
}

describe("Progress — behavioral surfaces", () => {
  it("carries the progressbar role and a non-accessible track", () => {
    const renderer = mountProgress({ value: 40 });
    const subject = renderer.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("progressbar");
    expect(subject.findAllByProps({ accessible: false }).length).toBeGreaterThan(0);
  });

  it("clamps the fill width into the 0-100 range", () => {
    const low = mountProgress({ value: -5 }).root;
    const high = mountProgress({ value: 250 }).root;
    const lowFill = low
      .findAll((n) => typeof n.props.style?.[1]?.width === "string")
      .at(-1)!;
    const highFill = high
      .findAll((n) => typeof n.props.style?.[1]?.width === "string")
      .at(-1)!;
    expect(lowFill.props.style[1].width).toBe("0%");
    expect(highFill.props.style[1].width).toBe("100%");
  });

  it("renders the value layer only when showValue is set", () => {
    const without = mountProgress({ value: 40, children: "40%" }).root
      .findAllByProps({ testID: "subject" })
      .at(-1)!;
    const withValue = mountProgress({ value: 40, showValue: true, children: "40%" }).root
      .findAllByProps({ testID: "subject" })
      .at(-1)!;
    expect(withValue.findAllByType("Text" as never).length).toBeGreaterThan(
      without.findAllByType("Text" as never).length,
    );
  });
});

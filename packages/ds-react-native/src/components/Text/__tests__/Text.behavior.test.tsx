// Hand-written behavioral companion to the generated Text scaffold (RN
// emits no @custom markers, so hand assertions live in companion files).
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Text } from "../Text";

function mountText(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Text testID="subject" {...props} />);
  });
  return renderer!;
}

describe("Text — behavioral surfaces", () => {
  it("renders children and the text accessibility role", () => {
    const renderer = mountText({ children: "hello" });
    const subject = renderer.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("text");
    expect(subject.props.children).toBe("hello");
  });

  it("layers variant, size, weight, align, and transform style entries", () => {
    const full = mountText({
      variant: "title",
      size: "lg",
      weight: "bold",
      align: "center",
      transform: "uppercase",
    }).root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(Array.isArray(full.props.style)).toBe(true);
    expect(full.props.style.slice(1, 6).every(Boolean)).toBe(true);
  });

  it("passes accessibility labels through", () => {
    const subject = mountText({ accessibilityLabel: "lbl" }).root
      .findAllByProps({ testID: "subject" })
      .at(-1)!;
    expect(subject.props.accessibilityLabel).toBe("lbl");
  });
});

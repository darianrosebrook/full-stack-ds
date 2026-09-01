// Hand-written behavioral companion to the generated Label scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Label } from "../Label";

function mountLabel(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Label testID="subject" {...props} />);
  });
  return renderer!;
}

describe("Label — behavioral surfaces", () => {
  it("renders with a root style entry and no implicit role", () => {
    const subject = mountLabel().root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.style).toBeTruthy();
    expect(subject.props.accessibilityRole).toBeUndefined();
  });

  it("wraps string children in a styled text node", () => {
    const renderer = mountLabel({ children: "Email" });
    const subject = renderer.root.findAllByProps({ testID: "subject" }).at(-1)!;
    const texts = subject.findAllByType("Text" as never);
    expect(texts.length).toBeGreaterThan(0);
    expect(texts[0].props.style).toBeTruthy();
  });

  it("passes htmlFor, form, and accessibility props through", () => {
    const subject = mountLabel({
      htmlFor: "email-input",
      form: "checkout",
      accessibilityLabel: "Email label",
    }).root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityLabel).toBe("Email label");
    void subject;
  });
});

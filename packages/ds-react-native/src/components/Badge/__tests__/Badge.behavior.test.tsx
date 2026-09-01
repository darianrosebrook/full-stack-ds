// Hand-written behavioral companion to the generated Badge scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { View } from "react-native";
import { Badge } from "../Badge";

function mountBadge(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Badge testID="subject" {...props} />);
  });
  return renderer!;
}

describe("Badge — behavioral surfaces", () => {
  it("renders string children inside a content layer", () => {
    const renderer = mountBadge({ children: "New" });
    const subject = renderer.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.findAllByType("Text" as never).length).toBeGreaterThan(0);
  });

  it("layers variant, intent, and size style entries", () => {
    const plain = mountBadge().root.findAllByProps({ testID: "subject" }).at(-1)!;
    const full = mountBadge({
      variant: "solid",
      intent: "danger",
      size: "lg",
    }).root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(full.props.style.slice(1, 4).some(Boolean)).toBe(true);
    expect(full.props.style).not.toEqual(plain.props.style);
  });

  it("renders the icon slot when an icon element is provided", () => {
    const renderer = mountBadge({
      icon: <View />,
    });
    const subject = renderer.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.findAllByProps({ accessible: false }).length).toBeGreaterThan(0);
  });
});

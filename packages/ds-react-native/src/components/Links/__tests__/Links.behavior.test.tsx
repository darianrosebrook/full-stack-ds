// Hand-written behavioral companion to the generated Links scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Links } from "../Links";

function mountLinks(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Links testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Links — behavioral surfaces", () => {
  it("carries the link role", () => {
    expect(host(mountLinks()).props.accessibilityRole).toBe("link");
  });

  it("renders string children", () => {
    const renderer = mountLinks({ children: "Docs" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });
});

// Hand-written behavioral companion to the generated Card scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Card } from "../Card";

function mountCard(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Card testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Card — behavioral surfaces", () => {
  it("renders with a root style entry", () => {
    expect(host(mountCard()).props.style).toBeTruthy();
  });

  it("accepts status and density props", () => {
    const renderer = mountCard({ status: "completed", density: "compact" });
    expect(host(renderer).props.testID).toBe("subject");
  });
});

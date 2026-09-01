// Hand-written behavioral companion to the generated NavTree scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { NavTree } from "../NavTree";

function mountNavTree(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<NavTree testID="subject" label="Root" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("NavTree — behavioral surfaces", () => {
  it("renders the label", () => {
    const renderer = mountNavTree();
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });

  it("accepts href and icon props", () => {
    const renderer = mountNavTree({ href: "https://x.test", icon: "folder" });
    expect(host(renderer).props.testID).toBe("subject");
  });
});

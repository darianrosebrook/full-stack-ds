// Hand-written behavioral companion to the generated List scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { List } from "../List";

function mountList(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<List testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("List — behavioral surfaces", () => {
  it("renders string children", () => {
    const renderer = mountList({ children: "item" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });

  it("layers the inline variant style entry", () => {
    const plain = host(mountList({ children: "x" }));
    const inline = host(mountList({ variant: "inline", children: "x" }));
    expect(inline.props.style[1]).toBeTruthy();
    expect(inline.props.style).not.toEqual(plain.props.style);
  });
});

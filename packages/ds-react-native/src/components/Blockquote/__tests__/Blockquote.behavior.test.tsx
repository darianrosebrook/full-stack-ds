// Hand-written behavioral companion to the generated Blockquote scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Blockquote } from "../Blockquote";

function mountBlockquote(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Blockquote testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Blockquote — behavioral surfaces", () => {
  it("wraps string children in a text node", () => {
    const renderer = mountBlockquote({ children: "Quote" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });

  it("layers variant and size style entries", () => {
    const plain = host(mountBlockquote({ children: "q" }));
    const full = host(mountBlockquote({ variant: "highlighted", size: "lg", children: "q" }));
    expect(full.props.style[1]).toBeTruthy();
    expect(full.props.style).not.toEqual(plain.props.style);
    expect(full.findAllByType("Text" as never)[0].props.style.slice(1, 3).some(Boolean)).toBe(true);
  });
});

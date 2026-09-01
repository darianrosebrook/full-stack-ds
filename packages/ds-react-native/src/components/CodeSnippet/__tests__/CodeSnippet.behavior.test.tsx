// Hand-written behavioral companion to the generated CodeSnippet scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { CodeSnippet } from "../CodeSnippet";

function mountCodeSnippet(props: Record<string, unknown> = { text: "pnpm install" }) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<CodeSnippet testID="subject" text="x" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("CodeSnippet — behavioral surfaces", () => {
  it("renders string children", () => {
    const renderer = mountCodeSnippet({ children: "pnpm install" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });

  it("layers the samp style entry", () => {
    const plain = host(mountCodeSnippet({ children: "x" }));
    const samp = host(mountCodeSnippet({ as: "samp", children: "x" }));
    expect(samp.props.style[1]).toBeTruthy();
    expect(samp.props.style).not.toEqual(plain.props.style);
  });
});

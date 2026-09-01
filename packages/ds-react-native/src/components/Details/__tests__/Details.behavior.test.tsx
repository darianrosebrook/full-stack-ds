// Hand-written behavioral companion to the generated Details scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Details } from "../Details";

function mountDetails(props: Record<string, unknown> = { summary: "More" }) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Details testID="subject" summary="M" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Details — behavioral surfaces", () => {
  it("renders string children", () => {
    const renderer = mountDetails({ children: "More info" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });

  it("layers the inline variant style entry", () => {
    const plain = host(mountDetails({ children: "x" }));
    const inline = host(mountDetails({ variant: "inline", children: "x" }));
    expect(inline.props.style[1]).toBeTruthy();
    expect(inline.props.style).not.toEqual(plain.props.style);
  });
});

// Hand-written behavioral companion to the generated Spinner scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Spinner } from "../Spinner";

function mountSpinner(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Spinner testID="subject" {...props} />);
  });
  return renderer!;
}

const visualOf = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ accessible: false })[0]!;

const widthOf = (node: ReturnType<typeof visualOf>) =>
  node.props.style
    .flat()
    .find((s: { width?: unknown } | undefined) => s?.width !== undefined)?.width;

describe("Spinner — behavioral surfaces", () => {
  it("renders a hidden visual layer inside the root", () => {
    const renderer = mountSpinner();
    const subject = renderer.root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.findAllByProps({ accessible: false }).length).toBeGreaterThan(0);
  });

  it("accepts size, thickness, and label props without changing the shell", () => {
    const renderer = mountSpinner({
      size: "lg",
      thickness: "bold",
      label: "loading",
      showAfterMs: 100,
      ariaHidden: true,
    });
    expect(renderer.root.findAllByProps({ testID: "subject" }).at(-1)!).toBeTruthy();
  });

  it("sizes the visual from the declared size-axis tokens", () => {
    expect(widthOf(visualOf(mountSpinner({ size: "sm" })))).toBe(16);
    expect(widthOf(visualOf(mountSpinner({ size: "lg" })))).toBe(24);
  });

  it("applies exactly one generated per-variant geometry entry when sized", () => {
    const large = visualOf(mountSpinner({ size: "lg" }));
    expect(large.props.style).toEqual([{}, { width: 24, height: 24 }]);
    expect(visualOf(mountSpinner({ size: "sm" })).props.style).toEqual([
      {},
      { width: 16, height: 16 },
    ]);
  });

  it("leaves the visual unsized when no size is set", () => {
    expect(widthOf(visualOf(mountSpinner()))).toBeUndefined();
  });
});

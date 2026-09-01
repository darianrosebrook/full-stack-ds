// Hand-written behavioral companion to the generated Chip scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Chip } from "../Chip";

function mountChip(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Chip testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Chip — behavioral surfaces", () => {
  it("renders string children", () => {
    const renderer = mountChip({ children: "Filter" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });

  it("layers variant and size style entries", () => {
    const plain = host(mountChip({ children: "x" }));
    const full = host(mountChip({ variant: "selected", size: "large", children: "x" }));
    expect(full.props.style).not.toEqual(plain.props.style);
  });
});

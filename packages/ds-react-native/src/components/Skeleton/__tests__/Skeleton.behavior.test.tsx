// Hand-written behavioral companion to the generated Skeleton scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Skeleton } from "../Skeleton";

function mountSkeleton(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Skeleton testID="subject" {...props} />);
  });
  return renderer!;
}

/** Decorative shape leaves: testID-less host Views marked inaccessible. */
function shapeCount(renderer: ReactTestRenderer): number {
  return renderer.root.findAll(
    (node) =>
      String(node.type) === "View" &&
      node.props.accessible === false &&
      node.props.testID === undefined,
  ).length;
}

describe("Skeleton — behavioral surfaces", () => {
  it("is presentational by default", () => {
    const subject = mountSkeleton().root.findAllByProps({ testID: "subject" }).at(-1)!;
    expect(subject.props.accessibilityRole).toBe("none");
    expect(subject.props.accessibilityState).toEqual({ busy: false });
    expect(subject.props.accessible).toBe(false);
  });

  it("keeps the presentational shape when decorative", () => {
    const subject = mountSkeleton({ decorative: true }).root
      .findAllByProps({ testID: "subject" })
      .at(-1)!;
    expect(subject.props.accessibilityRole).toBe("none");
    expect(subject.props.accessibilityState).toEqual({ busy: false });
    expect(subject.props.accessible).toBe(false);
  });

  it("prefers the explicit ariaLabel over accessibilityLabel", () => {
    const subject = mountSkeleton({ ariaLabel: "loading" }).root
      .findAllByProps({ testID: "subject" })
      .at(-1)!;
    expect(subject.props.accessibilityLabel).toBe("loading");
  });

  // Replaced "wraps string children in a text node". Skeleton's contract sets
  // `a2ui.children.allowed: false`, declares no `children` prop, and its
  // `anatomy.dom` has no consumer content region — the five web frameworks
  // have never rendered children. RN alone wrapped them, via the generic
  // string-children path that fired only because the dom had no children of
  // its own. Realizing the declared stack/row/shape topology retired that
  // path, bringing RN into line with the contract and the other targets.
  it("renders no text node for children the contract does not admit", () => {
    const renderer = mountSkeleton({ children: "loading…" });
    expect(
      renderer.root
        .findAllByProps({ testID: "subject" })
        .at(-1)!
        .findAllByType("Text" as never).length,
    ).toBe(0);
  });

  it("renders one shape per line row when lines is set", () => {
    const renderer = mountSkeleton({ lines: 3 });
    // Host-node predicate, not findAllByProps: the latter also matches the
    // composite wrapper for each element (double-counting) and the root, which
    // is itself `accessible={false}`. The decorative shape leaves are the only
    // testID-less Views carrying that prop.
    expect(shapeCount(renderer)).toBe(3);
  });

  it("renders no shapes when lines is absent", () => {
    expect(shapeCount(mountSkeleton())).toBe(0);
  });
});

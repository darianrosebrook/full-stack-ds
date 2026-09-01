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

  it("wraps string children in a text node", () => {
    const renderer = mountSkeleton({ children: "loading…" });
    expect(
      renderer.root.findAllByProps({ testID: "subject" }).at(-1)!.findAllByType("Text" as never).length,
    ).toBeGreaterThan(0);
  });
});

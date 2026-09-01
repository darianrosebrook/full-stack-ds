// Hand-written behavioral companion to the generated Breadcrumbs scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Breadcrumbs } from "../Breadcrumbs";

function mountBreadcrumbs(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Breadcrumbs testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Breadcrumbs — behavioral surfaces", () => {
  it("defaults the accessibility label to Breadcrumb", () => {
    expect(host(mountBreadcrumbs()).props.accessibilityLabel).toBe("Breadcrumb");
  });

  it("prefers an explicit ariaLabel", () => {
    expect(host(mountBreadcrumbs({ ariaLabel: "Path" })).props.accessibilityLabel).toBe("Path");
  });

  it("renders string children inside a list layer", () => {
    const renderer = mountBreadcrumbs({ children: "Home / Docs" });
    const subject = host(renderer);
    expect(subject.findAllByType("Text" as never).length).toBeGreaterThan(0);
  });
});

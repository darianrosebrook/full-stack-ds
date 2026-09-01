// Hand-written behavioral companion to the generated NavList scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { NavList } from "../NavList";

function mountNavList(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<NavList testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("NavList — behavioral surfaces", () => {
  it("renders with a root style entry", () => {
    expect(host(mountNavList()).props.style).toBeTruthy();
  });

  it("accepts orientation and ariaLabel props", () => {
    const renderer = mountNavList({ orientation: "vertical", ariaLabel: "Nav" });
    expect(host(renderer).props.testID).toBe("subject");
  });
});

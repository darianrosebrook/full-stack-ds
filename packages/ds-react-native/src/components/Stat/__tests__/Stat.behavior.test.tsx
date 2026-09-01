// Hand-written behavioral companion to the generated Stat scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Stat } from "../Stat";

function mountStat(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Stat testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Stat — behavioral surfaces", () => {
  it("renders", () => {
    expect(host(mountStat()).props.testID).toBe("subject");
  });

  it("renders string children", () => {
    const renderer = mountStat({ children: "42" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });
});

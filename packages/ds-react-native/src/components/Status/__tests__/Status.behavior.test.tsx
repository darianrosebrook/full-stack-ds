// Hand-written behavioral companion to the generated Status scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Status } from "../Status";

function mountStatus(props: Record<string, unknown> = { status: "info" }) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Status testID="subject" status="info" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Status — behavioral surfaces", () => {
  it("renders string children", () => {
    const renderer = mountStatus({ children: "Active" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });

  it("layers the status style entry", () => {
    const plain = host(mountStatus({ children: "x" }));
    const danger = host(mountStatus({ status: "danger", children: "x" }));
    expect(danger.props.style[1]).toBeTruthy();
    expect(danger.props.style).not.toEqual(plain.props.style);
  });
});

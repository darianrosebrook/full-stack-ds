// Hand-written behavioral companion to the generated Alert scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Alert } from "../Alert";

function mountAlert(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Alert testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Alert — behavioral surfaces", () => {
  it("carries the alert role", () => {
    expect(host(mountAlert()).props.accessibilityRole).toBe("alert");
  });

  it("layers intent and level style entries", () => {
    const plain = host(mountAlert());
    const full = host(mountAlert({ intent: "danger", level: "page" }));
    expect(full.props.style.slice(1, 3).some(Boolean)).toBe(true);
    expect(full.props.style).not.toEqual(plain.props.style);
  });

  it("renders the dismiss button when dismissible", () => {
    const renderer = mountAlert({ dismissible: true, dismissLabel: "Close" });
    const subject = host(renderer);
    expect(subject.findAllByProps({ accessibilityLabel: "Close" }).length).toBeGreaterThan(0);
  });

  it("renders string children", () => {
    const renderer = mountAlert({ children: "Heads up" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });
});

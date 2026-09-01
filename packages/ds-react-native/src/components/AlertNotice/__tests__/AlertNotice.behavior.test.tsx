// Hand-written behavioral companion to the generated AlertNotice scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { AlertNotice } from "../AlertNotice";

function mountAlertNotice(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<AlertNotice testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("AlertNotice — behavioral surfaces", () => {
  it("carries the alert role", () => {
    expect(host(mountAlertNotice()).props.accessibilityRole).toBe("alert");
  });

  it("layers status and level style entries", () => {
    const plain = host(mountAlertNotice());
    const full = host(mountAlertNotice({ status: "error", level: "page" }));
    expect(full.props.style.slice(1, 3).some(Boolean)).toBe(true);
    expect(full.props.style).not.toEqual(plain.props.style);
  });

  it("renders the dismiss button when dismissible", () => {
    const renderer = mountAlertNotice({ dismissible: true });
    const subject = host(renderer);
    expect(subject.findAllByProps({ accessibilityLabel: "Dismiss" }).length).toBeGreaterThan(0);
  });

  it("renders string children", () => {
    const renderer = mountAlertNotice({ children: "Notice" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });
});

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
});

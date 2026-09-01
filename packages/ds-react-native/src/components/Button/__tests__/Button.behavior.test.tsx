// Hand-written behavioral companion to the generated Button scaffold.
import { describe, expect, it, vi } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Button } from "../Button";

function mountButton(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Button testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Button — behavioral surfaces", () => {
  it("carries the togglebutton role and press state", () => {
    const subject = host(mountButton());
    expect(subject.props.accessibilityRole).toBe("togglebutton");
    expect(subject.props.accessibilityState).toBeTruthy();
  });

  it("reflects disabled, expanded, selected, and busy states", () => {
    const subject = host(
      mountButton({ disabled: true, ariaExpanded: true, ariaPressed: true, loading: true }),
    );
    expect(subject.props.accessibilityState).toMatchObject({
      disabled: true,
      expanded: true,
      selected: true,
      busy: true,
    });
  });

  it("fires onClick through the press handler", () => {
    const onClick = vi.fn();
    const renderer = mountButton({ onClick });
    const subject = host(renderer);
    act(() => {
      subject.props.onPress();
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("layers size and variant style entries", () => {
    const plain = host(mountButton());
    const full = host(mountButton({ size: "large", variant: "destructive" }));
    expect(full.props.style).not.toEqual(plain.props.style);
  });
});

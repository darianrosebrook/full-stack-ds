// Hand-written behavioral companion to the generated Avatar scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Avatar } from "../Avatar";

function mountAvatar(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Avatar testID="subject" name="Ada" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Avatar — behavioral surfaces", () => {
  it("falls back to the name as the accessibility label", () => {
    expect(host(mountAvatar()).props.accessibilityLabel).toBe("Ada");
  });

  it("layers the size style entry", () => {
    const plain = host(mountAvatar());
    const large = host(mountAvatar({ size: "extra-large" }));
    expect(large.props.style[1]).toBeTruthy();
    expect(large.props.style).not.toEqual(plain.props.style);
  });

  it("renders an image when a src is provided", () => {
    const renderer = mountAvatar({ src: "https://x.test/a.png" });
    const subject = host(renderer);
    expect(subject.findAllByType("Image" as never).length).toBeGreaterThan(0);
  });

  it("renders no image without a src", () => {
    const renderer = mountAvatar();
    expect(host(renderer).findAllByType("Image" as never).length).toBe(0);
  });
});

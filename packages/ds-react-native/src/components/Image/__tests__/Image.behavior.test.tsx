// Hand-written behavioral companion to the generated Image scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Image } from "../Image";

function mountImage(props: Record<string, unknown> = { alt: "" }) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Image testID="subject" alt="" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Image — behavioral surfaces", () => {
  it("renders the native image with the src", () => {
    const renderer = mountImage({ src: "https://x.test/i.png", alt: "diagram" });
    const subject = host(renderer);
    const native = subject.findAllByType("Image" as never);
    expect(native.length).toBeGreaterThan(0);
    expect(native.at(-1)!.props.source).toBeTruthy();
  });

  it("applies aspectRatio and radius style entries", () => {
    const plain = host(mountImage({ src: "https://x.test/i.png" }));
    const styled = host(
      mountImage({ src: "https://x.test/i.png", aspectRatio: "video", radius: "full" }),
    );
    expect(styled.props.style).not.toEqual(plain.props.style);
  });
});

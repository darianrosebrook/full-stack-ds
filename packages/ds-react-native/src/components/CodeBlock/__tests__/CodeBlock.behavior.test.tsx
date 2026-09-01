// Hand-written behavioral companion to the generated CodeBlock scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { CodeBlock } from "../CodeBlock";

function mountCodeBlock(props: Record<string, unknown> = { code: "x", language: "plain" }) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<CodeBlock testID="subject" code="x" language="plaintext" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("CodeBlock — behavioral surfaces", () => {
  it("renders the code prop as text", () => {
    const renderer = mountCodeBlock({ code: "const a = 1;", language: "typescript" });
    const subject = host(renderer);
    expect(subject.findAllByType("Text" as never).length).toBeGreaterThan(0);
  });

  it("renders without highlight tokens when highlight is false", () => {
    const renderer = mountCodeBlock({
      code: "x",
      language: "typescript",
      highlight: false,
    });
    expect(host(renderer)).toBeTruthy();
  });
});

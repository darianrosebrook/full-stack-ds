// Hand-written behavioral companion to the generated Postcard scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Postcard } from "../Postcard";

function mountPostcard(props: Record<string, unknown> = { postId: "p1", author: { name: "a", handle: "h", avatar: "" }, timestamp: "t", stats: { likes: 0, replies: 0, reposts: 0 } }) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Postcard testID="subject" postId="p1" author={{ name: "a", handle: "h", avatar: "" }} timestamp="t" stats={{ likes: 0, replies: 0, reposts: 0 }} {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Postcard — behavioral surfaces", () => {
  it("renders string children", () => {
    const renderer = mountPostcard({ children: "Greetings" });
    expect(host(renderer).findAllByType("Text" as never).length).toBeGreaterThan(0);
  });
});

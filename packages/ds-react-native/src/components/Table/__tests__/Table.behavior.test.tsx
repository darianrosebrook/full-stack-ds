// Hand-written behavioral companion to the generated Table scaffold.
import { describe, expect, it } from "vitest";
import TestRenderer, { act, type ReactTestRenderer } from "react-test-renderer";
import { Table } from "../Table";

function mountTable(props: Record<string, unknown> = {}) {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = TestRenderer.create(<Table testID="subject" {...props} />);
  });
  return renderer!;
}

const host = (r: ReactTestRenderer) =>
  r.root.findAllByProps({ testID: "subject" }).at(-1)!;

describe("Table — behavioral surfaces", () => {
  it("renders with a root style entry", () => {
    expect(host(mountTable()).props.style).toBeTruthy();
  });

  it("accepts responsive and ariaLabel props", () => {
    const renderer = mountTable({ responsive: true, ariaLabel: "Data" });
    expect(host(renderer).props.testID).toBe("subject");
  });
});

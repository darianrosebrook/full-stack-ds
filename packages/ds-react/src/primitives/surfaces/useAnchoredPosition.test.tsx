import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAnchoredPosition } from "./useAnchoredPosition";

function rect(
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect {
  return {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("useAnchoredPosition", () => {
  it("returns coordinates local to a composed portal boundary", async () => {
    const boundary = document.createElement("div");
    const anchor = document.createElement("button");
    const content = document.createElement("div");
    boundary.getBoundingClientRect = () => rect(100, 200, 600, 400);
    anchor.getBoundingClientRect = () => rect(300, 300, 100, 20);
    content.getBoundingClientRect = () => rect(0, 0, 200, 100);

    const { result } = renderHook(() =>
      useAnchoredPosition({
        anchor,
        content,
        open: true,
        placement: "bottom",
        collision: "none",
        boundary,
      }),
    );

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current).toEqual({
      placement: "bottom",
      top: 128,
      left: 150,
      ready: true,
    });
  });
});

// Focus-trap behavior proofs through a minimal SFC harness. The trap is
// also exercised indirectly by Dialog/Sheet/Tooltip, but the wrap-around,
// empty-container, and inactive paths are only reachable here.
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/svelte";
import FocusTrapHarness from "./fixtures/FocusTrapHarness.svelte";

afterEach(cleanup);

function tab(shift = false): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey: shift,
    bubbles: true,
    cancelable: true,
  });
  document.dispatchEvent(event);
  return event;
}

describe("createFocusTrap — wrap-around cycling", () => {
  it("wraps forward from the last focusable to the first", () => {
    const { getByTestId } = render(FocusTrapHarness, { active: true });
    (getByTestId("last") as HTMLElement).focus();
    const event = tab();
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("wraps backward from the first focusable to the last", () => {
    const { getByTestId } = render(FocusTrapHarness, { active: true });
    (getByTestId("first") as HTMLElement).focus();
    const event = tab(true);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(getByTestId("last"));
  });

  it("does not intercept Tab when a middle focusable is focused", () => {
    const { getByTestId } = render(FocusTrapHarness, { active: true });
    (getByTestId("mid") as HTMLElement).focus();
    const event = tab();
    expect(event.defaultPrevented).toBe(false);
  });

  it("does not intercept Tab while inactive", () => {
    const { getByTestId } = render(FocusTrapHarness, { active: false });
    (getByTestId("last") as HTMLElement).focus();
    const event = tab();
    expect(event.defaultPrevented).toBe(false);
  });

  it("prevents default when the container has no focusables", () => {
    const { getByTestId } = render(FocusTrapHarness, { active: true, empty: true });
    const event = tab();
    expect(event.defaultPrevented).toBe(true);
    void getByTestId;
  });
});

describe("createFocusTrap — lifecycle", () => {
  it("removes the document listener on unmount", () => {
    const { getByTestId, unmount } = render(FocusTrapHarness, { active: true });
    (getByTestId("last") as HTMLElement).focus();
    unmount();
    const event = tab();
    expect(event.defaultPrevented).toBe(false);
  });

  it("ignores non-Tab keys", () => {
    const { getByTestId } = render(FocusTrapHarness, { active: true });
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    void getByTestId;
  });
});

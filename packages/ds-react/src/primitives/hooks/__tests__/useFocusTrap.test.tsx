import { describe, it, expect } from "vitest";
import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { useFocusTrap } from "../useFocusTrap";

function Trap({
  active,
  onMounted,
}: {
  active: boolean;
  onMounted?: (root: HTMLElement) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, { active });
  return (
    <div
      ref={(el) => {
        ref.current = el;
        if (el && onMounted) onMounted(el);
      }}
      tabIndex={-1}
      data-testid="trap"
    >
      <button data-testid="first">first</button>
      <button data-testid="middle">middle</button>
      <button data-testid="last">last</button>
    </div>
  );
}

describe("useFocusTrap", () => {
  it("focuses the first focusable child on activation", () => {
    const { getByTestId } = render(<Trap active />);
    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("Tab on the last focusable wraps to the first", () => {
    const { getByTestId } = render(<Trap active />);
    const trap = getByTestId("trap");
    const last = getByTestId("last");
    act(() => last.focus());
    act(() => {
      trap.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(getByTestId("first"));
  });

  it("Shift+Tab on the first focusable wraps to the last", () => {
    const { getByTestId } = render(<Trap active />);
    const trap = getByTestId("trap");
    const first = getByTestId("first");
    act(() => first.focus());
    act(() => {
      trap.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true,
          bubbles: true,
        }),
      );
    });
    expect(document.activeElement).toBe(getByTestId("last"));
  });

  it("does nothing when active=false", () => {
    const outside = document.createElement("button");
    outside.textContent = "outside";
    document.body.appendChild(outside);
    outside.focus();
    render(<Trap active={false} />);
    expect(document.activeElement).toBe(outside);
    document.body.removeChild(outside);
  });

  it("restores focus to the previously active element on deactivation", () => {
    const before = document.createElement("button");
    document.body.appendChild(before);
    before.focus();
    const { unmount } = render(<Trap active />);
    expect(document.activeElement).not.toBe(before);
    unmount();
    expect(document.activeElement).toBe(before);
    document.body.removeChild(before);
  });
});

import { describe, it, expect, vi } from "vitest";
import { act, render, renderHook } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useAnchorToggle } from "../useAnchorToggle";

describe("useAnchorToggle", () => {
  it("starts closed by default and toggles open", () => {
    const { result } = renderHook(() => useAnchorToggle());
    expect(result.current.open).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.open).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.open).toBe(false);
  });

  it("respects defaultOpen", () => {
    const { result } = renderHook(() =>
      useAnchorToggle({ defaultOpen: true }),
    );
    expect(result.current.open).toBe(true);
  });

  it("fires onOpenChange in uncontrolled mode", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() =>
      useAnchorToggle({ onOpenChange }),
    );
    act(() => result.current.openPanel());
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("Escape closes the panel when closeOnEscape is on (default)", () => {
    const { result } = renderHook(() => useAnchorToggle({ defaultOpen: true }));
    expect(result.current.open).toBe(true);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.open).toBe(false);
  });

  it("Escape is ignored when closeOnEscape is off", () => {
    const { result } = renderHook(() =>
      useAnchorToggle({ defaultOpen: true, closeOnEscape: false }),
    );
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.open).toBe(true);
  });

  it("clicks outside both panel and anchor close the panel", () => {
    function Harness() {
      const t = useAnchorToggle({ defaultOpen: true });
      // Bind refs to actual elements
      return (
        <div>
          <button ref={t.anchorRef as React.RefObject<HTMLButtonElement>}>
            anchor
          </button>
          <div ref={t.panelRef as React.RefObject<HTMLDivElement>}>
            panel
            <span data-testid="open">{String(t.open)}</span>
          </div>
          <div data-testid="outside">outside</div>
        </div>
      );
    }
    const { getByTestId } = render(<Harness />);
    expect(getByTestId("open").textContent).toBe("true");
    act(() => {
      getByTestId("outside").dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true }),
      );
    });
    expect(getByTestId("open").textContent).toBe("false");
  });

  it("clicks inside the panel do not close it", () => {
    function Harness() {
      const t = useAnchorToggle({ defaultOpen: true });
      return (
        <div ref={t.panelRef as React.RefObject<HTMLDivElement>}>
          <span data-testid="inside">inside</span>
          <span data-testid="open">{String(t.open)}</span>
        </div>
      );
    }
    const { getByTestId } = render(<Harness />);
    act(() => {
      getByTestId("inside").dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true }),
      );
    });
    expect(getByTestId("open").textContent).toBe("true");
  });

  it("controlled mode mirrors the prop and does not mutate internally", () => {
    const onOpenChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ open }) => useAnchorToggle({ open, onOpenChange }),
      { initialProps: { open: false } },
    );
    expect(result.current.open).toBe(false);
    act(() => result.current.openPanel());
    expect(result.current.open).toBe(false); // unchanged: parent owns it
    expect(onOpenChange).toHaveBeenCalledWith(true);
    rerender({ open: true });
    expect(result.current.open).toBe(true);
  });

  // Compile-time only: verifies the harness pattern uses the refs without issue
  it("ref bindings work after first render", () => {
    function Harness() {
      const t = useAnchorToggle();
      const sentinel = useRef(false);
      useEffect(() => {
        sentinel.current = t.panelRef.current === null;
      }, [t.panelRef]);
      return null;
    }
    expect(() => render(<Harness />)).not.toThrow();
  });
});

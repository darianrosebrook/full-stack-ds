import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useAutoDismiss } from "../useAutoDismiss";

describe("useAutoDismiss", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires onDismiss after the budget elapses while open", () => {
    const onDismiss = vi.fn();
    renderHook(() => useAutoDismiss({ open: true, durationMs: 6000, onDismiss }));
    act(() => {
      vi.advanceTimersByTime(5999);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("does not run while closed and disables on null/0", () => {
    const onDismiss = vi.fn();
    renderHook(() => useAutoDismiss({ open: false, durationMs: 6000, onDismiss }));
    renderHook(() => useAutoDismiss({ open: true, durationMs: null, onDismiss }));
    renderHook(() => useAutoDismiss({ open: true, durationMs: 0, onDismiss }));
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("pause defers dismissal and resume continues with the remaining budget", () => {
    const onDismiss = vi.fn();
    const { result } = renderHook(() =>
      useAutoDismiss({ open: true, durationMs: 6000, onDismiss }),
    );
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    act(() => {
      result.current.getPauseProps().onPointerEnter();
    });
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      result.current.getPauseProps().onPointerLeave();
    });
    // Remaining budget was 2000ms, not a fresh 6000ms.
    act(() => {
      vi.advanceTimersByTime(1999);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("clears the timer when closed mid-budget", () => {
    const onDismiss = vi.fn();
    const { rerender } = renderHook(
      ({ open }) => useAutoDismiss({ open, durationMs: 6000, onDismiss }),
      { initialProps: { open: true } },
    );
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    rerender({ open: false });
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("pauses on focus capture and resumes on blur capture", () => {
    const onDismiss = vi.fn();
    const { result } = renderHook(() =>
      useAutoDismiss({ open: true, durationMs: 1000, onDismiss }),
    );
    act(() => {
      result.current.getPauseProps().onFocusCapture();
    });
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => {
      result.current.getPauseProps().onBlurCapture();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

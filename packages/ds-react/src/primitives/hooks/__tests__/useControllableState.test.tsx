import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useControllableState } from "../useControllableState";

describe("useControllableState", () => {
  it("uses defaultValue in uncontrolled mode and updates internal state", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "a" }),
    );
    expect(result.current[0]).toBe("a");

    act(() => result.current[1]("b"));
    expect(result.current[0]).toBe("b");
  });

  it("uses controlled value and ignores internal state when controlled is set", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ controlled }) =>
        useControllableState({
          controlled,
          defaultValue: "a",
          onChange,
        }),
      { initialProps: { controlled: "x" as string } },
    );
    expect(result.current[0]).toBe("x");

    act(() => result.current[1]("y"));
    // Value still "x" because controlled hasn't changed; onChange fired.
    expect(result.current[0]).toBe("x");
    expect(onChange).toHaveBeenCalledWith("y");

    rerender({ controlled: "z" });
    expect(result.current[0]).toBe("z");
  });

  it("calls onChange in uncontrolled mode too", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 0, onChange }),
    );
    act(() => result.current[1](7));
    expect(onChange).toHaveBeenCalledWith(7);
  });

  it("supports updater function in setter", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 1 }),
    );
    act(() => result.current[1]((prev) => prev + 1));
    expect(result.current[0]).toBe(2);
  });

  it("setter is referentially stable across re-renders", () => {
    const { result, rerender } = renderHook(() =>
      useControllableState({ defaultValue: "a" }),
    );
    const setterFirst = result.current[1];
    rerender();
    const setterSecond = result.current[1];
    expect(setterFirst).toBe(setterSecond);
  });

  it("setter is stable across value updates in uncontrolled mode (regression)", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: 0 }),
    );
    const setterBefore = result.current[1];
    act(() => result.current[1](1));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(result.current[1]).toBe(setterBefore);
  });

  it("setter is stable across controlled-value updates (regression)", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ controlled }) =>
        useControllableState({ controlled, defaultValue: "a", onChange }),
      { initialProps: { controlled: "x" } },
    );
    const setterBefore = result.current[1];
    rerender({ controlled: "y" });
    rerender({ controlled: "z" });
    expect(result.current[1]).toBe(setterBefore);
  });
});

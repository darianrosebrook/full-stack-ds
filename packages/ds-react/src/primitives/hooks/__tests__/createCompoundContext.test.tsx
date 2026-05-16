import { describe, it, expect } from "vitest";
import { render, renderHook } from "@testing-library/react";
import { createCompoundContext } from "../createCompoundContext";

interface Value {
  count: number;
}

describe("createCompoundContext", () => {
  it("returns the provided value to consumers inside the provider", () => {
    const [Provider, useValue] = createCompoundContext<Value>("Demo");
    const { result } = renderHook(() => useValue(), {
      wrapper: ({ children }) => (
        <Provider value={{ count: 7 }}>{children}</Provider>
      ),
    });
    expect(result.current.count).toBe(7);
  });

  it("throws a descriptive error outside the provider", () => {
    const [, useValue] = createCompoundContext<Value>("Demo");
    expect(() => renderHook(() => useValue())).toThrowError(
      /Demo compound component used outside of <Demo> provider/,
    );
  });

  it("supports nested providers (innermost wins)", () => {
    const [Provider, useValue] = createCompoundContext<Value>("Demo");
    function Inner() {
      const v = useValue();
      return <span data-testid="value">{v.count}</span>;
    }
    const { getByTestId } = render(
      <Provider value={{ count: 1 }}>
        <Provider value={{ count: 2 }}>
          <Inner />
        </Provider>
      </Provider>,
    );
    expect(getByTestId("value").textContent).toBe("2");
  });
});

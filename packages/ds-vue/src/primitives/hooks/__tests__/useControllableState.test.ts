// VUE-FIRST-RENDER-CONTROLLABLE-DEFAULT-01: layered characterization
// of where `defaultOpen: true` is lost between consumer and template.
// This file pins the lowest layer — `useControllableState` itself.
// The expectation: with `controlled: undefined` and `defaultValue: true`,
// the returned `value` should read `true` immediately, no flushing.

import { describe, expect, it } from "vitest";
import { useControllableState } from "../useControllableState";

describe("useControllableState — uncontrolled default propagation", () => {
  it("seeds internal state from defaultValue when controlled is omitted", () => {
    const { value } = useControllableState<boolean>({ defaultValue: true });
    expect(value.value).toBe(true);
  });

  it("seeds internal state with defaultValue=false correctly", () => {
    const { value } = useControllableState<boolean>({ defaultValue: false });
    expect(value.value).toBe(false);
  });

  it("seeds internal state with a string defaultValue", () => {
    const { value } = useControllableState<string>({ defaultValue: "beta" });
    expect(value.value).toBe("beta");
  });

  it("returns the controlled getter's result when controlled returns a value", () => {
    const { value } = useControllableState<boolean>({
      controlled: () => true,
      defaultValue: false,
    });
    expect(value.value).toBe(true);
  });

  it("falls back to defaultValue when controlled() returns undefined", () => {
    // The uncontrolled-with-default contract: `controlled` may be set
    // but return undefined for any given read (this is how the codegen
    // bridges optional props — `() => props.value` returns undefined
    // when consumer didn't pass `value`).
    const { value } = useControllableState<boolean>({
      controlled: () => undefined,
      defaultValue: true,
    });
    expect(value.value).toBe(true);
  });
});

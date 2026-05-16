import { describe, expect, it } from "vitest";
import { jsAccessorFor } from "./component-source.js";

describe("Svelte jsAccessorFor (booleanModifier safeName mismatch guard)", () => {
  // Context: ClassRecipeIR.booleanModifiers stores `safeName` as a
  // dash-stripped string ("data-loading" → "dataloading") because that
  // doubles as the CSS-class fragment. The destructured Svelte local for
  // the same prop is camelCased ("dataLoading"). If the class generator
  // referenced `mod.safeName` directly, it would emit a reference to an
  // undefined local. These tests pin the conversion that bridges the gap.

  it("preserves identifier-shape names", () => {
    expect(jsAccessorFor("checked")).toBe("checked");
    expect(jsAccessorFor("disabled")).toBe("disabled");
    expect(jsAccessorFor("isOpen")).toBe("isOpen");
  });

  it("camelCases hyphenated names", () => {
    expect(jsAccessorFor("data-loading")).toBe("dataLoading");
    expect(jsAccessorFor("aria-hidden")).toBe("ariaHidden");
    expect(jsAccessorFor("data-disabled")).toBe("dataDisabled");
  });

  it("only camelCases segments after a dash, not arbitrary uppercase letters", () => {
    expect(jsAccessorFor("data-loading-state")).toBe("dataLoadingState");
  });

  it("does NOT produce the dash-stripped CSS-class form", () => {
    // The IR's booleanModifier safeName for "data-loading" is "dataloading"
    // (no camelCase). That is a CSS-class fragment, not a JS identifier.
    // jsAccessorFor must not emit that form, or the generated Svelte will
    // reference an undefined local at runtime.
    expect(jsAccessorFor("data-loading")).not.toBe("dataloading");
  });
});

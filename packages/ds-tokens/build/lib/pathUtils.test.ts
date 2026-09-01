import { describe, expect, it } from "vitest";
import { getNestedValue, selectByKeys } from "./pathUtils.js";

describe("getNestedValue", () => {
  const tree = {
    color: { primary: { base: "#000000" } },
    flat: "value",
  };

  it("walks a dotted path to the leaf", () => {
    expect(getNestedValue(tree, "color.primary.base")).toBe("#000000");
    expect(getNestedValue(tree, "flat")).toBe("value");
  });

  it("returns undefined for missing segments", () => {
    expect(getNestedValue(tree, "color.secondary")).toBeUndefined();
    expect(getNestedValue(tree, "color.primary.base.deep")).toBeUndefined();
    expect(getNestedValue(tree, "nope")).toBeUndefined();
  });

  it("returns undefined when a mid-path value is not an object", () => {
    expect(getNestedValue(tree, "flat.child")).toBeUndefined();
  });
});

describe("selectByKeys", () => {
  const themed = { light: "#ffffff", dark: "#000000" };

  it("returns the first present key in order", () => {
    expect(selectByKeys(themed, ["dark", "light"])).toBe("#000000");
    expect(selectByKeys(themed, ["light", "dark"])).toBe("#ffffff");
  });

  it("skips undefined keys and missing keys", () => {
    expect(selectByKeys(themed, [undefined, "light"])).toBe("#ffffff");
    expect(selectByKeys(themed, ["nope", "light"])).toBe("#ffffff");
  });

  it("returns undefined when no key matches", () => {
    expect(selectByKeys(themed, ["nope", undefined])).toBeUndefined();
  });
});

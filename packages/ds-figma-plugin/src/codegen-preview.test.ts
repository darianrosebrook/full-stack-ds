// Dev Mode codegen previews — pure functions of (descriptor, target,
// variantValues), no Figma global required.
import { describe, expect, it } from "vitest";
import {
  CODEGEN_TARGETS,
  generateCodePreviewsForDescriptor,
  getDefaultVariantValues,
  isCodegenTarget,
} from "./codegen-preview.js";
import type { FigmaComponentDescriptor } from "./ui-model.js";

const descriptor: FigmaComponentDescriptor = {
  schemaVersion: 1,
  component: { name: "Button", cssPrefix: "button" },
  anatomy: [],
  props: [],
  variants: { Size: ["sm", "md", "lg"], Intent: ["primary", "ghost"] },
};

describe("codegen-preview — target guards and defaults", () => {
  it("admits every registered target and rejects unknown strings", () => {
    for (const target of CODEGEN_TARGETS) {
      expect(isCodegenTarget(target)).toBe(true);
    }
    expect(isCodegenTarget("react")).toBe(true);
    expect(isCodegenTarget("swift")).toBe(false);
    expect(isCodegenTarget("")).toBe(false);
  });

  it("defaults variant values to the first value of each axis", () => {
    expect(getDefaultVariantValues(descriptor)).toEqual({
      Size: "sm",
      Intent: "primary",
    });
  });

  it("handles a descriptor with no variants", () => {
    expect(
      getDefaultVariantValues({ ...descriptor, variants: {} }),
    ).toEqual({});
  });
});

describe("codegen-preview — per-target previews", () => {
  it("generates the react preview with prop syntax and defaults to react", () => {
    const [result] = generateCodePreviewsForDescriptor(descriptor);
    expect(result.title).toBe("React");
    expect(result.code).toContain('import { Button } from "@full-stack-ds/react";');
    expect(result.code).toContain('Size="sm"');
    expect(result.code).toContain('Intent="primary"');
  });

  it("honors explicit variant values", () => {
    const [result] = generateCodePreviewsForDescriptor(descriptor, {
      target: "react",
      variantValues: { Size: "lg", Intent: "ghost" },
    });
    expect(result.code).toContain('Size="lg"');
    expect(result.code).toContain('Intent="ghost"');
  });

  it("generates svelte, vue, angular, and lit previews in their idioms", () => {
    for (const target of ["svelte", "vue", "angular", "lit"] as const) {
      const [result] = generateCodePreviewsForDescriptor(descriptor, { target });
      expect(result.code).toContain("Button");
      if (target === "angular") {
        expect(result.code).toContain("<fsds-button");
      }
    }
  });

  it("generates react-native, swiftui, and compose previews", () => {
    for (const target of ["react-native", "swiftui", "compose"] as const) {
      const [result] = generateCodePreviewsForDescriptor(descriptor, { target });
      expect(result.code).toContain("Button");
    }
  });

  it("escapes attribute values in generated markup", () => {
    const [result] = generateCodePreviewsForDescriptor(descriptor, {
      target: "react",
      variantValues: { Size: 'a"&b' },
    });
    expect(result.code).toContain('Size="a&quot;&amp;b"');
  });
});

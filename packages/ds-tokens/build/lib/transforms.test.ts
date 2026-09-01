import { describe, expect, it } from "vitest";
import {
  builtInTransforms,
  colorValueToCSS,
  dimensionValueToCSS,
  isStructuredColorValue,
  isStructuredDimensionValue,
  shadowValueToCSS,
} from "./transforms.js";

function transformFor(matchInput: { type?: string; path?: string }) {
  // The border matcher dereferences `path` without guarding it; dispatch
  // helpers must tolerate matchers that reject inputs by throwing.
  return builtInTransforms.find((t) => {
    try {
      return t.match(matchInput);
    } catch {
      return false;
    }
  })!;
}

const baseCtx = { config: { unitPreferences: {} } };

describe("type guards", () => {
  it("recognizes structured DTCG values", () => {
    expect(isStructuredColorValue({ colorSpace: "srgb", components: [1, 0, 0] }))
      .toBe(true);
    expect(isStructuredColorValue("#ff0000")).toBe(false);
    expect(isStructuredColorValue(null)).toBe(false);
    expect(isStructuredColorValue({ colorSpace: "srgb" })).toBe(false);

    expect(isStructuredDimensionValue({ value: 16, unit: "px" })).toBe(true);
    expect(isStructuredDimensionValue({ value: "16", unit: "px" })).toBe(false);
    expect(isStructuredDimensionValue("16px")).toBe(false);
  });
});

describe("colorValueToCSS", () => {
  it("converts srgb components to hex with alpha handling", () => {
    expect(
      colorValueToCSS({ colorSpace: "srgb", components: [1, 0, 0] }),
    ).toBe("#ff0000");
    expect(
      colorValueToCSS({ colorSpace: "srgb", components: [1, 0, 0], alpha: 0.5 }),
    ).toBe("#ff000080");
  });

  it("converts oklch structured values and passes oklab through raw", () => {
    const whiteOklch = colorValueToCSS({
      colorSpace: "oklch",
      components: [1, 0, 0],
    });
    expect(whiteOklch).toBe("#ffffff");

    // The CSS parser does not recognize oklab() input, so the structured
    // oklab value falls back to raw css() text instead of a wrong color.
    const oklabRaw = colorValueToCSS({
      colorSpace: "oklab",
      components: [1, 0, 0],
    });
    expect(oklabRaw).toBe("oklab(1 0 0)");
  });

  it("honors the rgb, hsl and oklch target formats", () => {
    const red = { colorSpace: "srgb", components: [1, 0, 0] };
    expect(colorValueToCSS(red, "rgb")).toBe("rgb(255, 0, 0)");
    expect(colorValueToCSS(red, "hsl")).toBe("hsl(0, 100%, 50%)");
    const oklch = colorValueToCSS(red, "oklch");
    expect(oklch.startsWith("oklch(")).toBe(true);
  });

  it("falls back to raw css() text for unknown spaces and unparseable input", () => {
    expect(
      colorValueToCSS({ colorSpace: "display-p3", components: [1, 0, 0] }),
    ).toBe("display-p3(1 0 0)");
    expect(colorValueToCSS({ colorSpace: "srgb", components: [1] })).toBe(
      "srgb(1)",
    );
  });
});

describe("dimensionValueToCSS", () => {
  it("joins value and unit", () => {
    expect(dimensionValueToCSS({ value: 16, unit: "px" })).toBe("16px");
    expect(dimensionValueToCSS({ value: 1.5, unit: "rem" })).toBe("1.5rem");
  });
});

describe("builtInTransforms", () => {
  it("converts dimension values with the configured unit preference", () => {
    const transform = transformFor({ type: "dimension" });
    expect(
      transform.apply({ value: 16, unit: "px" }, baseCtx),
    ).toBe("16px");
    expect(
      transform.apply(10, { config: { unitPreferences: { dimension: "rem" } } }),
    ).toBe("10rem");
    expect(
      transform.apply(10, baseCtx),
    ).toBe("10px");
    expect(transform.apply("10em", baseCtx)).toBe("10em");
    expect(transform.apply(null, baseCtx)).toBeNull();
  });

  it("converts durations to ms or s", () => {
    const transform = transformFor({ type: "duration" });
    expect(
      transform.apply(250, { config: { unitPreferences: { duration: "s" } } }),
    ).toBe("0.25s");
    expect(transform.apply(250, baseCtx)).toBe("250ms");
    expect(transform.apply("300ms", baseCtx)).toBe("300ms");
  });

  it("normalizes legacy color strings to the configured format", () => {
    const transform = transformFor({ type: "color" });
    expect(transform.apply("#ff0000", baseCtx)).toBe("#ff0000");
    expect(
      transform.apply("#ff0000", {
        config: { unitPreferences: { color: "rgb" } },
      }),
    ).toBe("rgb(255, 0, 0)");
    expect(
      transform.apply("#ff0000", {
        config: { unitPreferences: { color: "hsl" } },
      }),
    ).toBe("hsl(0, 100%, 50%)");
    expect(
      transform.apply("hsl(120, 100%, 50%)", {
        config: { unitPreferences: { color: "oklch" } },
      }),
    ).toMatch(/^oklch\(/);
    // Unknown formats are left intact.
    expect(transform.apply("banana", baseCtx)).toBe("banana");
    expect(transform.apply(42, baseCtx)).toBe(42);
  });

  it("adds a default border style for bare color strings", () => {
    const transform = transformFor({ path: "button.border" });
    expect(transform.apply("#ff0000", baseCtx)).toBe("1px solid #ff0000");
    expect(transform.apply("1px dashed #000", baseCtx)).toBe("1px dashed #000");
  });

  it("serializes typography objects", () => {
    const transform = transformFor({ type: "typography" });
    expect(
      transform.apply(
        {
          fontFamily: "Inter",
          fontSize: { value: 16, unit: "px" },
          fontWeight: 600,
          lineHeight: 1.5,
          letterSpacing: { value: 0.5, unit: "px" },
        },
        baseCtx,
      ),
    ).toBe(
      "font-family: Inter; font-size: 16px; font-weight: 600; line-height: 1.5; letter-spacing: 0.5px",
    );
    expect(transform.apply("system-ui", baseCtx)).toBe("system-ui");
  });

  it("serializes shadow arrays and single objects", () => {
    const transform = transformFor({ type: "shadow" });
    expect(
      transform.apply(
        { offsetX: 0, offsetY: 2, blur: 4, color: "#00000080", inset: true },
        baseCtx,
      ),
    ).toBe("inset 0 2 4 #00000080");
    expect(
      transform.apply(
        [{ offsetX: { value: 1, unit: "px" }, offsetY: 0, color: "black" }, "0 0 0 red"],
        baseCtx,
      ),
    ).toBe("1px 0 black, 0 0 0 red");
    expect(transform.apply("0 1px 2px red", baseCtx)).toBe("0 1px 2px red");
  });
});

describe("shadowValueToCSS", () => {
  it("renders full shadows with structured dimensions and colors", () => {
    expect(
      shadowValueToCSS({
        offsetX: { value: 2, unit: "px" },
        offsetY: "4px",
        blur: 8,
        spread: { value: 1, unit: "px" },
        color: { colorSpace: "srgb", components: [0, 0, 0], alpha: 0.5 },
        inset: true,
      }),
    ).toBe("inset 2px 4px 8 1px #00000080");
  });

  it("renders a minimal shadow with only offsets", () => {
    expect(shadowValueToCSS({ offsetX: 1, offsetY: 1 })).toBe("1 1");
  });

  it("returns an empty string for an empty shadow object", () => {
    expect(shadowValueToCSS({})).toBe("");
  });
});

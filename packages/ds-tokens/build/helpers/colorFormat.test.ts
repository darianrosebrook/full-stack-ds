import { describe, expect, it } from "vitest";
import {
  formatHex,
  formatHsl,
  formatOklch,
  formatRgb,
  parseCssColorToRgb,
  parseHex,
  parseHsl,
  parseOklch,
  parseRgb,
} from "./colorFormat.js";

describe("parseHex / formatHex", () => {
  it("parses shorthand and long hex", () => {
    expect(parseHex("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHex("ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseHex("nope")).toBeNull();
  });

  it("formats with clamping and zero padding", () => {
    expect(formatHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
    expect(formatHex({ r: 1, g: 2, b: 3 })).toBe("#010203");
    expect(formatHex({ r: -5, g: 999, b: 0 })).toBe("#00ff00");
  });
});

describe("parseRgb / formatRgb", () => {
  it("parses valid rgb() strings", () => {
    expect(parseRgb("rgb(255, 0, 0)")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseRgb("  RGB( 10 , 20 , 30 )  ")).toEqual({ r: 10, g: 20, b: 30 });
  });

  it("rejects malformed and out-of-range rgb()", () => {
    expect(parseRgb("rgb(256, 0, 0)")).toBeNull();
    expect(parseRgb("rgb(-1, 0, 0)")).toBeNull();
    expect(parseRgb("rgb(1, 2)")).toBeNull();
    expect(parseRgb("not a color")).toBeNull();
  });

  it("formats rounded channels", () => {
    expect(formatRgb({ r: 255.4, g: 0.4, b: 128 })).toBe("rgb(255, 0, 128)");
  });
});

describe("parseHsl / formatHsl", () => {
  it("parses valid hsl() strings including negative hues", () => {
    expect(parseHsl("hsl(0, 100%, 50%)")).toEqual({ h: 0, s: 100, l: 50 });
    expect(parseHsl("hsl(-90, 12%, 33%)")).toEqual({ h: -90, s: 12, l: 33 });
  });

  it("rejects out-of-range saturation and lightness", () => {
    expect(parseHsl("hsl(0, 101%, 50%)")).toBeNull();
    expect(parseHsl("hsl(0, 100%, -1%)")).toBeNull();
    expect(parseHsl("hsl(0, 100%)")).toBeNull();
  });

  it("formats rounded hsl components", () => {
    expect(formatHsl({ h: 210.4, s: 33.4, l: 50 })).toBe("hsl(210.4, 33%, 50%)");
  });
});

describe("parseOklch / formatOklch", () => {
  it("parses oklch with L in 0..1 and 0..100", () => {
    expect(parseOklch("oklch(0.7 0.2 30)")).toEqual({ L: 0.7, c: 0.2, h: 30 });
    expect(parseOklch("oklch(70 0.2 -30)")).toEqual({ L: 0.7, c: 0.2, h: -30 });
  });

  it("rejects malformed oklch", () => {
    expect(parseOklch("oklch(0.7 0.2)")).toBeNull();
    expect(parseOklch("nope")).toBeNull();
  });

  it("formats with fixed precision", () => {
    expect(formatOklch(0.7, 0.2, 30)).toBe("oklch(0.7 0.2 30)");
  });
});

describe("parseCssColorToRgb", () => {
  it("dispatches across hex, rgb, hsl and oklch", () => {
    expect(parseCssColorToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
    expect(parseCssColorToRgb("rgb(0, 255, 0)")).toEqual({ r: 0, g: 255, b: 0 });
    const fromHsl = parseCssColorToRgb("hsl(240, 100%, 50%)");
    expect(fromHsl).toEqual({ r: 0, g: 0, b: 255 });
    const fromOklch = parseCssColorToRgb("oklch(1 0 0)");
    expect(fromOklch).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("returns null for unrecognized or empty input", () => {
    expect(parseCssColorToRgb("")).toBeNull();
    expect(parseCssColorToRgb("banana")).toBeNull();
    expect(parseCssColorToRgb("oklab(0.5 0.1 0.1)")).toBeNull();
  });
});

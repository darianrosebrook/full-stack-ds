import { describe, expect, it } from "vitest";
import {
  convertColor,
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  labToLch,
  labToXyz,
  lchToLab,
  oklabToOklch,
  oklabToRgb,
  oklchToOklab,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToOklab,
  rgbToXyz,
  xyzToLab,
  xyzToRgb,
} from "./colorFromTo.js";
import type { RGB } from "./colorHelpers.js";

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };
const RED: RGB = { r: 255, g: 0, b: 0 };
const GREEN: RGB = { r: 0, g: 255, b: 0 };
const BLUE: RGB = { r: 0, g: 0, b: 255 };

function expectRgbClose(actual: RGB, expected: RGB, digits = 0): void {
  expect(actual.r).toBeCloseTo(expected.r, digits);
  expect(actual.g).toBeCloseTo(expected.g, digits);
  expect(actual.b).toBeCloseTo(expected.b, digits);
}

describe("hexToRgb", () => {
  it("parses 6-digit hex with and without the # prefix", () => {
    expect(hexToRgb("#ff0000")).toEqual(RED);
    expect(hexToRgb("ff0000")).toEqual(RED);
    expect(hexToRgb("#00FF00")).toEqual(GREEN);
  });

  it("parses 3-digit shorthand", () => {
    expect(hexToRgb("#fff")).toEqual(WHITE);
    expect(hexToRgb("#abc")).toEqual({ r: 170, g: 187, b: 204 });
    expect(hexToRgb("#f00")).toEqual(RED);
  });

  it("returns null for malformed or unsupported lengths", () => {
    expect(hexToRgb("")).toBeNull();
    expect(hexToRgb("#zzz")).toBeNull();
    expect(hexToRgb("#12345")).toBeNull();
    expect(hexToRgb("#ffff")).toBeNull();
    expect(hexToRgb("#gggggg")).toBeNull();
  });
});

describe("rgbToHex", () => {
  it("renders canonical 6-digit hex", () => {
    expect(rgbToHex(WHITE)).toBe("#ffffff");
    expect(rgbToHex(BLACK)).toBe("#000000");
    expect(rgbToHex({ r: 1, g: 2, b: 3 })).toBe("#010203");
  });

  it("clamps and rounds out-of-range channels", () => {
    expect(rgbToHex({ r: -10, g: 300, b: 255.4 })).toBe("#00ffff");
    expect(rgbToHex({ r: 255.4, g: 0, b: 0 })).toBe("#ff0000");
  });
});

describe("HSL <-> RGB", () => {
  it("converts primary hues", () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual(RED);
    expect(hslToRgb({ h: 120, s: 100, l: 50 })).toEqual(GREEN);
    expect(hslToRgb({ h: 240, s: 100, l: 50 })).toEqual(BLUE);
  });

  it("renders achromatic gray when saturation is zero", () => {
    expect(hslToRgb({ h: 40, s: 0, l: 50 })).toEqual({ r: 128, g: 128, b: 128 });
  });

  it("normalizes out-of-range hues", () => {
    expect(hslToRgb({ h: 360, s: 100, l: 50 })).toEqual(RED);
    expect(hslToRgb({ h: -120, s: 100, l: 50 })).toEqual(BLUE);
  });

  it("round-trips primaries back to HSL", () => {
    expect(rgbToHsl(RED)).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl(GREEN)).toEqual({ h: 120, s: 100, l: 50 });
    expect(rgbToHsl(BLUE)).toEqual({ h: 240, s: 100, l: 50 });
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 });
  });
});

describe("HSV <-> RGB", () => {
  it("converts primary hues", () => {
    expect(hsvToRgb(0, 100, 100)).toEqual(RED);
    expect(hsvToRgb(120, 100, 100)).toEqual(GREEN);
    expect(hsvToRgb(240, 100, 100)).toEqual(BLUE);
  });

  it("renders gray at zero saturation", () => {
    expect(hsvToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 });
  });

  it("clamps saturation and value to 0..1", () => {
    expect(hsvToRgb(0, 200, 100)).toEqual(RED);
    expect(hsvToRgb(0, 100, 200)).toEqual(RED);
  });

  it("measures hsv back from rgb", () => {
    expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 });
    expect(rgbToHsv(0, 0, 0)).toEqual({ h: 0, s: 0, v: 0 });
    const gray = rgbToHsv(128, 128, 128);
    expect(gray.h).toBe(0);
    expect(gray.s).toBe(0);
    expect(gray.v).toBeCloseTo((128 / 255) * 100, 2);
  });
});

describe("OKLab <-> RGB", () => {
  it("maps white and black to the OKLab extremes", () => {
    const whiteOklab = rgbToOklab(255, 255, 255);
    expect(whiteOklab.L).toBeCloseTo(1, 2);
    expect(whiteOklab.a).toBeCloseTo(0, 2);
    expect(whiteOklab.b).toBeCloseTo(0, 2);

    const blackOklab = rgbToOklab(0, 0, 0);
    expect(blackOklab.L).toBeCloseTo(0, 2);
  });

  it("matches the published red reference values", () => {
    const red = rgbToOklab(255, 0, 0);
    expect(red.L).toBeCloseTo(0.628, 2);
    expect(red.a).toBeCloseTo(0.225, 2);
    expect(red.b).toBeCloseTo(0.126, 2);
  });

  it("round-trips white through OKLab", () => {
    const { L, a, b } = rgbToOklab(255, 255, 255);
    expectRgbClose(oklabToRgb(L, a, b), WHITE, 0);
  });
});

describe("OKLCh cylindrical transforms", () => {
  it("converts axis-aligned OKLab vectors", () => {
    expect(oklabToOklch(0.7, 0.2, 0)).toEqual({ L: 0.7, c: 0.2, h: 0 });
    const ninety = oklabToOklch(0.7, 0, 0.2);
    expect(ninety.L).toBeCloseTo(0.7, 10);
    expect(ninety.c).toBeCloseTo(0.2, 10);
    expect(ninety.h).toBeCloseTo(90, 10);
    const negativeA = oklabToOklch(0.7, -0.1, 0);
    expect(negativeA.h).toBeCloseTo(180, 10);
  });

  it("recovers the vector from polar form", () => {
    const out = oklchToOklab(0.7, 0.2, 90);
    expect(out.L).toBeCloseTo(0.7, 10);
    expect(out.a).toBeCloseTo(0, 10);
    expect(out.b).toBeCloseTo(0.2, 10);
  });
});

describe("XYZ hub", () => {
  it("converts white to the D65 white point", () => {
    const xyz = rgbToXyz(WHITE);
    expect(xyz.x).toBeCloseTo(0.9505, 3);
    expect(xyz.y).toBeCloseTo(1, 3);
    expect(xyz.z).toBeCloseTo(1.0888, 3);
  });

  it("recovers rgb from the white point", () => {
    expectRgbClose(
      xyzToRgb({ x: 0.95047, y: 1, z: 1.08883 }),
      WHITE,
      0,
    );
  });

  it("maps white and black through Lab", () => {
    const whiteLab = xyzToLab({ x: 0.95047, y: 1, z: 1.08883 });
    expect(whiteLab.l).toBeCloseTo(100, 2);
    expect(whiteLab.a).toBeCloseTo(0, 2);
    expect(whiteLab.b).toBeCloseTo(0, 2);

    const blackLab = xyzToLab({ x: 0, y: 0, z: 0 });
    expect(blackLab.l).toBe(0);
  });

  it("recovers the white point from Lab", () => {
    const xyz = labToXyz({ l: 100, a: 0, b: 0 });
    expect(xyz.x).toBeCloseTo(0.9505, 3);
    expect(xyz.y).toBeCloseTo(1, 3);
    expect(xyz.z).toBeCloseTo(1.0888, 3);
  });

  it("recovers black through the dark branch of labToXyz", () => {
    const xyz = labToXyz({ l: 0, a: 0, b: 0 });
    expect(xyz.y).toBeCloseTo(0, 3);
  });
});

describe("Lab <-> LCh", () => {
  it("preserves lightness and recovers chroma and hue", () => {
    expect(labToLch({ l: 50, a: 0, b: 0 })).toEqual({ l: 50, c: 0, h: 0 });
    expect(labToLch({ l: 50, a: 10, b: 0 })).toEqual({ l: 50, c: 10, h: 0 });
    const ninety = labToLch({ l: 50, a: 0, b: 10 });
    expect(ninety.c).toBeCloseTo(10, 10);
    expect(ninety.h).toBeCloseTo(90, 10);
  });

  it("recovers cartesian form from polar form", () => {
    const lab = lchToLab({ l: 50, c: 10, h: 90 });
    expect(lab.l).toBe(50);
    expect(lab.a).toBeCloseTo(0, 10);
    expect(lab.b).toBeCloseTo(10, 10);
  });
});

describe("convertColor routing", () => {
  it("returns the input unchanged for same-space conversions", () => {
    const red = { r: 255, g: 0, b: 0 };
    expect(convertColor(red, "rgb", "rgb")).toBe(red);
  });

  it("routes rgb-hub conversions", () => {
    expect(convertColor("#ff0000", "hex", "rgb")).toEqual(RED);
    expect(convertColor(RED, "rgb", "hex")).toBe("#ff0000");
    expect(convertColor(RED, "rgb", "hsl")).toEqual({ h: 0, s: 100, l: 50 });
    expect(convertColor(RED, "rgb", "hsv")).toEqual({ h: 0, s: 100, v: 100 });
  });

  it("routes oklab and oklch through the rgb hub", () => {
    const oklab = convertColor(RED, "rgb", "oklab") as { L: number };
    expect(oklab.L).toBeCloseTo(0.628, 2);
    const roundTrip = convertColor(oklab, "oklab", "rgb") as RGB;
    expectRgbClose(roundTrip, RED, 0);

    const oklch = convertColor(RED, "rgb", "oklch") as { c: number };
    expect(oklch.c).toBeCloseTo(0.257, 2);
  });

  it("routes xyz-hub conversions through rgb", () => {
    const lab = convertColor(WHITE, "rgb", "lab") as { l: number };
    expect(lab.l).toBeCloseTo(100, 0);
    const lch = convertColor(WHITE, "rgb", "lch") as { l: number };
    expect(lch.l).toBeCloseTo(100, 0);
    const back = convertColor(lab, "lab", "hex") as string;
    expect(back).toBe("#ffffff");
  });

  it("throws on invalid hex input", () => {
    expect(() => convertColor("#zzz", "hex", "rgb")).toThrow(/Invalid hex/);
  });

  it("throws on unsupported source and target spaces", () => {
    expect(() =>
      convertColor({ r: 0, g: 0, b: 0 }, "bogus" as never, "rgb"),
    ).toThrow(/Unsupported color space: bogus/);
    expect(() =>
      convertColor({ r: 0, g: 0, b: 0 }, "rgb", "bogus" as never),
    ).toThrow(/Unsupported color space: bogus/);
  });
});

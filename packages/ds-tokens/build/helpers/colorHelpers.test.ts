import { describe, expect, it } from "vitest";
import {
  D65_WHITE_POINT,
  calculateContrast,
  contrastRatio,
  contrastRatioHex,
  deltaE2000,
  deltaE76,
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  labToLch,
  labToRgb,
  labToXyz,
  lchToRgb,
  linearRgbToSRgbChannel,
  oklabToOklch,
  oklabToRgb,
  oklchToOklab,
  oklchToRgb,
  oklchToRgbClipped,
  relativeLuminance,
  rgbToCam02JCh,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
  rgbToLab,
  rgbToLch,
  rgbToOklab,
  rgbToOklch,
  rgbToXyz,
  sRgbToLinearRgbChannel,
  xyzToLab,
  xyzToRgb,
  type LAB,
  type RGB,
} from "./colorHelpers.js";

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };
const RED: RGB = { r: 255, g: 0, b: 0 };

function expectRgbClose(actual: RGB, expected: RGB, digits = 0): void {
  expect(actual.r).toBeCloseTo(expected.r, digits);
  expect(actual.g).toBeCloseTo(expected.g, digits);
  expect(actual.b).toBeCloseTo(expected.b, digits);
}

describe("calculateContrast", () => {
  it("returns the luma-weighted luminance of a hex color", () => {
    expect(calculateContrast("#000000")).toBe(0);
    expect(calculateContrast("#ffffff")).toBe(255);
    expect(calculateContrast("ffffff")).toBe(255);
    expect(calculateContrast("#fff")).toBe(255);
  });

  it("throws on invalid hex", () => {
    expect(() => calculateContrast("#ggg")).toThrow(/Invalid hex/);
    expect(() => calculateContrast("#12345")).toThrow(/Invalid hex/);
  });
});

describe("sRGB <-> linear channel math", () => {
  it("maps the endpoints exactly", () => {
    expect(sRgbToLinearRgbChannel(0)).toBe(0);
    expect(sRgbToLinearRgbChannel(255)).toBeCloseTo(1, 10);
    expect(linearRgbToSRgbChannel(0)).toBe(0);
    expect(linearRgbToSRgbChannel(1)).toBe(255);
  });

  it("uses the linear branch below the 0.04045 knee", () => {
    expect(sRgbToLinearRgbChannel(10)).toBeCloseTo(10 / 255 / 12.92, 6);
  });

  it("uses the gamma branch above the knee", () => {
    expect(sRgbToLinearRgbChannel(128)).toBeCloseTo(0.2159, 4);
  });

  it("round-trips a mid gray", () => {
    expect(linearRgbToSRgbChannel(sRgbToLinearRgbChannel(128))).toBe(128);
  });

  it("clamps out-of-range linear values", () => {
    expect(linearRgbToSRgbChannel(-0.5)).toBe(0);
    expect(linearRgbToSRgbChannel(2)).toBe(255);
  });
});

describe("hex/rgb round trips", () => {
  it("parses shorthand and long hex", () => {
    expect(hexToRgb("#f00")).toEqual(RED);
    expect(hexToRgb("#ff0000")).toEqual(RED);
    expect(hexToRgb("00ff00")).toEqual({ r: 0, g: 255, b: 0 });
  });

  it("rejects malformed hex", () => {
    expect(hexToRgb("#zzz")).toBeNull();
    expect(hexToRgb("#12345")).toBeNull();
  });

  it("renders hex back with clamping", () => {
    expect(rgbToHex(RED)).toBe("#ff0000");
    expect(rgbToHex({ r: -5, g: 999, b: 0 })).toBe("#00ff00");
  });
});

describe("XYZ <-> Lab <-> RGB", () => {
  it("matches the D65 white point", () => {
    const xyz = rgbToXyz(WHITE);
    expect(xyz.x).toBeCloseTo(D65_WHITE_POINT.x, 3);
    expect(xyz.y).toBeCloseTo(1, 3);
    expect(xyz.z).toBeCloseTo(D65_WHITE_POINT.z, 3);
    expectRgbClose(xyzToRgb(xyz), WHITE, 0);
  });

  it("maps white to Lab L=100 and black to L=0", () => {
    const whiteLab = xyzToLab({ x: 0.95047, y: 1, z: 1.08883 });
    expect(whiteLab.l).toBeCloseTo(100, 2);
    expect(whiteLab.a).toBeCloseTo(0, 2);
    expect(whiteLab.b).toBeCloseTo(0, 2);
    expect(xyzToLab({ x: 0, y: 0, z: 0 }).l).toBe(0);
  });

  it("round-trips white through Lab", () => {
    expectRgbClose(labToRgb({ l: 100, a: 0, b: 0 }), WHITE, 0);
    const xyz = labToXyz({ l: 100, a: 0, b: 0 });
    expect(xyz.y).toBeCloseTo(1, 3);
  });

  it("measures a red Lab via the rgb shortcut", () => {
    const redLab = rgbToLab(RED);
    expect(redLab.l).toBeCloseTo(53.24, 1);
    expect(redLab.a).toBeCloseTo(80.09, 1);
    expect(redLab.b).toBeCloseTo(67.2, 1);
  });
});

describe("HSL/HSV conversions", () => {
  it("round-trips primaries through HSL", () => {
    expect(hslToRgb({ h: 0, s: 100, l: 50 })).toEqual(RED);
    expect(rgbToHsl(RED)).toEqual({ h: 0, s: 100, l: 50 });
    expect(rgbToHsl({ r: 128, g: 128, b: 128 })).toEqual({ h: 0, s: 0, l: 50 });
  });

  it("round-trips primaries through HSV", () => {
    expect(hsvToRgb(0, 100, 100)).toEqual(RED);
    expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 });
  });
});

describe("OKLab/OKLCh conversions", () => {
  it("maps white and black to the OKLab extremes", () => {
    expect(rgbToOklab(255, 255, 255).L).toBeCloseTo(1, 2);
    expect(rgbToOklab(0, 0, 0).L).toBeCloseTo(0, 2);
    expectRgbClose(oklabToRgb(1, 0, 0), WHITE, 0);
  });

  it("round-trips primaries through OKLCh", () => {
    const { L, c, h } = rgbToOklch(RED);
    expect(L).toBeCloseTo(0.628, 2);
    expect(c).toBeCloseTo(0.257, 2);
    expectRgbClose(oklchToRgb(L, c, h), RED, 0);
  });

  it("recovers cartesian form from polar form", () => {
    const lab = oklchToOklab(0.7, 0.2, 90);
    expect(lab.a).toBeCloseTo(0, 10);
    expect(lab.b).toBeCloseTo(0.2, 10);
    const back = oklabToOklch(lab.L, lab.a, lab.b);
    expect(back.h).toBeCloseTo(90, 10);
  });
});

describe("Lab/LCh convenience conversions", () => {
  it("round-trips a chroma-bearing color through LCh", () => {
    const lch = rgbToLch(RED);
    expect(lch.l).toBeCloseTo(53.24, 1);
    expectRgbClose(lchToRgb(lch), RED, 0);
  });

  it("preserves axis-aligned vectors", () => {
    expect(labToLch({ l: 50, a: 10, b: 0 })).toEqual({ l: 50, c: 10, h: 0 });
  });
});

describe("WCAG luminance and contrast", () => {
  it("computes relative luminance at the extremes", () => {
    expect(relativeLuminance(WHITE)).toBeCloseTo(1, 10);
    expect(relativeLuminance(BLACK)).toBeCloseTo(0, 10);
  });

  it("computes contrast ratios", () => {
    expect(contrastRatio(BLACK, WHITE)).toBeCloseTo(21, 5);
    expect(contrastRatio(WHITE, WHITE)).toBeCloseTo(1, 10);
    expect(contrastRatio(WHITE, { r: 102, g: 102, b: 102 })).toBeCloseTo(
      5.74,
      2,
    );
  });

  it("computes hex contrast with null on invalid input", () => {
    expect(contrastRatioHex("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatioHex("#zzz", "#ffffff")).toBeNull();
    expect(contrastRatioHex("#ffffff", "#12345")).toBeNull();
  });
});

describe("color difference", () => {
  it("measures zero distance between identical colors", () => {
    const lab: LAB = { l: 50, a: 10, b: -20 };
    expect(deltaE76(lab, lab)).toBe(0);
    expect(deltaE2000(lab, lab)).toBeCloseTo(0, 10);
  });

  it("matches the published Sharma CIEDE2000 reference pair", () => {
    const a: LAB = { l: 50, a: 2.6772, b: -79.7751 };
    const b: LAB = { l: 50, a: 0, b: -82.7485 };
    expect(deltaE2000(a, b)).toBeCloseTo(2.0425, 3);
  });

  it("measures the full lightness span with deltaE76", () => {
    expect(deltaE76({ l: 100, a: 0, b: 0 }, { l: 0, a: 0, b: 0 })).toBeCloseTo(
      100,
      10,
    );
  });
});

describe("gamut clipping and CAM02", () => {
  it("returns white unchanged for the achromatic OKLCh point", () => {
    expectRgbClose(oklchToRgbClipped(1, 0, 0), WHITE, 0);
  });

  it("clips a saturated out-of-gamut OKLCh color into sRGB range", () => {
    const clipped = oklchToRgbClipped(0.7, 0.4, 30);
    for (const channel of [clipped.r, clipped.g, clipped.b]) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
    }
  });

  it("wraps Lab/LCh in the CIECAM02 parameter shape", () => {
    const white = rgbToCam02JCh(WHITE);
    expect(white.L).toBeCloseTo(100, 2);
    expect(white.C).toBeCloseTo(0, 2);
    const red = rgbToCam02JCh(RED);
    expect(red.L).toBeCloseTo(53.24, 1);
  });
});

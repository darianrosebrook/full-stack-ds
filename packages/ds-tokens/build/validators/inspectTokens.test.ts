import { describe, expect, it } from "vitest";
import {
  generateReport,
  loadTokenTree,
  resolveToken,
} from "./inspectTokens.mjs";

/**
 * inspectTokens.mjs is a legacy inspector whose fs entry reads the old
 * portfolio layout (ui/designTokens/*). The tree argument is the real
 * testable surface — these tests drive synthetic trees through it, and
 * pin the current behavior of the fs-backed loader.
 */
function syntheticTree() {
  return {
    core: {
      color: {
        palette: {
          red: {
            "500": { $value: "#ff0000" },
            "600": {
              $value: "#cc0000",
              $extensions: {
                design: { paths: { light: "#dd3333", dark: "#991111" } },
              },
            },
          },
        },
      },
    },
    semantic: {
      color: {
        foreground: {
          primary: { $value: "{color.palette.red.500}" },
          cycleA: { $value: "{semantic.color.foreground.cycleB}" },
          cycleB: { $value: "{semantic.color.foreground.cycleA}" },
        },
      },
    },
  };
}

describe("loadTokenTree", () => {
  it("pins the legacy fallback shape under the current repo layout", () => {
    // The legacy ui/designTokens paths this loader reads do not exist in
    // the current repo, so the loader returns empty namespaces. Pinning
    // that behavior documents the rot instead of pretending it resolves.
    const tree = loadTokenTree();
    expect(tree).toMatchObject({ core: {}, semantic: {} });
  });
});

describe("resolveToken", () => {
  const tree = syntheticTree();

  it("resolves a literal leaf path", () => {
    const result = resolveToken(tree, "core.color.palette.red.500");
    expect(result.path).toBe("core.color.palette.red.500");
    expect(result.chain).toEqual(["core.color.palette.red.500"]);
    expect(result.value).toBe("#ff0000");
    expect(result.errors).toEqual([]);
  });

  it("resolves an unqualified alias through the core prefix", () => {
    const result = resolveToken(tree, "semantic.color.foreground.primary");
    expect(result.errors).toEqual([]);
    expect(result.chain).toEqual([
      "semantic.color.foreground.primary",
      "core.color.palette.red.500",
    ]);
    expect(result.value).toBe("#ff0000");
  });

  it("picks light and dark values from design.paths extensions", () => {
    const result = resolveToken(tree, "core.color.palette.red.600");
    expect(result.valueByMode.light).toBe("#dd3333");
    expect(result.valueByMode.dark).toBe("#991111");
    // Default preference is light.
    expect(result.value).toBe("#dd3333");
    // Explicit dark preference selects the dark variant.
    expect(resolveToken(tree, "core.color.palette.red.600", { mode: "dark" }).value).toBe(
      "#991111",
    );
  });

  it("reports a missing token", () => {
    const result = resolveToken(tree, "core.color.palette.nothere.500");
    // One error per mode pass (light + dark).
    expect(result.errors).toEqual([
      "Missing token: core.color.palette.nothere.500",
      "Missing token: core.color.palette.nothere.500",
    ]);
    expect(result.value).toBeUndefined();
  });

  it("detects reference cycles", () => {
    const result = resolveToken(tree, "semantic.color.foreground.cycleA");
    expect(result.errors.some((e: string) => e.startsWith("Cycle detected"))).toBe(
      true,
    );
  });
});

describe("generateReport", () => {
  it("maps every token path to a resolution record", () => {
    const report = generateReport(syntheticTree());
    const paths = Object.keys(report).sort();

    expect(paths).toEqual([
      "core.color.palette.red.500",
      "core.color.palette.red.600",
      "semantic.color.foreground.cycleA",
      "semantic.color.foreground.cycleB",
      "semantic.color.foreground.primary",
    ]);
    for (const path of paths) {
      expect(report[path].path).toBe(path);
      expect(Array.isArray(report[path].chain)).toBe(true);
      expect(report[path]).toHaveProperty("valueByMode");
      expect(Array.isArray(report[path].errors)).toBe(true);
    }
  });
});

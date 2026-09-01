import { describe, expect, it } from "vitest";
import {
  collectRefsFromBrandFile,
  collectValidPaths,
  formatReport,
  isPlainObject,
  levenshtein,
  nearestMatches,
  resolvesAgainstGraph,
  type Report,
  type UnresolvedRef,
} from "./check-brand-refs.js";

describe("isPlainObject", () => {
  it("accepts records and rejects primitives, null and arrays", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject("x")).toBe(false);
    expect(isPlainObject(42)).toBe(false);
  });
});

describe("collectValidPaths", () => {
  it("collects $value leaves and skips $-metadata and hoisted groups", () => {
    const graph = {
      $schema: "ignored",
      core: {
        color: {
          $type: "color", // hoisted group type — not a leaf
          palette: {
            red: {
              "500": { $value: "#ff0000" },
              "600": { $value: "#cc0000" },
            },
          },
        },
      },
      semantic: {
        color: { foreground: { primary: { $value: "#000000" } } },
      },
    };

    expect(collectValidPaths(graph)).toEqual(
      new Set([
        "core.color.palette.red.500",
        "core.color.palette.red.600",
        "semantic.color.foreground.primary",
      ]),
    );
  });

  it("does not descend into composite $value leaves", () => {
    const graph = {
      typography: {
        body: { $value: { fontFamily: "Inter", fontSize: "16px" } },
      },
    };
    expect(collectValidPaths(graph)).toEqual(new Set(["typography.body"]));
  });

  it("returns the same set for non-object input", () => {
    const out = new Set<string>(["kept"]);
    expect(collectValidPaths(42, [], out)).toBe(out);
  });
});

describe("resolvesAgainstGraph", () => {
  const valid = new Set([
    "core.color.palette.red.500",
    "semantic.color.foreground.primary",
  ]);

  it("accepts literal, core-prefixed and semantic-prefixed forms", () => {
    expect(resolvesAgainstGraph("core.color.palette.red.500", valid)).toBe(true);
    expect(resolvesAgainstGraph("color.palette.red.500", valid)).toBe(true);
    expect(
      resolvesAgainstGraph("color.foreground.primary", valid),
    ).toBe(true);
  });

  it("rejects unknown paths", () => {
    expect(resolvesAgainstGraph("color.palette.cobalt.500", valid)).toBe(false);
  });
});

describe("collectRefsFromBrandFile", () => {
  const valid = new Set([
    "core.color.palette.red.500",
    "core.color.palette.blue.500",
    "semantic.color.foreground.primary",
  ]);

  function run(node: unknown): { unresolved: UnresolvedRef[]; count: number } {
    const out: UnresolvedRef[] = [];
    const counter = { value: 0 };
    collectRefsFromBrandFile(node, "brands/acme.tokens.json", "acme", valid, [], out, counter);
    return { unresolved: out, count: counter.value };
  }

  it("resolves a bare $value ref against the core prefix", () => {
    const { unresolved, count } = run({
      color: { accent: { $value: "{color.palette.red.500}" } },
    });
    expect(count).toBe(1);
    expect(unresolved).toEqual([]);
  });

  it("flags an unresolvable $value ref with suggestions", () => {
    const { unresolved } = run({
      color: { accent: { $value: "{color.palette.cobalt.500}" } },
    });

    expect(unresolved).toHaveLength(1);
    expect(unresolved[0]).toMatchObject({
      brand: "acme",
      source: "$value",
      ref: "color.palette.cobalt.500",
      tokenPath: ["color", "accent"],
    });
    expect(unresolved[0]!.suggestions.length).toBeGreaterThan(0);
  });

  it("checks fsds.* and design.paths.* extension refs", () => {
    const { unresolved, count } = run({
      color: {
        accent: {
          $value: "{color.palette.red.500}",
          $extensions: {
            "fsds.dark": "{color.palette.blue.500}",
            "fsds.missing": "{color.palette.none.500}",
          },
        },
      },
    });

    expect(count).toBe(3); // $value + fsds.dark + fsds.missing all count
    expect(unresolved).toHaveLength(1);
    expect(unresolved[0]!.source).toBe("fsds.missing");
  });

  it("ignores extension keys outside the resolvable namespaces", () => {
    const { count, unresolved } = run({
      color: {
        accent: {
          $value: "{color.palette.red.500}",
          $extensions: { "custom.note": "{color.palette.none.500}" },
        },
      },
    });
    expect(count).toBe(1);
    expect(unresolved).toEqual([]);
  });

  it("finds inline refs inside composite $value objects", () => {
    const { count, unresolved } = run({
      typography: {
        body: {
          $type: "typography",
          $value: {
            fontFamily: "Inter",
            color: "{color.palette.cobalt.500}",
          },
        },
      },
    });

    expect(count).toBe(1);
    expect(unresolved).toHaveLength(1);
    expect(unresolved[0]!.tokenPath).toEqual(["typography", "body", "$value", "color"]);
  });

  it("skips $-prefixed metadata keys in group nodes", () => {
    const { count } = run({
      $brand: "acme",
      color: { accent: { $value: "{color.palette.red.500}" } },
    });
    expect(count).toBe(1);
  });
});

describe("nearestMatches", () => {
  const valid = new Set([
    "core.color.palette.red.500",
    "core.color.palette.red.600",
    "core.color.palette.blue.500",
    "semantic.spacing.size.sm",
  ]);

  it("prefers trailing-segment matches", () => {
    const matches = nearestMatches("color.palette.red.500", valid);
    expect(matches[0]).toBe("core.color.palette.red.500");
  });

  it("falls back to edit-distance matches on the final segment", () => {
    const matches = nearestMatches("color.palette.red.501", valid);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]).toMatch(/red\.50[01]$/);
  });

  it("returns at most three suggestions", () => {
    const matches = nearestMatches("color.palette", valid);
    expect(matches.length).toBeLessThanOrEqual(3);
  });
});

describe("levenshtein", () => {
  it("measures the classic edit distances", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("", "abc")).toBe(3);
    expect(levenshtein("abc", "")).toBe(3);
    expect(levenshtein("same", "same")).toBe(0);
    expect(levenshtein("red", "rde")).toBe(2);
  });
});

describe("formatReport", () => {
  it("renders the all-clear summary", () => {
    const reports: Report[] = [
      { brand: "acme", file: "brands/acme.tokens.json", refsChecked: 4, unresolved: [] },
    ];
    const text = formatReport(reports, { refs: 4, unresolved: 0 });

    expect(text).toContain("[OK] acme");
    expect(text).toContain("Total: 4 refs across 1 brand(s), 0 unresolved");
    expect(text).toContain(
      "All brand references resolve against the composed token graph.",
    );
  });

  it("groups unresolved refs by ref with call sites and suggestions", () => {
    const unresolved: UnresolvedRef[] = [
      {
        brand: "acme",
        file: "brands/acme.tokens.json",
        tokenPath: ["color", "accent"],
        source: "$value",
        ref: "color.palette.cobalt.500",
        suggestions: ["core.color.palette.blue.500"],
      },
      {
        brand: "acme",
        file: "brands/acme.tokens.json",
        tokenPath: ["color", "onAccent"],
        source: "fsds.dark",
        ref: "color.palette.cobalt.500",
        suggestions: ["core.color.palette.blue.500"],
      },
    ];
    const reports: Report[] = [
      { brand: "acme", file: "brands/acme.tokens.json", refsChecked: 2, unresolved },
    ];
    const text = formatReport(reports, { refs: 2, unresolved: 2 });

    expect(text).toContain("[MISS] acme");
    expect(text).toContain("{color.palette.cobalt.500}  (2 occurrences)");
    expect(text).toContain("at color.accent  via $value");
    expect(text).toContain("at color.onAccent  via fsds.dark");
    expect(text).toContain("suggest: {core.color.palette.blue.500}");
  });

  it("renders the no-close-match hint when suggestions are empty", () => {
    const reports: Report[] = [
      {
        brand: "acme",
        file: "brands/acme.tokens.json",
        refsChecked: 1,
        unresolved: [
          {
            brand: "acme",
            file: "brands/acme.tokens.json",
            tokenPath: ["x"],
            source: "$value",
            ref: "totally.unknown.path",
            suggestions: [],
          },
        ],
      },
    ];
    const text = formatReport(reports, { refs: 1, unresolved: 1 });
    expect(text).toContain("suggest: (no close match in composed graph)");
  });
});

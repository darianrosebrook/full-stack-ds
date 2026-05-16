import { describe, it, expect } from "vitest";
import {
  PreserveError,
  hasMarkers,
  injectMigrationTodo,
  mergeFile,
  mergeSections,
  renderSections,
  splitSections,
  type Section,
} from "./preserve.js";

describe("hasMarkers", () => {
  it("returns false for plain text", () => {
    expect(hasMarkers("export const x = 1;\nexport const y = 2;")).toBe(false);
  });

  it("returns true on a line marker", () => {
    expect(hasMarkers("// @generated:start imports\nfoo\n// @generated:end")).toBe(true);
  });

  it("returns true on a block marker", () => {
    expect(hasMarkers("/* @custom:start root */\n.foo {}\n/* @custom:end */")).toBe(true);
  });

  it("ignores look-alikes that aren't on their own line", () => {
    expect(hasMarkers('const s = "// @generated:start fake";')).toBe(false);
  });
});

describe("splitSections", () => {
  it("returns a single between for plain text", () => {
    const sections = splitSections("hello\nworld");
    expect(sections).toEqual([{ kind: "between", body: "hello\nworld" }]);
  });

  it("parses one generated region with surrounding text", () => {
    const text = [
      "// header",
      "// @generated:start imports",
      'import x from "y";',
      "// @generated:end",
      "// trailing",
    ].join("\n");
    const sections = splitSections(text);
    expect(sections).toEqual([
      { kind: "between", body: "// header" },
      { kind: "generated", id: "imports", body: 'import x from "y";' },
      { kind: "between", body: "// trailing" },
    ]);
  });

  it("parses both line and block comment markers", () => {
    const text = [
      "/* @generated:start root */",
      ".foo { color: red; }",
      "/* @generated:end */",
      "",
      "/* @custom:start overrides */",
      ".foo { color: blue; }",
      "/* @custom:end */",
    ].join("\n");
    const sections = splitSections(text);
    expect(sections.filter((s) => s.kind !== "between")).toEqual([
      { kind: "generated", id: "root", body: ".foo { color: red; }" },
      { kind: "custom", id: "overrides", body: ".foo { color: blue; }" },
    ]);
  });

  it("accepts an :end marker without an id", () => {
    const text = "// @generated:start imports\nbody\n// @generated:end";
    const sections = splitSections(text);
    expect(sections).toEqual([
      { kind: "generated", id: "imports", body: "body" },
    ]);
  });

  it("accepts an :end marker with a matching id", () => {
    const text = "// @custom:start trailing\nbody\n// @custom:end trailing";
    const sections = splitSections(text);
    expect(sections).toEqual([
      { kind: "custom", id: "trailing", body: "body" },
    ]);
  });

  it("rejects an :end with a non-matching id", () => {
    const text = "// @generated:start imports\nbody\n// @generated:end types";
    expect(() => splitSections(text)).toThrow(PreserveError);
  });

  it("rejects mismatched kinds", () => {
    const text = "// @generated:start imports\nbody\n// @custom:end";
    expect(() => splitSections(text)).toThrow(PreserveError);
  });

  it("rejects nested starts", () => {
    const text = [
      "// @generated:start outer",
      "// @custom:start inner",
      "body",
      "// @custom:end",
      "// @generated:end",
    ].join("\n");
    expect(() => splitSections(text)).toThrow(PreserveError);
  });

  it("rejects unclosed regions", () => {
    expect(() => splitSections("// @generated:start imports\nbody")).toThrow(
      PreserveError,
    );
  });

  it("rejects :start without an id", () => {
    expect(() => splitSections("// @generated:start\nbody\n// @generated:end")).toThrow(
      PreserveError,
    );
  });

  it("preserves an empty body", () => {
    const text = "// @custom:start trailing\n// @custom:end";
    const sections = splitSections(text);
    expect(sections).toEqual([
      { kind: "custom", id: "trailing", body: "" },
    ]);
  });
});

describe("renderSections round-trip", () => {
  const cases: { name: string; text: string; style: "line" | "block" }[] = [
    {
      name: "tsx with multiple regions",
      style: "line",
      text: [
        "// @generated:start imports",
        'import { x } from "y";',
        "// @generated:end",
        "",
        "// @custom:start imports",
        'import extra from "extra";',
        "// @custom:end",
        "",
        "// @generated:start component",
        "export function Foo() {}",
        "// @generated:end",
      ].join("\n"),
    },
    {
      name: "css with overrides",
      style: "block",
      text: [
        "/* @generated:start root */",
        ".foo { color: red; }",
        "/* @generated:end */",
        "",
        "/* @custom:start overrides */",
        ".foo { color: blue; }",
        "/* @custom:end */",
      ].join("\n"),
    },
  ];

  for (const c of cases) {
    it(`round-trips: ${c.name}`, () => {
      const parsed = splitSections(c.text);
      const rendered = renderSections(parsed, c.style);
      expect(rendered).toBe(c.text);
    });
  }
});

describe("mergeSections", () => {
  it("replaces generated bodies with the fresh version", () => {
    const generated: Section[] = [
      { kind: "generated", id: "imports", body: "// new imports" },
    ];
    const existing: Section[] = [
      { kind: "generated", id: "imports", body: "// old imports" },
    ];
    const merged = mergeSections(generated, existing);
    expect(merged).toEqual([
      { kind: "generated", id: "imports", body: "// new imports" },
    ]);
  });

  it("preserves matching custom bodies from existing", () => {
    const generated: Section[] = [
      { kind: "custom", id: "trailing", body: "" },
    ];
    const existing: Section[] = [
      { kind: "custom", id: "trailing", body: "// hand-authored" },
    ];
    const merged = mergeSections(generated, existing);
    expect(merged).toEqual([
      { kind: "custom", id: "trailing", body: "// hand-authored" },
    ]);
  });

  it("keeps the generated default for custom regions absent in existing", () => {
    const generated: Section[] = [
      { kind: "custom", id: "trailing", body: "// default trailing" },
    ];
    const existing: Section[] = [];
    const merged = mergeSections(generated, existing);
    expect(merged).toEqual([
      { kind: "custom", id: "trailing", body: "// default trailing" },
    ]);
  });

  it("appends orphan custom regions from existing at the end", () => {
    const generated: Section[] = [
      { kind: "generated", id: "imports", body: "" },
    ];
    const existing: Section[] = [
      { kind: "custom", id: "removed-region", body: "user code" },
    ];
    const merged = mergeSections(generated, existing);
    expect(merged.some((s) => s.kind === "custom" && s.id === "removed-region")).toBe(
      true,
    );
  });

  it("does not append orphans whose body is empty/whitespace", () => {
    const generated: Section[] = [
      { kind: "generated", id: "imports", body: "" },
    ];
    const existing: Section[] = [
      { kind: "custom", id: "removed-region", body: "  \n  " },
    ];
    const merged = mergeSections(generated, existing);
    expect(merged.some((s) => s.id === "removed-region")).toBe(false);
  });

  it("uses generated `between` content (not existing's)", () => {
    const generated: Section[] = [
      { kind: "between", body: "// new comment" },
      { kind: "generated", id: "imports", body: "" },
    ];
    const existing: Section[] = [
      { kind: "between", body: "// old comment" },
      { kind: "generated", id: "imports", body: "" },
    ];
    const merged = mergeSections(generated, existing);
    expect(merged[0]).toEqual({ kind: "between", body: "// new comment" });
  });
});

describe("mergeFile", () => {
  it("returns generated unchanged when existing has no markers", () => {
    const generated = "// @generated:start imports\nimport x from 'y';\n// @generated:end";
    const existing = "// hand-written file with no markers";
    expect(mergeFile(generated, existing, "line")).toBe(generated);
  });

  it("merges custom regions across regen", () => {
    const generated = [
      "// @generated:start imports",
      'import { Stack } from "x";',
      "// @generated:end",
      "// @custom:start trailing",
      "// @custom:end",
    ].join("\n");
    const existing = [
      "// @generated:start imports",
      'import { OldStack } from "old";',
      "// @generated:end",
      "// @custom:start trailing",
      "export const Wrapper = () => null;",
      "// @custom:end",
    ].join("\n");
    const merged = mergeFile(generated, existing, "line");
    expect(merged).toContain('import { Stack } from "x";');
    expect(merged).not.toContain("OldStack");
    expect(merged).toContain("export const Wrapper = () => null;");
  });
});

describe("injectMigrationTodo", () => {
  it("inserts a TODO into the trailing custom region (default)", () => {
    const fresh: Section[] = [
      { kind: "generated", id: "imports", body: "" },
      { kind: "custom", id: "trailing", body: "" },
    ];
    const out = injectMigrationTodo(fresh, "Button.legacy.tsx");
    const trailing = out.find((s) => s.id === "trailing")!;
    expect(trailing.body).toContain("Button.legacy.tsx");
    expect(trailing.body).toContain("MIGRATION TODO");
  });

  it("respects an alternate candidate region", () => {
    const fresh: Section[] = [
      { kind: "generated", id: "tests", body: "" },
      { kind: "custom", id: "tests", body: "" },
    ];
    const out = injectMigrationTodo(fresh, "Button.legacy.test.tsx", "line", [
      "tests",
    ]);
    const tests = out.find((s) => s.kind === "custom" && s.id === "tests")!;
    expect(tests.body).toContain("Button.legacy.test.tsx");
  });

  it("emits block-comment TODO for CSS files", () => {
    const fresh: Section[] = [
      { kind: "generated", id: "styles", body: "" },
      { kind: "custom", id: "overrides", body: "" },
    ];
    const out = injectMigrationTodo(fresh, "Button.legacy.css", "block", [
      "overrides",
    ]);
    const overrides = out.find((s) => s.id === "overrides")!;
    expect(overrides.body.startsWith("/*")).toBe(true);
    expect(overrides.body.endsWith("*/")).toBe(true);
  });

  it("appends a new custom region when no candidate matches", () => {
    const fresh: Section[] = [
      { kind: "generated", id: "imports", body: "" },
    ];
    const out = injectMigrationTodo(fresh, "Foo.legacy.tsx");
    const trailing = out.find((s) => s.kind === "custom" && s.id === "trailing");
    expect(trailing?.body).toContain("MIGRATION TODO");
  });
});

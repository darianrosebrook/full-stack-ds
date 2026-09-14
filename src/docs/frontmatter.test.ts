import { describe, expect, it } from "vitest";

import { frontmatterScalar, splitFrontmatter } from "./frontmatter";

describe("splitFrontmatter", () => {
  it("parses flat scalars and strips surrounding quotes", () => {
    const { fields, body } = splitFrontmatter(
      '---\ntitle: "A Title"\nstatus: active\nupdated: 2026-09-13\n---\n\n# A Title\n'
    );
    expect(fields["title"]).toBe("A Title");
    expect(fields["status"]).toBe("active");
    expect(fields["updated"]).toBe("2026-09-13");
    expect(body).toBe("# A Title\n");
  });

  it("parses block lists (the governs: shape) and inline lists", () => {
    const { fields } = splitFrontmatter(
      "---\ngoverns:\n  - README.md\n  - \"docs/**/*.md\"\nowners: [a, b]\n---\nbody"
    );
    expect(fields["governs"]).toEqual(["README.md", "docs/**/*.md"]);
    expect(fields["owners"]).toEqual(["a", "b"]);
  });

  it("returns the full source as body when no frontmatter fence exists", () => {
    const source = "# Just a doc\n\nNo fence here.\n";
    const { fields, body } = splitFrontmatter(source);
    expect(fields).toEqual({});
    expect(body).toBe(source);
  });

  it("treats an unterminated fence as no frontmatter rather than truncating", () => {
    const source = "---\ntitle: broken\n\nnever closed\n";
    const { fields, body } = splitFrontmatter(source);
    expect(fields).toEqual({});
    expect(body).toBe(source);
  });

  it("skips non-field lines inside the fence", () => {
    const { fields } = splitFrontmatter("---\n  indented prose\nkey: value\n---\nx");
    expect(fields).toEqual({ key: "value" });
  });
});

describe("frontmatterScalar", () => {
  const fields = {
    scalar: "one",
    list: ["a", "b"],
    empty: "",
  };

  it("returns scalars, joins lists, and nulls absent/empty values", () => {
    expect(frontmatterScalar(fields, "scalar")).toBe("one");
    expect(frontmatterScalar(fields, "list")).toBe("a, b");
    expect(frontmatterScalar(fields, "empty")).toBe(null);
    expect(frontmatterScalar(fields, "missing")).toBe(null);
  });
});

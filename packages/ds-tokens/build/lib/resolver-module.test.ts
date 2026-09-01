// Unit suites for the DTCG 1.0 resolver module: document loading and
// set/modifier resolution against a minimal in-memory document.
import { describe, expect, it } from "vitest";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Resolver,
  loadResolverDocument,
  type ResolverDocument,
} from "./resolver-module";

const FOUNDATION = {
  color: {
    core: { red: { $type: "color", $value: "#ff0000" } },
    semantic: {
      action: {
        $type: "color",
        $value: "{color.core.red}",
      },
    },
  },
};

const DOCUMENT: ResolverDocument = {
  name: "test",
  version: "2025-10-01",
  sets: {
    foundation: { sources: [FOUNDATION] },
    light: {
      sources: [
        {
          color: {
            semantic: {
              action: { $type: "color", $value: "#00ff00" },
            },
          },
        },
      ],
    },
  },
  modifiers: {
    theme: {
      contexts: {
        light: { sources: [{ $ref: "#/sets/light" }] },
      },
    },
  },
  resolutionOrder: [
    { $ref: "#/sets/foundation" },
    { $ref: "#/modifiers/theme" },
  ],
};

describe("Resolver — document resolution", () => {
  it("resolves references across sets with no modifier input", () => {
    const resolver = new Resolver(DOCUMENT);
    const result = resolver.resolve({});
    expect(result.tokens.color.semantic.action.$value).toBe("#ff0000");
  });

  it("applies the theme modifier to override the action color", () => {
    const resolver = new Resolver(DOCUMENT);
    const result = resolver.resolve({ theme: "light" });
    expect(result.tokens.color.semantic.action.$value).toBe("#00ff00");
  });

  it("rejects an invalid document when strict", () => {
    expect(
      () => new Resolver({ version: "", sets: {}, modifiers: {}, resolutionOrder: [] }, { strict: true }),
    ).toThrow();
  });
});

describe("loadResolverDocument", () => {
  it("loads a valid resolver document file", () => {
    const dir = mkdtempSync(join(tmpdir(), "resolver-doc-"));
    const file = join(dir, "resolver.json");
    writeFileSync(file, JSON.stringify(DOCUMENT), "utf8");
    const loaded = loadResolverDocument(file);
    expect(loaded?.name).toBe("test");
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns null for a missing file", () => {
    expect(loadResolverDocument("/definitely/not/here.json")).toBeNull();
  });

  it("returns null for a structurally invalid document", () => {
    const dir = mkdtempSync(join(tmpdir(), "resolver-doc-"));
    const file = join(dir, "bad.json");
    writeFileSync(file, JSON.stringify({ nope: true }), "utf8");
    expect(loadResolverDocument(file)).toBeNull();
    rmSync(dir, { recursive: true, force: true });
  });
});

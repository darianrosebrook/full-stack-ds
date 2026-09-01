import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  Resolver,
  loadResolverDocument,
  type ResolverDocument,
} from "./resolver-module.js";

const tempDirs: string[] = [];
afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

function baseDocument(): ResolverDocument {
  return {
    version: "2025-10-01",
    resolutionOrder: [
      { $ref: "#/sets/foundation" },
      { $ref: "#/modifiers/theme" },
    ],
    sets: {
      foundation: {
        sources: [
          {
            color: { primary: { $value: "#000000" } },
            alias: { $value: "{color.primary}" },
          },
        ],
      },
    },
    modifiers: {
      theme: {
        default: "light",
        contexts: {
          light: {
            sources: [{ color: { mode: { $value: "light" } } }],
          },
          dark: {
            sources: [{ color: { mode: { $value: "dark" } } }],
          },
        },
      },
    },
  };
}

describe("Resolver document validation", () => {
  it("diagnoses a missing version at construction", () => {
    const doc = baseDocument();
    delete (doc as { version?: string }).version;
    const errors: unknown[] = [];
    new Resolver(doc, { onError: (d) => errors.push(d) });

    // resolve() resets diagnostics, so observe the construction-time
    // validation through the onError callback.
    expect(errors).toContainEqual(
      expect.objectContaining({ code: "MISSING", path: "/version" }),
    );
  });

  it("diagnoses a wrong version at construction", () => {
    const doc = baseDocument();
    doc.version = "2024-01-01";
    const errors: unknown[] = [];
    new Resolver(doc, { onError: (d) => errors.push(d) });

    expect(errors).toContainEqual(
      expect.objectContaining({ code: "TYPE_MISMATCH", path: "/version" }),
    );
  });

  it("throws in strict mode for a structurally invalid document", () => {
    const doc = baseDocument();
    delete (doc as { version?: string }).version;
    expect(() => new Resolver(doc, { strict: true })).toThrow(
      /Invalid resolver document/,
    );
  });
});

describe("Resolver input validation", () => {
  it("warns about an unknown modifier", () => {
    const warnings: unknown[] = [];
    const resolver = new Resolver(baseDocument(), {
      onWarn: (d) => warnings.push(d),
    });

    const result = resolver.resolve({ typo: "light" });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "MISSING",
        message: "Unknown modifier: typo",
      }),
    );
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("errors on an invalid context value and throws in strict mode", () => {
    const errors: unknown[] = [];
    const resolver = new Resolver(baseDocument(), {
      onError: (d) => errors.push(d),
    });

    const result = resolver.resolve({ theme: "sepia" });
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "TYPE_MISMATCH",
        message: expect.stringContaining('Invalid context value "sepia"'),
      }),
    );
    expect(errors.length).toBeGreaterThan(0);

    const strictResolver = new Resolver(baseDocument(), { strict: true });
    expect(() => strictResolver.resolve({ theme: "sepia" })).toThrow(
      /Input validation failed/,
    );
  });
});

describe("Resolver modifier defaults and alias machinery", () => {
  it("applies the default modifier context when no input is provided", () => {
    const result = new Resolver(baseDocument()).resolve({});
    expect(result.tokens.color.mode.$value).toBe("light");
  });

  it("applies the requested modifier context", () => {
    const result = new Resolver(baseDocument()).resolve({ theme: "dark" });
    expect(result.tokens.color.mode.$value).toBe("dark");
  });

  it("resolves aliases into the leaf's $value slot", () => {
    const result = new Resolver(baseDocument()).resolve({});
    expect(result.tokens.alias.$value).toBe("#000000");
  });

  it("preserves an unresolvable alias and warns", () => {
    const doc = baseDocument();
    (doc.sets.foundation.sources[0] as Record<string, unknown>).ghost = {
      $value: "{color.missing}",
    };
    const result = new Resolver(doc).resolve({});
    expect(result.tokens.ghost.$value).toBe("{color.missing}");
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: "MISSING" }),
    );
  });

  it("detects circular aliases and preserves the reference", () => {
    const doc = baseDocument();
    (doc.sets.foundation.sources[0] as Record<string, unknown>).loopA = {
      $value: "{loopB}",
    };
    (doc.sets.foundation.sources[0] as Record<string, unknown>).loopB = {
      $value: "{loopA}",
    };
    const result = new Resolver(doc).resolve({});
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: "CIRCULAR" }),
    );
  });
});

describe("Resolver file references", () => {
  it("loads and caches a JSON file through the default resolver", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "resolver-files-"));
    tempDirs.push(dir);
    fs.writeFileSync(
      path.join(dir, "extra.json"),
      JSON.stringify({ color: { accent: { $value: "#0b57d0" } } }),
    );

    const doc = baseDocument();
    doc.sets.foundation.sources.push({
      $ref: "extra.json",
    } as unknown as Record<string, unknown>);

    const resolver = new Resolver(doc, { basePath: dir });
    const result = resolver.resolve({});
    expect(result.tokens.color.accent.$value).toBe("#0b57d0");
  });

  it("errors on a missing file reference", () => {
    const doc = baseDocument();
    doc.sets.foundation.sources.push({
      $ref: "nope.json",
    } as unknown as Record<string, unknown>);

    const resolver = new Resolver(doc, { basePath: "/nonexistent" });
    const result = resolver.resolve({});
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({ code: "MISSING", message: "File not found: nope.json" }),
    );
  });

  it("errors on an unparseable file reference", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "resolver-files-"));
    tempDirs.push(dir);
    fs.writeFileSync(path.join(dir, "bad.json"), "{ not json");

    const doc = baseDocument();
    doc.sets.foundation.sources.push({
      $ref: "bad.json",
    } as unknown as Record<string, unknown>);

    const result = new Resolver(doc, { basePath: dir }).resolve({});
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: "TYPE_MISMATCH",
        message: "Failed to parse file: bad.json",
      }),
    );
  });
});

describe("loadResolverDocument", () => {
  it("rejects a structurally invalid document", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "resolver-doc-"));
    tempDirs.push(dir);
    const file = path.join(dir, "resolver.json");
    fs.writeFileSync(file, JSON.stringify({ version: "2025-10-01" }));

    expect(loadResolverDocument(file)).toBeNull();
  });

  it("loads a structurally valid document", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "resolver-doc-"));
    tempDirs.push(dir);
    const file = path.join(dir, "resolver.json");
    fs.writeFileSync(file, JSON.stringify(baseDocument()));

    expect(loadResolverDocument(file)).toMatchObject({
      version: "2025-10-01",
    });
  });
});

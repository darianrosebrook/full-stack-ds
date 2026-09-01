// Unit suites for the legacy resolver core: transforms, interpolated
// fallback chains, and path resolution (references, cycles, depth, cache).
import { describe, expect, it, vi } from "vitest";
import {
  applyTransforms,
  resolveInterpolated,
  resolvePath,
} from "./resolver";
import type { ResolveContext, ResolverConfig } from "./types";
import type { Transform } from "./transforms";

function makeCtx(
  tokens: Record<string, unknown>,
  config: Partial<ResolverConfig> = {},
  overrides: Partial<ResolveContext> = {},
): ResolveContext {
  return {
    path: "test.path",
    theme: "light",
    platform: "web",
    brand: undefined,
    tokens,
    config: { resolveToReferences: false, ...config } as ResolverConfig,
    ...overrides,
  };
}

describe("applyTransforms", () => {
  it("returns the value unchanged when no transforms are configured", () => {
    const ctx = makeCtx({});
    expect(applyTransforms("#fff", ctx)).toBe("#fff");
  });

  it("runs only transforms whose match predicate accepts the context", () => {
    const upper: Transform = {
      name: "upper",
      match: () => true,
      apply: (v) => String(v).toUpperCase(),
    };
    const skipped: Transform = {
      name: "skip",
      match: () => false,
      apply: () => {
        throw new Error("must not run");
      },
    };
    const ctx = makeCtx({}, { transforms: [skipped, upper] });
    expect(applyTransforms("abc", ctx)).toBe("ABC");
  });

  it("chains matching transforms in order", () => {
    const ctx = makeCtx(
      {},
      {
        transforms: [
          { name: "a", match: () => true, apply: (v) => `${v}-a` },
          { name: "b", match: () => true, apply: (v) => `${v}-b` },
        ],
      },
    );
    expect(applyTransforms("x", ctx)).toBe("x-a-b");
  });
});

describe("resolveInterpolated", () => {
  const tokens = { color: { red: "#ff0000", blue: "#0000ff" } };

  it("resolves a single reference", () => {
    const ctx = makeCtx(tokens);
    expect(resolveInterpolated("{color.red}", "#000", ctx, [])).toBe("#ff0000");
  });

  it("walks a fallback chain to the first resolvable candidate", () => {
    const ctx = makeCtx(tokens);
    expect(
      resolveInterpolated("{color.missing} || {color.blue}", "#000", ctx, []),
    ).toBe("#0000ff");
  });

  it("falls back to the literal when all candidates fail and warns", () => {
    const onWarn = vi.fn();
    const ctx = makeCtx(tokens, { onWarn });
    expect(resolveInterpolated("{color.nope}", "#000", ctx, [])).toBe("#000");
    expect(onWarn).toHaveBeenCalledWith(
      expect.objectContaining({ code: "UNRESOLVED_FALLBACK" }),
    );
  });

  it("builds nested var() fallbacks in reference mode", () => {
    const ctx = makeCtx(
      tokens,
      { resolveToReferences: true, emitVarFallbackChain: true },
    );
    const out = resolveInterpolated("{color.a} || {color.b}", "#000", ctx, []);
    expect(out).toContain("var(--");
    expect(out).toContain(", ");
  });
});

describe("resolvePath — legacy resolution", () => {
  const tokens = {
    color: {
      primary: { base: "#111111" },
      alias: "{color.primary.base}",
      a: "{color.b}",
      b: "{color.a}",
    },
  };

  it("resolves a direct value", () => {
    expect(resolvePath("color.primary.base", makeCtx(tokens), [])).toBe("#111111");
  });

  it("resolves a reference to another token", () => {
    expect(resolvePath("color.alias", makeCtx(tokens), [])).toBe("#111111");
  });

  it("returns a var() reference for a missing path in reference mode", () => {
    const ctx = makeCtx(tokens, { resolveToReferences: true });
    expect(resolvePath("color.absent", ctx, [])).toContain("var(--");
  });

  it("warns and returns null when the visited guard reports a circular reference", () => {
    const onWarn = vi.fn();
    const ctx = makeCtx(tokens, { onWarn });
    expect(resolvePath("color.a", ctx, ["color.a"])).toBeNull();
    expect(onWarn).toHaveBeenCalledWith(
      expect.objectContaining({ code: "CIRCULAR" }),
    );
  });

  it("errors and returns null when the visited depth exceeds the budget", () => {
    const onError = vi.fn();
    const ctx = makeCtx(tokens, { maxDepth: 3, onError });
    expect(resolvePath("color.primary.base", ctx, ["a", "b", "c"])).toBeNull();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ code: "DEPTH_EXCEEDED" }),
    );
  });

  it("serves repeated resolutions from the configured cache", () => {
    const cache = new Map<string, unknown>();
    const mutable = {
      color: { primary: { base: "#111111" as unknown } },
    };
    const ctx = makeCtx(mutable, { cache: cache as never });
    const first = resolvePath("color.primary.base", ctx, []);
    (mutable.color.primary.base as unknown) = "#222222";
    const second = resolvePath("color.primary.base", ctx, []);
    expect(first).toBe("#111111");
    expect(second).toBe("#111111");
  });
});

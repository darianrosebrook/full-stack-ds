import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PATHS } from "../core/index.js";
import { composeTokens } from "./compose.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("composeTokens — real source tree", () => {
  it("composes the sharded source into composed.tokens.json", () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    expect(composeTokens(false)).toBe(true);
    expect(fs.existsSync(PATHS.tokens)).toBe(true);

    const composed = JSON.parse(fs.readFileSync(PATHS.tokens, "utf8"));
    // The composition nests core and semantic namespaces.
    expect(composed.core).toBeDefined();
    expect(composed.semantic).toBeDefined();
    expect(composed.core.color).toBeDefined();
    expect(composed.semantic.color).toBeDefined();
    expect(logSpy).toHaveBeenCalled();
  });

  it("re-composes incrementally without error", () => {
    expect(composeTokens(true)).toBe(true);
    expect(fs.existsSync(PATHS.tokens)).toBe(true);
  });

  it("emits deterministic output across two full runs", () => {
    const first = fs.readFileSync(PATHS.tokens, "utf8");
    composeTokens(false);
    const second = fs.readFileSync(PATHS.tokens, "utf8");
    expect(second).toBe(first);
  });
});

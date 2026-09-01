import { afterEach, describe, expect, it, vi } from "vitest";
import { main as buildMain } from "./build.js";
import { Diagnostics } from "./lib/types.js";

function withArgs(args: string[], fn: () => Promise<void>) {
  const originalArgv = process.argv;
  process.argv = ["node", "build.ts", ...args];
  return fn().finally(() => {
    process.argv = originalArgv;
  });
}

function exitSpyThrowing(): ReturnType<typeof vi.spyOn> {
  return vi.spyOn(process, "exit").mockImplementation((() => {
    throw new Error("process.exit");
  }) as never);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("top-level build entry (in-process)", () => {
  it("runs the validate-only mode over the real source tree", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await withArgs(["--validate-only"], buildMain);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalled();
  }, 120_000);

  it("runs the default build mode through the pipeline", async () => {
    const exitSpy = exitSpyThrowing();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await withArgs(["--prefix=fsds"], buildMain);

    expect(exitSpy).not.toHaveBeenCalled();
    expect(
      logSpy.mock.calls.some((a) =>
        String(a[0]).includes("Design tokens build completed"),
      ),
    ).toBe(true);
  }, 120_000);
});

describe("Diagnostics (lib/types)", () => {
  it("tracks warnings and errors with the error-code classifier", () => {
    const d = new Diagnostics();
    d.warn({ code: "NONSTANDARD", path: "/a", message: "x" });
    expect(d.hasErrors()).toBe(false);

    // hasErrors classifies by CODE, not channel: a MISSING-code warning
    // still counts as an error.
    d.warn({ code: "MISSING", path: "/b", message: "y" });
    expect(d.hasErrors()).toBe(true);

    d.error({ code: "TYPE_MISMATCH", path: "/c", message: "z" });
    expect(d.hasErrors()).toBe(true);

    d.clear();
    expect(d.list).toEqual([]);
    expect(d.hasErrors()).toBe(false);
  });
});

import fs from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { main as usageMain } from "./usage.js";
import { main as contrastMain } from "./check-contrast.js";

/**
 * In-process coverage of the live CLI runner mains. The import guards
 * added in this slice make the modules import-safe; mains are exported so
 * the process-level behavior can be exercised under vitest's instrumenter.
 */
function withArgs(args: string[], fn: () => Promise<void>) {
  const originalArgv = process.argv;
  process.argv = ["node", "runner", ...args];
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

describe("usage main (in-process)", () => {
  it("runs report mode to completion without exiting", async () => {
    const exitSpy = exitSpyThrowing();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await withArgs([], usageMain);

    expect(exitSpy).not.toHaveBeenCalled();
    expect(
      logSpy.mock.calls.some((a) => String(a[0]).includes("Usage Summary")),
    ).toBe(true);
  }, 120_000);

  it("passes the baseline check against the committed baseline", async () => {
    const exitSpy = exitSpyThrowing();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      withArgs(["--check-baseline"], usageMain),
    ).rejects.toThrow("process.exit");

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(
      logSpy.mock.calls.some((a) =>
        String(a[0]).includes("No usage regression"),
      ),
    ).toBe(true);
  }, 120_000);

  it("exits 2 when the baseline file is missing", async () => {
    const exitSpy = exitSpyThrowing();
    const existsSpy = vi
      .spyOn(fs, "existsSync")
      .mockImplementation((p) =>
        String(p).includes("usage-baseline.json") ? false : true,
      );
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      withArgs(["--check-baseline"], usageMain),
    ).rejects.toThrow("process.exit");

    expect(existsSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(2);
  }, 120_000);

  it("writes the baseline without touching the tracked file", async () => {
    const exitSpy = exitSpyThrowing();
    const writeSpy = vi
      .spyOn(fs, "writeFileSync")
      .mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      withArgs(["--write-baseline"], usageMain),
    ).rejects.toThrow("process.exit");

    expect(exitSpy).toHaveBeenCalledWith(0);
    const baselineCall = writeSpy.mock.calls.find((c) =>
      String(c[0]).includes("usage-baseline.json"),
    );
    expect(baselineCall).toBeDefined();
    const baseline = JSON.parse(baselineCall![1] as string);
    expect(baseline.unusedCount).toBeGreaterThan(0);
    expect(Array.isArray(baseline.unusedTokens)).toBe(true);
  }, 120_000);

  it("emits JSON output with serialized dates", async () => {
    const exitSpy = exitSpyThrowing();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await withArgs(["--json"], usageMain);

    expect(exitSpy).not.toHaveBeenCalled();
    const output = logSpy.mock.calls
      .map((a) => String(a[0]))
      .join("\n");
    expect(output).toContain('"totalTokens"');
    expect(output).toContain('"usageByToken"');
  }, 120_000);
});

describe("contrast main (in-process)", () => {
  it("passes the curated pairs against the real resolved graph", async () => {
    const exitSpy = exitSpyThrowing();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await expect(contrastMain()).rejects.toThrow("process.exit");

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(
      logSpy.mock.calls.some((a) =>
        String(a[0]).includes("pair(s) evaluated"),
      ),
    ).toBe(true);
  });

  it("exits 2 when the resolved graph is missing", async () => {
    const exitSpy = exitSpyThrowing();
    const existsSpy = vi
      .spyOn(fs, "existsSync")
      .mockImplementation((p) =>
        String(p).includes("resolved.tokens.json") ? false : true,
      );
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(contrastMain()).rejects.toThrow("process.exit");

    expect(existsSpy).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(2);
  });
});

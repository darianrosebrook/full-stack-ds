import { afterEach, describe, expect, it, vi } from "vitest";
import { buildTokens, runSteps } from "./build.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runSteps", () => {
  it("runs a known step and reports success", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    expect(await runSteps(["compose"])).toBe(true);
    expect(
      logSpy.mock.calls.some(
        (args) =>
          String(args[0]).includes("compose") &&
          String(args[0]).includes("Completed"),
      ),
    ).toBe(true);
  });

  it("rejects an unknown step", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await runSteps(["bogus"])).toBe(false);
    expect(
      errorSpy.mock.calls.some((args) =>
        String(args[0]).includes("Unknown step: bogus"),
      ),
    ).toBe(true);
  });
});

describe("buildTokens", () => {
  it("runs the full pipeline to completion", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const success = await buildTokens(false);

    expect(success).toBe(true);
    expect(
      logSpy.mock.calls.some((args) =>
        String(args[0]).includes("Design tokens build completed"),
      ),
    ).toBe(true);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});

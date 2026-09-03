// In-process CLI main-path suites. cli.ts runs main() at module top level,
// so importing the module WITH a stubbed process.argv IS the invocation —
// process.exit is mocked to throw PROCESS_EXIT so error branches assert
// via the rejection instead of killing the test runner. The suite runs
// from the repo root (the codegen cwd contract), against the real
// contracts corpus; generation paths use --dry-run so nothing is written.
import { afterEach, describe, expect, it, vi } from "vitest";

// Every case resets the module registry and re-imports cli.ts against the real
// contracts corpus, so the import graph is rebuilt per test rather than shared:
// ~2.6s for the file alone, ~12.5s under the root suite's 244-file parallel
// load. Individual cases overrun vitest's 5s default there, so the budget is
// raised for this file only — the re-import is what makes the module-level
// main() observable and cannot be amortised away.
vi.setConfig({ testTimeout: 20000 });

const PROCESS_EXIT = "PROCESS_EXIT";

function prepare(args: string[]) {
  vi.resetModules();
  vi.spyOn(process, "argv", "get").mockReturnValue(["node", "cli.js", ...args]);
  const exit = vi
    .spyOn(process, "exit")
    .mockImplementation((() => {
      throw new Error(PROCESS_EXIT);
    }) as never);
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  return { exit, log };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("cli main — incompatible flag guards", () => {
  const cases: { args: string[]; message: string }[] = [
    { args: ["--watch", "--validate"], message: "--watch is incompatible with --validate." },
    { args: ["--watch", "--dry-run"], message: "--watch is incompatible with --dry-run." },
    { args: ["--watch", "--migrate"], message: "--watch is incompatible with --migrate." },
    { args: ["--prune", "--watch"], message: "--prune is incompatible with --watch." },
    { args: ["--prune", "--tests-only"], message: "--prune is incompatible with --tests-only." },
    {
      args: ["--prune", "Button"],
      message: "--prune refuses to run with a name filter",
    },
    {
      args: ["--prune", "--target=react"],
      message: "--prune refuses to run with --target=react",
    },
  ];

  for (const c of cases) {
    it(`exits 1 for ${c.args.join(" ")}`, async () => {
      const { exit } = prepare(c.args);
      const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      await expect(import("./cli.js")).rejects.toThrow(PROCESS_EXIT);
      expect(exit).toHaveBeenCalledWith(1);
      expect(
        errSpy.mock.calls.some((call) => String(call[0]).includes(c.message)),
      ).toBe(true);
    });
  }

  it("exits 1 for an unknown --prune value", async () => {
    const { exit } = prepare(["--prune=bogus"]);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(import("./cli.js")).rejects.toThrow(PROCESS_EXIT);
    expect(exit).toHaveBeenCalledWith(1);
    expect(
      errSpy.mock.calls.some((call) =>
        String(call[0]).includes('Unknown --prune value "bogus"'),
      ),
    ).toBe(true);
  });

  it("exits 1 for an unknown target id", async () => {
    const { exit } = prepare(["--dry-run", "--target=not-a-real-target", "Button"]);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(import("./cli.js")).rejects.toThrow(PROCESS_EXIT);
    expect(exit).toHaveBeenCalledWith(1);
    void errSpy;
  });
});

describe("cli main — happy paths", () => {
  it("runs shape validation for a single component and exits 0", async () => {
    const { exit, log } = prepare(["--validate", "Button"]);
    await expect(import("./cli.js")).rejects.toThrow(PROCESS_EXIT);
    expect(exit).toHaveBeenCalledWith(0);
    expect(
      log.mock.calls.some((call) => String(call[0]).includes("Found 1 component contract")),
    ).toBe(true);
    expect(
      log.mock.calls.some((call) => String(call[0]).includes("VALID")),
    ).toBe(true);
  });

  it("runs semantic checks with shape validation and exits 0", async () => {
    const { exit, log } = prepare([
      "--validate",
      "--check-semantics",
      "Button",
    ]);
    await expect(import("./cli.js")).rejects.toThrow(PROCESS_EXIT);
    expect(exit).toHaveBeenCalledWith(0);
    expect(
      log.mock.calls.some((call) => String(call[0]).includes("Found 1 component contract")),
    ).toBe(true);
  });

  it("runs usage validation over the full corpus and exits 0", async () => {
    const { exit, log } = prepare(["--validate", "--check-usage"]);
    await expect(import("./cli.js")).rejects.toThrow(PROCESS_EXIT);
    expect(exit).toHaveBeenCalledWith(0);
    expect(
      log.mock.calls.some((call) => String(call[0]).includes("Usage validation")),
    ).toBe(true);
  });

  it("name-filtered usage validation over-reports cross-component refs (registry-blind)", async () => {
    // runUsageValidation builds its contract registry from the FILTERED
    // valid set, so a filtered run cannot resolve fsds.Icon from Button's
    // usage sidecar. This pins the honest current semantics: filtered
    // --check-usage exits 1 and names the unresolvable ref.
    const { exit } = prepare(["--validate", "--check-usage", "Button"]);
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await expect(import("./cli.js")).rejects.toThrow(PROCESS_EXIT);
    expect(exit).toHaveBeenCalledWith(1);
    expect(
      errSpy.mock.calls.some((call) => String(call[0]).includes("INVALID")),
    ).toBe(true);
  });

  it("dry-runs react generation for a single component without writing", async () => {
    const { exit, log } = prepare(["--dry-run", "--target=react", "Button"]);
    await import("./cli.js");
    expect(exit).not.toHaveBeenCalled();
    expect(
      log.mock.calls.some((call) => String(call[0]).includes("Found 1 component contract")),
    ).toBe(true);
  });

  it("dry-runs react generation with --force", async () => {
    const { exit } = prepare(["--dry-run", "--force", "--target=react", "Button"]);
    await import("./cli.js");
    expect(exit).not.toHaveBeenCalled();
  });

  it("filters multiple names down to the matching contracts", async () => {
    const { exit, log } = prepare(["--dry-run", "--target=react", "Button", "Dialog"]);
    await import("./cli.js");
    expect(exit).not.toHaveBeenCalled();
    expect(
      log.mock.calls.some((call) => String(call[0]).includes("Found 2 component contract")),
    ).toBe(true);
  });

  it("dry-runs the migrate path for a single component", async () => {
    const { exit } = prepare(["--dry-run", "--migrate", "--target=react", "Button"]);
    await import("./cli.js");
    expect(exit).not.toHaveBeenCalled();
  });
});

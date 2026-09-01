import { execSync } from "node:child_process";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The usage and contrast runners are CLI entrypoints wired into
 * package.json scripts (spawned by pre-push/CI gates), with unguarded
 * main() calls — so the honest test surface is process-level, exactly
 * the way the gates invoke them (pnpm exec tsx).
 */
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..", "..");

function runTsx(script: string, args: string[] = []): string {
  return execSync(
    `pnpm --filter @full-stack-ds/tokens exec tsx build/${script} ${args.join(" ")}`,
    {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
}

describe("usage runner (CLI spawn)", () => {
  it("exits 0 in report mode", () => {
    const stdout = runTsx("runners/usage.ts");
    expect(stdout).toContain("Usage");
  }, 120_000);

  it("exits 0 under --check-baseline against the committed baseline", () => {
    const stdout = runTsx("runners/usage.ts", ["--check-baseline"]);
    expect(stdout).toMatch(/baseline|Baseline|OK|pass/i);
  }, 120_000);
});

describe("contrast runner (CLI spawn)", () => {
  it("exits 0 with a green curated-pair report", () => {
    const stdout = runTsx("runners/check-contrast.ts");
    expect(stdout).toMatch(/contrast|Contrast|OK|pass/i);
  }, 120_000);
});

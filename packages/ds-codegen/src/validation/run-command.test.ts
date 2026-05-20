import { describe, it, expect } from "vitest";
import { runValidationPlan } from "./run-command.js";
import type { FrameworkValidationPlan } from "./types.js";

/**
 * Unit tests for the rail runner. We don't shell out to real
 * framework tools here — those exist behind the validate:generated
 * script. These tests verify the runner's normalization logic:
 *
 *   - exit 0 ⇒ status: pass, `direct` ⇒ pass, diagnostics empty
 *   - exit non-zero ⇒ status: fail, `direct` ⇒ fail, diagnostics populated
 *   - `covered_by_typecheck` and `not_covered` are preserved verbatim
 *     regardless of command outcome (honest declarations, not
 *     pass/fail outcomes)
 *   - knownGaps are forwarded
 *   - pnpm framing lines are stripped from diagnostics
 *   - diagnostic cap (80 lines) is enforced
 */
describe("runValidationPlan", () => {
  it("normalizes a passing plan: status=pass, direct→pass, no diagnostics", async () => {
    const plan: FrameworkValidationPlan = {
      framework: "react",
      command: ["node", "-e", "console.log('hello')"],
      checks: {
        typecheck: "direct",
        parse: "covered_by_typecheck",
      },
    };
    const result = await runValidationPlan(plan);
    expect(result.status).toBe("pass");
    expect(result.checks.typecheck).toBe("pass");
    expect(result.checks.parse).toBe("covered_by_typecheck");
    expect(result.diagnostics).toEqual([]);
    expect(result.scope).toBe("workspace");
    expect(result.artifactSelection).toBe("none");
    expect(result.artifactManifest).toBeNull();
  });

  it("normalizes a failing plan: status=fail, direct→fail, diagnostics captured", async () => {
    const plan: FrameworkValidationPlan = {
      framework: "vue",
      command: [
        "node",
        "-e",
        "console.error('error TS2322: Type X'); process.exit(1)",
      ],
      checks: { typecheck: "direct" },
    };
    const result = await runValidationPlan(plan);
    expect(result.status).toBe("fail");
    expect(result.checks.typecheck).toBe("fail");
    // Diagnostics are prefixed with `[<check>] ` so multi-command
    // plans (e.g. Angular tsc + ngc) can be attributed.
    expect(result.diagnostics).toContain("[typecheck] error TS2322: Type X");
  });

  it("preserves `not_covered` regardless of command outcome", async () => {
    const passingPlan: FrameworkValidationPlan = {
      framework: "angular",
      command: ["node", "-e", ""],
      checks: { typecheck: "direct", templateTypecheck: "not_covered" },
    };
    const passingResult = await runValidationPlan(passingPlan);
    expect(passingResult.status).toBe("pass");
    expect(passingResult.checks.templateTypecheck).toBe("not_covered");

    const failingPlan: FrameworkValidationPlan = {
      framework: "angular",
      command: ["node", "-e", "process.exit(1)"],
      checks: { typecheck: "direct", templateTypecheck: "not_covered" },
    };
    const failingResult = await runValidationPlan(failingPlan);
    expect(failingResult.status).toBe("fail");
    expect(failingResult.checks.templateTypecheck).toBe("not_covered");
  });

  it("forwards knownGaps from the plan into the result", async () => {
    const plan: FrameworkValidationPlan = {
      framework: "angular",
      command: ["node", "-e", ""],
      checks: { typecheck: "direct" },
      knownGaps: ["Angular template/ngtsc not exercised."],
    };
    const result = await runValidationPlan(plan);
    expect(result.knownGaps).toEqual(["Angular template/ngtsc not exercised."]);
  });

  it("strips pnpm framing lines from diagnostics", async () => {
    const plan: FrameworkValidationPlan = {
      framework: "svelte",
      command: [
        "node",
        "-e",
        "console.error('> @full-stack-ds/svelte@0.1.0 typecheck'); console.error('real svelte error here'); console.error(' ELIFECYCLE  Command failed with exit code 1.'); process.exit(1)",
      ],
      checks: { typecheck: "direct" },
    };
    const result = await runValidationPlan(plan);
    expect(result.diagnostics).toContain("[typecheck] real svelte error here");
    expect(
      result.diagnostics.find((line) =>
        line.includes("> @full-stack-ds/svelte"),
      ),
    ).toBeUndefined();
    expect(
      result.diagnostics.find((line) => line.includes(" ELIFECYCLE")),
    ).toBeUndefined();
  });

  it("records the actual command and duration", async () => {
    const plan: FrameworkValidationPlan = {
      framework: "lit",
      command: ["node", "-e", "setTimeout(() => process.exit(0), 50)"],
      checks: { typecheck: "direct" },
    };
    const result = await runValidationPlan(plan);
    expect(result.command).toContain("node");
    expect(result.command).toContain("setTimeout");
    expect(result.durationMs).toBeGreaterThanOrEqual(40);
  });

  it("multi-command plan: each direct check resolves from its own run", async () => {
    // Both commands pass → both direct checks pass, aggregate pass.
    const plan: FrameworkValidationPlan = {
      framework: "angular",
      commands: [
        { check: "typecheck", command: ["node", "-e", "process.exit(0)"] },
        { check: "templateTypecheck", command: ["node", "-e", "process.exit(0)"] },
      ],
      checks: { typecheck: "direct", templateTypecheck: "direct" },
    };
    const result = await runValidationPlan(plan);
    expect(result.status).toBe("pass");
    expect(result.checks.typecheck).toBe("pass");
    expect(result.checks.templateTypecheck).toBe("pass");
    expect(result.commandRuns).toHaveLength(2);
    expect(result.commandRuns[0].check).toBe("typecheck");
    expect(result.commandRuns[1].check).toBe("templateTypecheck");
  });

  it("multi-command plan: one fail does not short-circuit; checks attribute correctly", async () => {
    // First passes, second fails → typecheck=pass, templateTypecheck=fail,
    // aggregate=fail. Both runs are recorded.
    const plan: FrameworkValidationPlan = {
      framework: "angular",
      commands: [
        { check: "typecheck", command: ["node", "-e", "process.exit(0)"] },
        {
          check: "templateTypecheck",
          command: [
            "node",
            "-e",
            "console.error('NG8002: bad binding'); process.exit(1)",
          ],
        },
      ],
      checks: { typecheck: "direct", templateTypecheck: "direct" },
    };
    const result = await runValidationPlan(plan);
    expect(result.status).toBe("fail");
    expect(result.checks.typecheck).toBe("pass");
    expect(result.checks.templateTypecheck).toBe("fail");
    expect(result.diagnostics).toContain(
      "[templateTypecheck] NG8002: bad binding",
    );
    // First run's diagnostics are empty because it passed.
    expect(result.commandRuns[0].diagnostics).toEqual([]);
    expect(result.commandRuns[1].diagnostics).toContain(
      "[templateTypecheck] NG8002: bad binding",
    );
  });

  it("rejects plans with both `command` and `commands`", async () => {
    const plan: FrameworkValidationPlan = {
      framework: "react",
      command: ["node", "-e", ""],
      commands: [{ check: "typecheck", command: ["node", "-e", ""] }],
      checks: { typecheck: "direct" },
    };
    await expect(runValidationPlan(plan)).rejects.toThrow(
      /declares both `command` and `commands`/,
    );
  });
});

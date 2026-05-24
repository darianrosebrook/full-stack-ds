import { describe, expect, it } from "vitest";
import { figmaValidationPlan } from "./figma.js";

describe("figmaValidationPlan", () => {
  it("declares bounded package-level admission and honest non-claims", () => {
    expect(figmaValidationPlan.framework).toBe("figma");
    expect(figmaValidationPlan.commands).toEqual([
      {
        check: "typecheck",
        command: ["pnpm", "--filter", "@full-stack-ds/figma-plugin", "run", "typecheck"],
        scope: {
          packageRoot: "packages/ds-figma-plugin/",
          extensions: [".ts", ".json"],
          coverage: "covered_by_package_check",
        },
      },
    ]);
    expect(figmaValidationPlan.knownGaps).toEqual([
      "This plan admits generated descriptor registry/package integration. It does not prove live Figma canvas mutation, library publication, or MCP tool availability.",
      "Descriptor JSON schema is unit-tested in the figma emitter lane; package typecheck only proves the generated registry is accepted by the plugin package.",
    ]);
  });
});

import type { FrameworkValidationPlan } from "../types.js";

/**
 * Figma admission plan.
 *
 * The generated Figma lane emits JSON descriptors plus a generated TypeScript
 * registry consumed by the plugin package. The package-level TypeScript check
 * admits the generated registry and plugin integration surface. Descriptor
 * schema validity is pinned separately by the figma emitter unit tests because
 * JSON descriptor validation is a codegen invariant, not a Figma compiler pass.
 */
export const figmaValidationPlan: FrameworkValidationPlan = {
  framework: "figma" as FrameworkValidationPlan["framework"],
  commands: [
    {
      check: "typecheck",
      command: ["pnpm", "--filter", "@full-stack-ds/figma-plugin", "run", "typecheck"],
      scope: {
        packageRoot: "packages/ds-figma-plugin/",
        extensions: [".ts", ".json"],
        coverage: "covered_by_package_check",
      },
    },
  ],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
    descriptorSchema: "covered_by_typecheck",
  },
  knownGaps: [
    "This plan admits generated descriptor registry/package integration. It does not prove live Figma canvas mutation, library publication, or MCP tool availability.",
    "Descriptor JSON schema is unit-tested in the figma emitter lane; package typecheck only proves the generated registry is accepted by the plugin package.",
  ],
};

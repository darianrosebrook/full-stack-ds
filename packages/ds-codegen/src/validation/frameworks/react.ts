import type { FrameworkValidationPlan } from "../types.js";
// Type-only import: the AdmissionDescriptor *shape* is a rail concept owned by
// admission-descriptor.ts; this target owns the *values*. A type-only import is
// erased at emit, so admission-descriptor.ts importing this descriptor value
// back is not a runtime cycle.
import type { AdmissionDescriptor } from "../admission-descriptor.js";

export const reactValidationPlan: FrameworkValidationPlan = {
  framework: "react",
  commands: [
    {
      check: "typecheck",
      command: ["pnpm", "--filter", "@full-stack-ds/react", "run", "typecheck"],
      scope: {
        packageRoot: "packages/ds-react/",
        extensions: [".ts", ".tsx"],
        coverage: "covered_by_package_check",
      },
    },
  ],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
  },
};

/**
 * React's self-declared rail admission facts. Authored here, beside the plan,
 * so this module is the single source for "how React is admitted." The central
 * registry (admission-descriptor.ts) only aggregates and validates these.
 */
export const reactAdmissionDescriptor: AdmissionDescriptor = {
  id: "react",
  outputTreeRelPath: "packages/ds-react/src/components",
  sourceExtensions: [".tsx", ".ts"],
  plan: reactValidationPlan,
  reportRank: 0,
};

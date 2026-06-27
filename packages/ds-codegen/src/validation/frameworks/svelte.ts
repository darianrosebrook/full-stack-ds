import type { FrameworkValidationPlan } from "../types.js";
import type { AdmissionDescriptor } from "../admission-descriptor.js";

export const svelteValidationPlan: FrameworkValidationPlan = {
  framework: "svelte",
  commands: [
    {
      check: "typecheck",
      command: ["pnpm", "--filter", "@full-stack-ds/svelte", "run", "typecheck"],
      // svelte-check covers .svelte SFCs and .ts files in the
      // package. Coverage is `covered_by_package_check` — the
      // command runs at the package level via the package tsconfig
      // and the svelte-check default workspace scope.
      scope: {
        packageRoot: "packages/ds-svelte/",
        extensions: [".ts", ".svelte"],
        coverage: "covered_by_package_check",
      },
    },
  ],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
    template: "covered_by_typecheck",
  },
};

/** Svelte's self-declared rail admission facts (authored beside the plan). */
export const svelteAdmissionDescriptor: AdmissionDescriptor = {
  id: "svelte",
  outputTreeRelPath: "packages/ds-svelte/src/components",
  sourceExtensions: [".svelte", ".ts"],
  plan: svelteValidationPlan,
  reportRank: 2,
};

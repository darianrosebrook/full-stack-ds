import type { FrameworkValidationPlan } from "../types.js";

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

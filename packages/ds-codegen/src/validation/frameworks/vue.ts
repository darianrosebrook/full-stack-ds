import type { FrameworkValidationPlan } from "../types.js";

export const vueValidationPlan: FrameworkValidationPlan = {
  framework: "vue",
  commands: [
    {
      check: "typecheck",
      command: ["pnpm", "--filter", "@full-stack-ds/vue", "run", "typecheck"],
      // vue-tsc parses .vue SFCs in addition to .ts/.tsx, so the
      // scope's extension filter covers all three. Coverage stays
      // `covered_by_package_check` — vue-tsc runs at the package
      // level via the package tsconfig.
      scope: {
        packageRoot: "packages/ds-vue/",
        extensions: [".ts", ".tsx", ".vue"],
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

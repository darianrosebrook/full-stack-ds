import type { FrameworkValidationPlan } from "../types.js";

export const vueValidationPlan: FrameworkValidationPlan = {
  framework: "vue",
  command: ["pnpm", "--filter", "@full-stack-ds/vue", "run", "typecheck"],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
    template: "covered_by_typecheck",
  },
};

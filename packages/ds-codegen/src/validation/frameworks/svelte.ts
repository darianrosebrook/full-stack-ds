import type { FrameworkValidationPlan } from "../types.js";

export const svelteValidationPlan: FrameworkValidationPlan = {
  framework: "svelte",
  command: ["pnpm", "--filter", "@full-stack-ds/svelte", "run", "typecheck"],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
    template: "covered_by_typecheck",
  },
};

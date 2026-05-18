import type { FrameworkValidationPlan } from "../types.js";

export const litValidationPlan: FrameworkValidationPlan = {
  framework: "lit",
  command: ["pnpm", "--filter", "@full-stack-ds/lit", "run", "typecheck"],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
    template: "not_covered",
  },
  knownGaps: [
    "Lit template literal admission (lit-analyzer / lit-plugin) is not exercised by the current command. The plan runs tsc, which validates that the template-literal string is well-typed JS but does not validate the lit-html template grammar, slot-name references, or property-binding directives.",
  ],
};

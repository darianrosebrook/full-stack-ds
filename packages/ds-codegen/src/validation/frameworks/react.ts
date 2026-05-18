import type { FrameworkValidationPlan } from "../types.js";

export const reactValidationPlan: FrameworkValidationPlan = {
  framework: "react",
  command: [
    "pnpm",
    "--filter",
    "@full-stack-ds/react",
    "run",
    "typecheck",
  ],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
  },
};

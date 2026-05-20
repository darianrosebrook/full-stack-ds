import type { FrameworkValidationPlan } from "../types.js";

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

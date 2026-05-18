import type { FrameworkValidationPlan } from "../types.js";

export const angularValidationPlan: FrameworkValidationPlan = {
  framework: "angular",
  command: [
    "pnpm",
    "--filter",
    "@full-stack-ds/angular",
    "run",
    "typecheck",
  ],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
    templateTypecheck: "not_covered",
  },
  knownGaps: [
    "Angular template/ngtsc validation is not exercised by the current command. The plan runs raw tsc (per packages/ds-angular/tsconfig.json), which does NOT invoke the Angular compiler. Errors in @Component template strings, @HostBinding expressions, structural directives, and DI token wiring will only surface at runtime or under `ng build` / `ng test` with the Angular compiler plugin enabled. Filed as follow-up: extend ds-angular tsconfig with angularCompilerOptions and invoke ngtsc.",
  ],
};

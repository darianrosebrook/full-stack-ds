import type { FrameworkValidationPlan } from "../types.js";

/**
 * Angular admission rail (post CODEGEN-RAIL-ANGULAR-NGTSC-01).
 *
 * Two commands, each attributed to a distinct check:
 *
 * 1. `typecheck` (raw tsc) — proves the generated `.component.ts`
 *    files type-check as plain TypeScript modules. Covers IR-level
 *    type errors, @Input typing, signal usage, etc.
 *
 * 2. `templateTypecheck` (ngc with strictTemplates) — proves the
 *    generated @Component template strings parse and type-check
 *    against the Angular compiler's view of HTMLElement types and
 *    standalone-component imports. Catches NG8002 (binding to
 *    read-only IDL like <label>.form), NG8113 (unused standalone
 *    imports), NG6004 (missing standalone imports), etc.
 *
 * Both run unconditionally; a failure in one does NOT short-circuit
 * the other, so a single rail invocation surfaces the full
 * admission picture.
 */
export const angularValidationPlan: FrameworkValidationPlan = {
  framework: "angular",
  commands: [
    {
      check: "typecheck",
      command: [
        "pnpm",
        "--filter",
        "@full-stack-ds/angular",
        "run",
        "typecheck",
      ],
    },
    {
      check: "templateTypecheck",
      command: [
        "pnpm",
        "--filter",
        "@full-stack-ds/angular",
        "run",
        "typecheck:ngc",
      ],
    },
  ],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
    templateTypecheck: "direct",
  },
};

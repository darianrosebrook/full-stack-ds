import type { FrameworkValidationPlan } from "../types.js";

/**
 * Lit admission rail (post CODEGEN-RAIL-LIT-TEMPLATE-ADMISSION-01).
 *
 * Two commands, each attributed to a distinct check:
 *
 * 1. `typecheck` (raw tsc) — proves the generated `.ts` files
 *    type-check as plain TypeScript modules.
 *
 * 2. `templateTypecheck` (lit-analyzer) — proves the generated
 *    lit-html `html\`...\`` template literals parse against
 *    lit-analyzer's HTML data model, with all enabled rules
 *    except the one declared rule narrowing.
 *
 * Declared rule narrowing: `no-incompatible-type-binding` is
 * disabled. Rationale: lit-analyzer's HTML data model requires
 * literal-union compatibility for several DOM attributes where
 * the design-system contracts intentionally expose broader
 * `string` APIs (e.g. `<input type=${this.type}>` where the
 * contract keeps `type?: string` to preserve HTML/future/custom
 * value compatibility, and channel-bound `aria-expanded` where
 * the IR-derived channel value type is broader than the strict
 * ARIA literal-union slot). This is a declared analyzer-policy
 * boundary, NOT defect masking — the runtime is type-correct
 * under the package TypeScript pass, and lit-analyzer continues
 * to exercise every other rule (template syntax, decorator
 * metadata, missing imports, nullable/undefined leakage, invalid
 * bindings not caused by this contract-policy mismatch, ...).
 */
export const litValidationPlan: FrameworkValidationPlan = {
  framework: "lit",
  commands: [
    {
      check: "typecheck",
      command: ["pnpm", "--filter", "@full-stack-ds/lit", "run", "typecheck"],
    },
    {
      check: "templateTypecheck",
      command: [
        "pnpm",
        "--filter",
        "@full-stack-ds/lit",
        "run",
        "typecheck:templates",
      ],
    },
  ],
  checks: {
    typecheck: "direct",
    parse: "covered_by_typecheck",
    templateTypecheck: "direct",
  },
  knownGaps: [
    "Declared analyzer-policy boundary (NOT a generated-output defect, NOT a binding-site type escape): the lit-analyzer rule `no-incompatible-type-binding` is disabled in the `typecheck:templates` script. lit-analyzer's literal-union strictness for several DOM attribute slots is narrower than the design-system contract type policy (e.g. `<input type=${this.type}>` against contract `type?: string`). Whether contract props should gain stricter per-attribute literal-union typing is a separate contract-policy slice because it affects all framework emitters and public APIs.",
  ],
};

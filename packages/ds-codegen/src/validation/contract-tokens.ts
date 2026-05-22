/**
 * Contract → emitted-CSS drift validation.
 *
 * The sibling validator at `validation/tokens.ts` proves that every
 * resolvesTo path in a contract corresponds to a real leaf in the
 * composed token graph. This module proves the next invariant in the
 * pipeline: that the emitted `<Component>.tokens.css` per framework
 * matches what the codegen WOULD emit if you ran it right now.
 *
 * Failure mode this catches: somebody edits a contract's structured
 * `tokens.<part>.<key>` entry but forgets to regenerate component CSS,
 * OR somebody hand-edits a `<Component>.tokens.css` generated region
 * without going back to the contract. Either way, the truth source
 * (contract) and the consumed artifact (.tokens.css) drift.
 *
 * Why byte-compare against a fresh emit instead of parsing the CSS:
 * the emit pipeline is deterministic and idempotent. If the contract
 * says X and we regen, we get exactly the same output every time. A
 * byte-compare of the `@generated:start tokens` region against a fresh
 * emit IS the structural check — anything that differs is drift. No
 * CSS parser needed; no risk of accidentally validating against a
 * normalized form that's different from what the emitter produces.
 *
 * The `@custom:start overrides` region is NOT validated — that's
 * designer authoring surface, preserved by the preservation system.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { emitTokensCss } from "../css.js";
import { splitSections, type Section } from "../preserve.js";
import type { ValidationIssue } from "../validate.js";

/**
 * Frameworks whose component packages live at `packages/ds-<id>/src/components/`.
 * Validator iterates these in order to check each framework's emitted artifact.
 * Source of truth for the list: the per-framework factories' emit paths.
 */
const FRAMEWORKS = ["react", "vue", "svelte", "angular", "lit"] as const;

function resolveRepoRoot(): string {
  let here: string;
  try {
    here = fileURLToPath(new URL(".", import.meta.url));
  } catch {
    here = process.cwd();
  }
  let dir = here;
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

/**
 * Determine whether a contract authors any structured TokenResolution.
 * Used to decide whether a missing `<Component>.tokens.css` is a failure
 * (contract authored structured tokens; CSS must exist) vs. a no-op
 * (contract has no structured tokens, nothing to validate against).
 */
function hasStructuredTokens(contract: ComponentContract): boolean {
  function walk(node: unknown): boolean {
    if (!node || typeof node !== "object" || Array.isArray(node)) return false;
    const obj = node as Record<string, unknown>;
    if (typeof obj.resolvesTo === "string" && typeof obj.fallback === "string") {
      return true;
    }
    for (const value of Object.values(obj)) {
      if (walk(value)) return true;
    }
    return false;
  }
  return walk(contract.tokens);
}

/**
 * Extract the body of the `generated:tokens` section from a parsed
 * section list. Returns null when no such section is found (a file
 * without preservation markers, or marked-up wrong).
 */
function extractTokensSectionBody(sections: Section[]): string | null {
  for (const section of sections) {
    if (section.kind === "generated" && section.id === "tokens") {
      return section.body;
    }
  }
  return null;
}

/**
 * Validate that emitted `<Component>.tokens.css` matches what the codegen
 * would produce right now from the contract. Iterates all 5 framework
 * packages; an entry in the issue list per per-framework drift.
 *
 * When the contract has no structured TokenResolution entries, this is
 * a no-op — there's nothing to drift against. (Future contracts that
 * promote legacy flat-string tokens into structured form will start
 * being validated automatically.)
 */
export function validateContractEmittedCss(
  contract: ComponentContract,
): ValidationIssue[] {
  if (!hasStructuredTokens(contract)) return [];

  const repoRoot = resolveRepoRoot();
  const expectedTokensCss = emitTokensCss(buildComponentIR(contract));
  let expectedBody: string | null;
  try {
    expectedBody = extractTokensSectionBody(splitSections(expectedTokensCss));
  } catch {
    // emitTokensCss should always produce valid markers; if not, that's a
    // codegen bug, not a contract drift. Surface it loudly.
    return [
      {
        pointer: "/tokens",
        message:
          "internal: emitTokensCss produced output that splitSections cannot parse — codegen bug, not contract drift.",
      },
    ];
  }
  if (expectedBody === null) {
    return [
      {
        pointer: "/tokens",
        message:
          "internal: emitTokensCss produced output with no `generated:tokens` section — codegen bug.",
      },
    ];
  }

  const issues: ValidationIssue[] = [];
  const componentName = contract.name;
  const observedBodies: Array<{ fw: string; body: string }> = [];

  for (const fw of FRAMEWORKS) {
    const cssPath = join(
      repoRoot,
      "packages",
      `ds-${fw}`,
      "src",
      "components",
      componentName,
      `${componentName}.tokens.css`,
    );

    if (!existsSync(cssPath)) {
      issues.push({
        pointer: "/tokens",
        message:
          `${fw}: ${componentName}.tokens.css missing at packages/ds-${fw}/src/components/${componentName}/. ` +
          `Run \`pnpm run generate -- --target=${fw} ${componentName}\` to emit it.`,
      });
      continue;
    }

    const onDisk = readFileSync(cssPath, "utf8");
    let observedBody: string | null;
    try {
      observedBody = extractTokensSectionBody(splitSections(onDisk));
    } catch {
      issues.push({
        pointer: "/tokens",
        message:
          `${fw}: ${componentName}.tokens.css has malformed preservation markers — ` +
          `regenerate via \`pnpm run generate -- --target=${fw} ${componentName}\`.`,
      });
      continue;
    }
    if (observedBody === null) {
      issues.push({
        pointer: "/tokens",
        message:
          `${fw}: ${componentName}.tokens.css is missing the @generated:start tokens region — ` +
          `regenerate via \`pnpm run generate -- --target=${fw} ${componentName}\`.`,
      });
      continue;
    }
    observedBodies.push({ fw, body: observedBody });

    if (observedBody !== expectedBody) {
      issues.push({
        pointer: "/tokens",
        message:
          `${fw}: ${componentName}.tokens.css @generated:start tokens region does not match the contract. ` +
          `Regenerate via \`pnpm run generate -- --target=${fw} ${componentName}\` ` +
          `or update the contract to match. ` +
          buildDiffHint(expectedBody, observedBody),
      });
    }
  }

  // Cross-framework consistency: if multiple frameworks have the file and
  // their @generated regions diverge from each other (above the expected
  // baseline), that's a separate signal — one framework's regen ran but
  // another's didn't.
  if (observedBodies.length >= 2) {
    const baseline = observedBodies[0];
    for (const { fw, body } of observedBodies.slice(1)) {
      if (body !== baseline.body) {
        issues.push({
          pointer: "/tokens",
          message:
            `cross-framework drift: ${fw} differs from ${baseline.fw} for ${componentName}.tokens.css. ` +
            `All 5 frameworks emit byte-identical tokens.css; this asymmetry means one regen ran and another didn't. ` +
            `Run \`pnpm run generate -- --target=all ${componentName}\`.`,
        });
        break; // one cross-framework issue per contract is enough
      }
    }
  }

  return issues;
}

/**
 * Build a short diff hint pointing at the first differing line. Goal is
 * to make the operator-facing error message actionable without producing
 * a 200-line diff that buries the signal.
 */
function buildDiffHint(expected: string, observed: string): string {
  const expLines = expected.split("\n");
  const obsLines = observed.split("\n");
  const max = Math.max(expLines.length, obsLines.length);
  for (let i = 0; i < max; i += 1) {
    const e = expLines[i] ?? "(EOF)";
    const o = obsLines[i] ?? "(EOF)";
    if (e !== o) {
      return `First diff at line ${i + 1}:\n    expected: ${e.trim()}\n    on disk:  ${o.trim()}`;
    }
  }
  // Length differs but no individual line; rare but possible.
  return `expected ${expLines.length} line(s); on disk has ${obsLines.length}.`;
}

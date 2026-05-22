/**
 * Contract → emitted-`<Component>.css` drift validation.
 *
 * Sibling to `contract-tokens.ts` (which proves the `.tokens.css` artifact
 * matches the contract). This module proves the same invariant for the
 * other half of the emit: the consumer-side declarations that live in
 * `<Component>.css`'s `@generated:start styles` region.
 *
 * Why this exists: after the tokens/styles convergence
 * (PLAN-TOKENS-STYLES-CONVERGENCE-001), `styles.json` is the source of
 * truth for property consumers (var() references to slots), layout
 * literals filtered by `platforms`, compound `:has()` selectors, and
 * sr-only recipes. None of that was covered by the existing
 * `validateContractEmittedCss`, which only byte-compares the tokens
 * region. A future IR change that breaks `<Component>.css` emit while
 * leaving `<Component>.tokens.css` intact would have slipped past
 * `pnpm run generate:check`.
 *
 * Doctrinal stance, matching the sibling tokens validator: byte-compare
 * against a fresh emit, no CSS parser, never modifies anything. The
 * `@import "./<Component>.tokens.css"` line lives OUTSIDE the
 * `@generated:start styles` region (it's a `between` section per
 * `css.ts:emitCss`) and is deliberately NOT part of this proof — the
 * tokens validator already guarantees the imported file is correct.
 *
 * The `@custom:start overrides` region is NOT validated — designer
 * authoring surface, preserved by the section system.
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ComponentContract } from "../contract.js";
import { buildComponentIR } from "../ir.js";
import { emitCss } from "../css.js";
import { splitSections, type Section } from "../preserve.js";
import type { ValidationIssue } from "../validate.js";

/**
 * Frameworks whose component packages live at `packages/ds-<id>/src/components/`.
 * Source of truth for the list: the per-framework factories' emit paths.
 * Kept in sync with `contract-tokens.ts:FRAMEWORKS`.
 */
const FRAMEWORKS = ["react", "vue", "svelte", "angular", "lit"] as const;

/**
 * Test-only override for the repo root. Production code never touches
 * this. Setting it via `_setRepoRootForTests` lets tests point the
 * validator at a tmp fixture without monkey-patching fs.
 */
let repoRootOverride: string | undefined;

export function _setRepoRootForTests(root: string | undefined): void {
  repoRootOverride = root;
}

function resolveRepoRoot(): string {
  if (repoRootOverride !== undefined) return repoRootOverride;
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
 * Decide whether the contract is one we should validate. We validate
 * any contract that's a renderable component (has a name; not a
 * primitive). This is intentionally wider than `hasConsumerStyles`
 * would be: a contract with no styles.json still emits an *empty*
 * `generated:styles` region, and we want to catch hand-edits that
 * smuggle declarations into that region. Tokens-only contracts get
 * an empty expectedBody and the validator confirms the on-disk
 * region is also empty.
 *
 * Primitive contracts (under packages/ds-contracts/primitives/) are
 * filtered out elsewhere in the CLI; this validator only sees
 * component contracts via the main loop.
 */
function shouldValidate(contract: ComponentContract): boolean {
  return typeof contract.name === "string" && contract.name.length > 0;
}

/**
 * Extract the body of the `generated:styles` section from a parsed
 * section list. Returns null when the file lacks the section (file
 * without preservation markers, or markers wrong).
 */
function extractStylesSectionBody(sections: Section[]): string | null {
  for (const section of sections) {
    if (section.kind === "generated" && section.id === "styles") {
      return section.body;
    }
  }
  return null;
}

/**
 * Validate that emitted `<Component>.css` matches what the codegen
 * would produce right now from the contract. Iterates all 5 framework
 * packages and reports per-framework byte drift plus cross-framework
 * divergence.
 *
 * No-op when the contract has no consumer-side declarations
 * (`contract.styles` empty or absent) — there's nothing to drift
 * against. Future contracts that gain a `styles.json` start being
 * validated automatically.
 */
export function validateContractEmittedStyles(
  contract: ComponentContract,
): ValidationIssue[] {
  if (!shouldValidate(contract)) return [];

  const repoRoot = resolveRepoRoot();
  const expectedCss = emitCss(buildComponentIR(contract));
  let expectedBody: string | null;
  try {
    expectedBody = extractStylesSectionBody(splitSections(expectedCss));
  } catch {
    return [
      {
        pointer: "/styles",
        message:
          "internal: emitCss produced output that splitSections cannot parse — codegen bug, not contract drift.",
      },
    ];
  }
  if (expectedBody === null) {
    return [
      {
        pointer: "/styles",
        message:
          "internal: emitCss produced output with no `generated:styles` section — codegen bug.",
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
      `${componentName}.css`,
    );

    if (!existsSync(cssPath)) {
      issues.push({
        pointer: "/styles",
        message:
          `${fw}: ${componentName}.css missing at packages/ds-${fw}/src/components/${componentName}/. ` +
          `Run \`pnpm run generate -- --target=${fw} ${componentName}\` to emit it.`,
      });
      continue;
    }

    const onDisk = readFileSync(cssPath, "utf8");
    let observedBody: string | null;
    try {
      observedBody = extractStylesSectionBody(splitSections(onDisk));
    } catch {
      issues.push({
        pointer: "/styles",
        message:
          `${fw}: ${componentName}.css has malformed preservation markers — ` +
          `regenerate via \`pnpm run generate -- --target=${fw} ${componentName}\`.`,
      });
      continue;
    }
    if (observedBody === null) {
      issues.push({
        pointer: "/styles",
        message:
          `${fw}: ${componentName}.css is missing the @generated:start styles region — ` +
          `regenerate via \`pnpm run generate -- --target=${fw} ${componentName}\`.`,
      });
      continue;
    }
    observedBodies.push({ fw, body: observedBody });

    if (observedBody !== expectedBody) {
      issues.push({
        pointer: "/styles",
        message:
          `${fw}: ${componentName}.css @generated:start styles region does not match the contract. ` +
          `Regenerate via \`pnpm run generate -- --target=${fw} ${componentName}\` ` +
          `or update the contract to match. ` +
          buildDiffHint(expectedBody, observedBody),
      });
    }
  }

  // Cross-framework divergence — one signal per contract, not per pair.
  // All 5 web targets should produce byte-identical styles regions; if
  // they don't, one framework's regen ran and another's didn't.
  if (observedBodies.length >= 2) {
    const baseline = observedBodies[0];
    for (const { fw, body } of observedBodies.slice(1)) {
      if (body !== baseline.body) {
        issues.push({
          pointer: "/styles",
          message:
            `cross-framework drift: ${fw} differs from ${baseline.fw} for ${componentName}.css. ` +
            `All 5 frameworks emit byte-identical styles regions; this asymmetry means one regen ran and another didn't. ` +
            `Run \`pnpm run generate -- --target=all ${componentName}\`.`,
        });
        break;
      }
    }
  }

  return issues;
}

/**
 * Short first-diff hint — keeps operator-facing errors actionable
 * without burying the signal in a 200-line diff. Identical to the
 * sibling helper in `contract-tokens.ts`; intentionally not shared
 * yet because the message scaffolding differs and a future merge
 * would have to align on phrasing.
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
  return `expected ${expLines.length} line(s); on disk has ${obsLines.length}.`;
}

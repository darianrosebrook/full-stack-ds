/**
 * Contract → icon-catalog reference validation
 * (ICON-CATALOG-RUNTIME-DELIVERY-01).
 *
 * The token analogy (validation/tokens.ts) applied to icons: every literal
 * icon NAME a contract supplies must exist in the icon corpus, the same way
 * every `resolvesTo` path must exist in the composed token graph.
 *
 * What counts as an icon reference is derived structurally, never by
 * component-name lore: a prop is icon-name-typed iff the target contract's
 * `anatomy.dom` carries an `iconGlyph` directive whose `nameFrom` binds that
 * prop. Literal values for such props appear in two authored surfaces:
 *
 *   1. A contract dom node with `componentRef: "fsds.<X>"` supplying the
 *      prop through static `attrs` or a `literal:` binding — validated by
 *      `validateContractIconRefs` in the `--check-semantics` pass.
 *   2. A usage sidecar tree supplying the prop literally — validated by the
 *      usage cross-ref pass (validation/usage.ts calls into
 *      `iconNamePropsOf`/`loadKnownIconNames` here).
 *
 * The known-name set loads from the COMMITTED authoring corpus
 * (packages/ds-iconography/icons/<Name>/<Name>.icon.json), not from the
 * package's gitignored generated/ scratch — validation must not depend on a
 * prior build having run.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ComponentContract, ContractDomNode } from "../contract.js";
import type { ValidationIssue } from "../validate.js";

/** Resolve the icon source corpus root by walking up to the workspace marker. */
function getIconCorpusRoot(): string {
  let here: string;
  try {
    here = fileURLToPath(new URL(".", import.meta.url));
  } catch {
    here = process.cwd();
  }
  let dir = here;
  let repoRoot = process.cwd();
  for (let i = 0; i < 12; i += 1) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) {
      repoRoot = dir;
      break;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return join(repoRoot, "packages", "ds-iconography", "icons");
}

let cachedIconNames: Set<string> | "missing" | null = null;

/**
 * Canonical icon names from the committed source corpus. Memoized for the
 * CLI pass. Aliases are search metadata, not runtime lookup keys, so only
 * `name` fields count.
 */
export function loadKnownIconNames(): Set<string> | "missing" {
  if (cachedIconNames !== null) return cachedIconNames;

  const corpusRoot = getIconCorpusRoot();
  if (!existsSync(corpusRoot)) {
    cachedIconNames = "missing";
    return "missing";
  }

  const out = new Set<string>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const abs = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(abs);
      } else if (entry.isFile() && entry.name.endsWith(".icon.json")) {
        try {
          const parsed = JSON.parse(readFileSync(abs, "utf8")) as {
            name?: unknown;
          };
          if (typeof parsed.name === "string") out.add(parsed.name);
        } catch {
          // A malformed icon contract fails the iconography validator; this
          // pass only needs the resolvable names.
        }
      }
    }
  };
  walk(corpusRoot);
  cachedIconNames = out;
  return out;
}

/** Test-only escape hatch, mirroring tokens.ts. Production never calls it. */
export function _resetKnownIconNamesCacheForTests(
  override?: Set<string> | "missing",
): void {
  cachedIconNames = override === undefined ? null : override;
}

/**
 * The set of prop names on `contract` that carry canonical icon names —
 * i.e. every prop an `anatomy.dom` iconGlyph directive binds via `nameFrom`.
 * Empty set for components without a glyph directive.
 */
export function iconNamePropsOf(contract: ComponentContract): Set<string> {
  const out = new Set<string>();
  const dom = getDomRoot(contract);
  const walk = (node: ContractDomNode | undefined): void => {
    if (!node) return;
    const nameFrom = node.iconGlyph?.nameFrom;
    if (typeof nameFrom === "string" && nameFrom.startsWith("prop:")) {
      out.add(nameFrom.slice("prop:".length));
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(dom);
  return out;
}

function getDomRoot(contract: ComponentContract): ContractDomNode | undefined {
  const anatomy = contract.anatomy;
  if (!anatomy || Array.isArray(anatomy)) return undefined;
  return (anatomy as { dom?: ContractDomNode }).dom;
}

/**
 * Validate every literal icon name this contract supplies to a referenced
 * component (componentRef nodes) against the icon corpus. Wired into the
 * `--check-semantics` pass alongside validateContractTokens.
 */
export function validateContractIconRefs(
  contract: ComponentContract,
  ctx: { allContracts: ReadonlyMap<string, ComponentContract> },
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const dom = getDomRoot(contract);
  if (!dom) return issues;

  const walk = (node: ContractDomNode, pointer: string): void => {
    if (node.componentRef) {
      const refName = node.componentRef.replace(/^fsds\./, "");
      const target = ctx.allContracts.get(refName);
      if (target) {
        const iconProps = iconNamePropsOf(target);
        for (const propName of iconProps) {
          const literal = literalPropValue(node, propName);
          if (literal === undefined) continue;
          checkIconName(literal, `${pointer}/attrs/${propName}`, issues, () =>
            `supplies icon name "${literal}" to ${refName}.${propName}, ` +
            `which is not in the icon corpus ` +
            `(packages/ds-iconography/icons/). Author the icon or fix the name.`,
          );
        }
      }
    }
    (node.children ?? []).forEach((child, i) =>
      walk(child, `${pointer}/children/${i}`),
    );
  };
  walk(dom, "/anatomy/dom");
  return issues;
}

/**
 * Validate a literal icon name supplied in a usage sidecar tree. Called by
 * the usage cross-ref pass; returns an issue message or null when valid.
 */
export function usageIconRefIssue(
  targetContract: ComponentContract,
  propName: string,
  value: unknown,
): string | null {
  if (typeof value !== "string") return null;
  if (!iconNamePropsOf(targetContract).has(propName)) return null;
  const known = loadKnownIconNames();
  if (known === "missing") {
    return (
      `icon corpus not found (packages/ds-iconography/icons/) — cannot ` +
      `verify icon name "${value}"`
    );
  }
  if (known.has(value)) return null;
  return (
    `icon name "${value}" is not in the icon corpus ` +
    `(packages/ds-iconography/icons/). Author the icon or fix the name.`
  );
}

/** Static-attr or `literal:` binding value for a prop on a componentRef node. */
function literalPropValue(
  node: ContractDomNode,
  propName: string,
): string | undefined {
  const attr = node.attrs?.[propName];
  if (typeof attr === "string") return attr;
  const binding = node.bindings?.[propName];
  if (typeof binding === "string" && binding.startsWith("literal:")) {
    return binding.slice("literal:".length);
  }
  return undefined;
}

function checkIconName(
  name: string,
  pointer: string,
  issues: ValidationIssue[],
  message: () => string,
): void {
  const known = loadKnownIconNames();
  if (known === "missing") {
    issues.push({
      pointer,
      message:
        "icon corpus not found (packages/ds-iconography/icons/) — cannot " +
        `verify icon name "${name}".`,
    });
    return;
  }
  if (!known.has(name)) {
    issues.push({ pointer, message: message() });
  }
}

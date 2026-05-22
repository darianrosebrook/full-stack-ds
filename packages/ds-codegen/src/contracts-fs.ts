/**
 * Filesystem layout of the ds-contracts package.
 *
 * Component contracts live at `<root>/components/<Name>/<Name>.contract.json`.
 * Primitive contracts live at `<root>/primitives/<Name>.primitive.json`.
 *
 * Centralizing the layout means new sidecar artifacts (tokens, usage, …)
 * land in one obvious place when they're added.
 */
import fs from "node:fs";
import path from "node:path";

export interface DiscoveredContract {
  /** Component name, e.g. "Button". Derived from the folder name. */
  name: string;
  /** Bare filename, e.g. "Button.contract.json". Useful for log lines. */
  filename: string;
  /** Path relative to the contracts root, e.g. "components/Button/Button.contract.json". */
  relPath: string;
  /** Absolute filesystem path. */
  absPath: string;
}

export function componentsDir(contractsRoot: string): string {
  return path.join(contractsRoot, "components");
}

/**
 * Walk `<root>/components/*` and return one entry per `<Name>.contract.json` found.
 * Returns entries sorted by component name for deterministic ordering.
 */
export function listComponentContracts(contractsRoot: string): DiscoveredContract[] {
  const dir = componentsDir(contractsRoot);
  if (!fs.existsSync(dir)) return [];

  const result: DiscoveredContract[] = [];
  for (const name of fs.readdirSync(dir)) {
    const folder = path.join(dir, name);
    if (!fs.statSync(folder).isDirectory()) continue;
    const filename = `${name}.contract.json`;
    const absPath = path.join(folder, filename);
    if (!fs.existsSync(absPath)) continue;
    result.push({
      name,
      filename,
      relPath: path.join("components", name, filename),
      absPath,
    });
  }
  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

export interface DiscoveredTokens {
  /** Bare filename, e.g. "Button.tokens.json". */
  filename: string;
  /** Path relative to the contracts root. */
  relPath: string;
  /** Absolute filesystem path. */
  absPath: string;
}

/**
 * Locate the tokens sidecar (`<Name>.tokens.json`) that sits next to a
 * component contract. Returns `null` when no sidecar exists — that is a
 * supported state, NOT an error: it means the component has zero tokens.
 *
 * Why no warning / no fail when missing:
 *   - The contract schema forbids inline `tokens`, so the sidecar is the
 *     only place tokens can live. Absent sidecar = empty token set.
 *   - Components without themable surface (e.g. pure layout primitives)
 *     legitimately have no tokens. A warning would be noise.
 *   - Downstream IR/CSS code already treats an empty token map as a no-op.
 *
 * If a "completeness lint" is ever wanted (contract has anatomy parts but
 * no sidecar → suspicious), add it as a separate `--check-semantics` rule.
 * Do NOT bolt it onto this loader.
 */
export function findComponentTokens(contract: DiscoveredContract): DiscoveredTokens | null {
  const folder = path.dirname(contract.absPath);
  const filename = `${contract.name}.tokens.json`;
  const absPath = path.join(folder, filename);
  if (!fs.existsSync(absPath)) return null;
  return {
    filename,
    relPath: path.join(path.dirname(contract.relPath), filename),
    absPath,
  };
}

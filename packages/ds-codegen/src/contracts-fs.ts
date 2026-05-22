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

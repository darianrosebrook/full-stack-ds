/**
 * Barrel file generator for the `@full-stack-ds/svelte` package.
 *
 * Svelte SFCs are imported with explicit `.svelte` suffixes. Compound
 * parts live alongside their parent SFC in the same component directory;
 * the barrel scans for them and emits explicit named exports.
 */
import fs from "node:fs";
import path from "node:path";

export function generateSvelteBarrel(
  componentNames: string[],
  componentsRoot?: string,
): string {
  const lines: string[] = [];
  for (const name of [...componentNames].sort()) {
    lines.push(
      `export { default as ${name} } from "./${name}/${name}.svelte";`,
    );

    if (!componentsRoot) continue;
    const dir = path.join(componentsRoot, name);
    if (!fs.existsSync(dir)) continue;
    const partFiles = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".svelte") && f !== `${name}.svelte`)
      .sort();
    for (const f of partFiles) {
      const partName = f.replace(/\.svelte$/, "");
      lines.push(
        `export { default as ${partName} } from "./${name}/${partName}.svelte";`,
      );
    }
  }
  return lines.join("\n") + "\n";
}

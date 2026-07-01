/**
 * Barrel file generator for the `@full-stack-ds/vue` package.
 *
 * Vue SFCs are imported with explicit `.vue` suffixes (Vite convention).
 * Compound parts (e.g. `ModalHeader.vue`, `ModalBody.vue`) live alongside
 * their parent SFC; this generator scans each component directory for any
 * additional `.vue` files and emits explicit named exports for them so
 * `import { Modal, ModalHeader } from "@full-stack-ds/vue"` resolves.
 */
import fs from "node:fs";
import path from "node:path";

export function generateVueBarrel(
  componentNames: string[],
  componentsRoot?: string,
): string {
  const lines: string[] = [];
  for (const name of [...componentNames].sort()) {
    lines.push(`import "./${name}/${name}.css";`);
    lines.push(`export { default as ${name} } from "./${name}/${name}.vue";`);

    if (!componentsRoot) continue;
    const dir = path.join(componentsRoot, name);
    if (!fs.existsSync(dir)) continue;
    const partFiles = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".vue") && f !== `${name}.vue`)
      .sort();
    for (const f of partFiles) {
      const partName = f.replace(/\.vue$/, "");
      lines.push(
        `export { default as ${partName} } from "./${name}/${partName}.vue";`,
      );
    }
  }
  return lines.join("\n") + "\n";
}

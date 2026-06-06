// Build the FSDS Style Spike dev plugin: dist/style-spike.js (plugin main) +
// dist/manifest-style-spike.json (dev manifest). The user imports the manifest
// via Plugins -> Development -> Import plugin from manifest, then runs it; the
// plugin executes inside the native sandbox and serializes evidence (shared
// plugin data + console). This is the durable replacement for relying on a
// transient window.figma leak in the editor page.
import { build } from "esbuild";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const pkg = resolve(here, "..");

// NodeNext ".js" specifiers point at ".ts" sources; map them for esbuild.
const tsResolve = {
  name: "ts-resolve",
  setup(b) {
    b.onResolve({ filter: /\.js$/ }, (args) => {
      if (!args.importer) return null;
      const tsPath = resolve(dirname(args.importer), args.path.replace(/\.js$/, ".ts"));
      return existsSync(tsPath) ? { path: tsPath } : null;
    });
  },
};

async function bundle(entry, platform) {
  const out = await build({
    entryPoints: [entry],
    bundle: true,
    format: "iife",
    platform,
    write: false,
    loader: { ".json": "json" },
    plugins: [tsResolve],
    logLevel: "warning",
  });
  return out.outputFiles[0].text;
}

// 1. Compute the resolver's Checkbox.indicator bindings (node).
const bindingsCode = await bundle(resolve(here, "compute-spike-bindings.ts"), "neutral");
new Function(bindingsCode)();
const bindings = globalThis.__fsdsStyleSpikeBindings;
if (!Array.isArray(bindings) || bindings.length === 0) {
  throw new Error(`expected >=1 Checkbox.indicator binding, got ${JSON.stringify(bindings)}`);
}

// 2. Bundle the plugin main (browser/sandbox platform).
const entryCode = await bundle(resolve(here, "style-spike-entry.ts"), "browser");

// 3. Prepend the embedded bindings so the entry stays data-free.
const main = `globalThis.__fsdsStyleSpikeBindings = ${JSON.stringify(bindings)};\n${entryCode}`;

const dist = resolve(pkg, "dist");
mkdirSync(dist, { recursive: true });
writeFileSync(resolve(dist, "style-spike.js"), main);

const manifest = {
  name: "FSDS Style Spike",
  id: "fsds-style-spike-dev",
  api: "1.0.0",
  main: "style-spike.js",
  editorType: ["figma"],
};
writeFileSync(resolve(dist, "manifest-style-spike.json"), JSON.stringify(manifest, null, 2));

console.log(
  `spike main ${main.length}B | indicator bindings ${bindings.length} | ` +
    `wrote dist/style-spike.js + dist/manifest-style-spike.json`,
);
for (const b of bindings) {
  const r = b.result.tokenPath ? `${b.result.tokenPath}` : `RESIDUAL(${b.result.residual})`;
  console.log(`  ${b.selector}  ${b.property} -> ${r}`);
}

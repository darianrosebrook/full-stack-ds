/**
 * Bundle-size probe for the two icon consumption paths
 * (ICON-CATALOG-RUNTIME-DELIVERY-01, acceptance A4).
 *
 *   static  — `import { circle }` (one named export). Tree-shaking should
 *             drop every other glyph AND the `icons` catalog object.
 *   dynamic — `import { icons, resolveIcon }` with a runtime-only name
 *             (the generated <Icon name={...}> component's shape). The
 *             whole catalog rides into the bundle.
 *
 * Prints minified bundle bytes for both paths, the delta, and a per-icon
 * average so the catalog-growth cost of the dynamic path stays measured,
 * not assumed. Run: node build/bundle-probe.mjs
 */
import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const ENTRIES = {
  static: `
    import { circle } from "./index.mjs";
    console.log(circle.sizes["16"].viewBox);
  `,
  dynamic: `
    import { icons, resolveIcon } from "./index.mjs";
    const name = globalThis.__iconName ?? "circle";
    const glyph = resolveIcon(name, 16);
    console.log(glyph?.viewBox, Object.keys(icons).length);
  `,
};

async function bundleBytes(contents) {
  const result = await build({
    stdin: { contents, resolveDir: packageRoot, sourcefile: "probe-entry.mjs" },
    bundle: true,
    minify: true,
    format: "esm",
    write: false,
    logLevel: "silent",
  });
  return result.outputFiles[0].contents.byteLength;
}

const { icons } = await import(path.join(packageRoot, "index.mjs"));
const iconCount = Object.keys(icons).length;

const staticBytes = await bundleBytes(ENTRIES.static);
const dynamicBytes = await bundleBytes(ENTRIES.dynamic);
const delta = dynamicBytes - staticBytes;

console.log(`icon corpus size:            ${iconCount} icon(s)`);
console.log(`static (one named export):   ${staticBytes} bytes minified`);
console.log(`dynamic (catalog + resolve): ${dynamicBytes} bytes minified`);
console.log(`dynamic overhead:            ${delta} bytes (${(delta / iconCount).toFixed(1)} bytes/icon avg)`);
console.log(
  `projection @ 300 icons:      ~${Math.round((delta / iconCount) * 300 / 1024)} KiB minified catalog cost`,
);

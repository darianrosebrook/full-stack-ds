// Build the injectable live-run bundle for chrome-devtools evaluate_script.
// Produces /tmp/fsds-live-inject.js: an IIFE that exposes
// globalThis.runFsdsLiveMaterialization plus globalThis.__fsdsPlans (the 6 real
// plans computed by the actual planner).
import { build } from "esbuild";
import { writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "..", "src");

// The repo uses ".js" import specifiers for ".ts" files (NodeNext). Map them.
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

// 1. The runner (exposes globalThis.runFsdsLiveMaterialization).
const runnerCode = await bundle(resolve(src, "live-run.ts"), "browser");

// 2. Compute the 6 plans by bundling + evaluating compute-plans.ts in node.
const plansCode = await bundle(resolve(here, "compute-plans.ts"), "neutral");
new Function(plansCode)();
const plans = globalThis.__fsdsPlans;
if (!Array.isArray(plans) || plans.length !== 6) {
  throw new Error(`expected 6 plans, got ${JSON.stringify(plans)?.slice(0, 80)}`);
}

const inject = `${runnerCode}\n;globalThis.__fsdsPlans = ${JSON.stringify(plans)};`;
writeFileSync("/tmp/fsds-live-inject.js", inject);
console.log(
  `runner ${runnerCode.length}B | plans ${JSON.stringify(plans).length}B | inject ${inject.length}B`,
);
console.log(`components: ${plans.map((p) => p.component).join(", ")}`);

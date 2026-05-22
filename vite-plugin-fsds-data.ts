import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import type {
  ComponentBundle,
  ComponentContract,
  ComponentSources,
  Framework,
  PrimitiveBundle,
  SourceFile,
} from "./src/types/data";

const FRAMEWORKS: Framework[] = ["react", "vue", "svelte", "angular", "lit"];

const FRAMEWORK_FILE_PATTERNS: Record<Framework, (name: string) => string[]> = {
  react: (n) => [`${n}.tsx`, `use${n}.ts`],
  vue: (n) => [`${n}.vue`],
  svelte: (n) => [`${n}.svelte`],
  angular: (n) => [`${n}.component.ts`],
  lit: (n) => [`${n}.ts`],
};

const PRIMITIVE_FILES: Record<Framework, string[]> = {
  react: ["stack.tsx", "stack.css", "index.ts"],
  vue: ["Stack.vue", "index.ts"],
  svelte: ["Stack.svelte", "index.ts"],
  angular: ["Stack.component.ts", "index.ts"],
  lit: ["Stack.ts", "index.ts"],
};

const VIRTUAL_ID = "virtual:fsds/data";
const RESOLVED_ID = "\0" + VIRTUAL_ID;

// Local alias kept for readability — the public type's ComponentSources is
// the same shape as the historical ComponentSourceSlot.
type ComponentSourceSlot = ComponentSources;

async function safeRead(p: string): Promise<string | null> {
  try {
    return await readFile(p, "utf8");
  } catch {
    return null;
  }
}

async function tryFile(dir: string, name: string): Promise<SourceFile | undefined> {
  const full = path.join(dir, name);
  const code = await safeRead(full);
  if (code === null) return undefined;
  return { filename: name, code };
}

// Sibling-file extensions we expect to find inside a component directory.
// Compound-part SFCs, behavior hooks, and the root component all match one of
// these. Tests and CSS are excluded — CSS is gathered separately, tests aren't
// needed in the preview iframe.
const SIBLING_EXTS = new Set([".ts", ".tsx", ".vue", ".svelte"]);

/**
 * Heuristic: which file is the *root* component for this framework?
 * The bundle plugin already knows the canonical root pattern per framework
 * (FRAMEWORK_FILE_PATTERNS[fw](name)[0]). We match against that.
 */
function isRootComponentFilename(framework: Framework, componentName: string, filename: string): boolean {
  const patterns = FRAMEWORK_FILE_PATTERNS[framework](componentName);
  return filename === patterns[0];
}

/**
 * Heuristic: is this filename a behavior hook?
 * - React/Vue: `use<Name>.ts`
 * - Svelte: `use<Name>.svelte.ts`
 * - Angular: `use<Name>.ts`
 * - Lit: `<Name>Behavior.ts`
 */
function isHookFilename(componentName: string, filename: string): boolean {
  return (
    filename === `use${componentName}.ts` ||
    filename === `use${componentName}.svelte.ts` ||
    filename === `${componentName}Behavior.ts`
  );
}

async function gatherComponentSources(rootDir: string, componentName: string): Promise<ComponentBundle["sources"]> {
  const sources: ComponentBundle["sources"] = {};
  for (const fw of FRAMEWORKS) {
    const compDir = path.join(rootDir, "packages", `ds-${fw}`, "src", "components", componentName);
    if (!existsSync(compDir)) continue;

    const entries = await readdir(compDir, { withFileTypes: true });
    const slot: ComponentSourceSlot = { siblings: [] };

    for (const entry of entries) {
      if (entry.isDirectory()) continue;
      const filename = entry.name;
      if (filename.endsWith(".css")) {
        // Inline the .tokens.css sibling into <Component>.css so the
        // preview iframe sees both halves of the two-hop indirection
        // (TOKENS-WORKSTREAM-STEP-06A-III). The .css file has an
        // `@import "./<Component>.tokens.css";` line at the top; the
        // iframe inlines CSS text without a base URL, so that import
        // would fail. Resolving it here gives the iframe a single
        // self-contained stylesheet.
        if (filename === `${componentName}.css`) {
          const file = await tryFile(compDir, filename);
          if (file) {
            const tokens = await tryFile(compDir, `${componentName}.tokens.css`);
            if (tokens) {
              slot.css = {
                ...file,
                code: `${tokens.code}\n${file.code.replace(
                  new RegExp(`@import\\s+["']\\./${componentName}\\.tokens\\.css["'];?\\s*\\n?`),
                  "",
                )}`,
              };
            } else {
              slot.css = file;
            }
          }
        }
        continue;
      }
      // Skip test files and .test.ts/.spec.ts even if they live at the dir root.
      if (filename.endsWith(".test.ts") || filename.endsWith(".spec.ts")) continue;
      const ext = path.extname(filename);
      if (!SIBLING_EXTS.has(ext)) continue;

      const file = await tryFile(compDir, filename);
      if (!file) continue;
      slot.siblings.push(file);
      if (isRootComponentFilename(fw, componentName, filename)) {
        slot.component = file;
      } else if (isHookFilename(componentName, filename)) {
        slot.hook = file;
      }
    }

    // Stable sort by filename so consumers (and snapshots) see a deterministic
    // order regardless of underlying fs.readdir ordering.
    slot.siblings.sort((a, b) => a.filename.localeCompare(b.filename));

    if (slot.component || slot.css || slot.siblings.length > 0) {
      sources[fw] = slot;
    }
  }
  return sources;
}

async function gatherPrimitiveSources(rootDir: string): Promise<PrimitiveBundle["sources"]> {
  const sources: PrimitiveBundle["sources"] = {};
  for (const fw of FRAMEWORKS) {
    const dir = path.join(rootDir, "packages", `ds-${fw}`, "src", "primitives");
    if (!existsSync(dir)) continue;
    const files: SourceFile[] = [];
    for (const f of PRIMITIVE_FILES[fw]) {
      const sf = await tryFile(dir, f);
      if (sf) files.push(sf);
    }
    if (files.length > 0) sources[fw] = files;
  }
  return sources;
}

function inferLayerOrder(layer: string): number {
  switch (layer) {
    case "primitive":
      return 0;
    case "compound":
      return 1;
    case "composer":
      return 2;
    case "assembly":
      return 3;
    default:
      return 4;
  }
}

export async function buildBundle(rootDir: string) {
  const contractsDir = path.join(rootDir, "packages", "ds-contracts");
  const contractFiles = (await readdir(contractsDir))
    .filter((f) => f.endsWith(".contract.json"))
    .sort();

  const schemaText = await safeRead(path.join(contractsDir, "component.contract.schema.json"));
  const schema = schemaText ? JSON.parse(schemaText) : null;

  // Token surface comes from @full-stack-ds/tokens now — single generated CSS
  // file with @layer core/semantic/theme/brand/density. vars.css stays under
  // ds-contracts/tokens/ because it carries scroll-driven animation primitives
  // (--cursor-*, --mouse-*) and Next.js font CSS-var bridges, not design tokens.
  const tokensDir = path.join(rootDir, "packages", "ds-tokens", "generated");
  const runtimeVarsDir = path.join(contractsDir, "tokens");
  const tokensCss = [
    await safeRead(path.join(tokensDir, "tokens.css")),
    await safeRead(path.join(runtimeVarsDir, "vars.css")),
  ]
    .filter((s): s is string => Boolean(s))
    .join("\n");

  const components: ComponentBundle[] = [];
  for (const file of contractFiles) {
    const full = path.join(contractsDir, file);
    const text = await safeRead(full);
    if (!text) continue;
    let contract: ComponentContract;
    try {
      // JSON.parse returns unknown shape; we cast to ComponentContract because
      // contracts are schema-validated upstream by codegen. The shape is the
      // contract's job to maintain — if a contract is malformed, the
      // validator catches it before this code path runs.
      contract = JSON.parse(text) as ComponentContract;
    } catch {
      continue;
    }
    const name = contract.name ?? file.replace(".contract.json", "");
    const sources = await gatherComponentSources(rootDir, name);
    components.push({
      name,
      contract,
      contractPath: path.relative(rootDir, full),
      sources,
    });
  }

  components.sort((a, b) => {
    const la = inferLayerOrder(a.contract.layer ?? "");
    const lb = inferLayerOrder(b.contract.layer ?? "");
    if (la !== lb) return la - lb;
    return a.name.localeCompare(b.name);
  });

  const stackContractPath = path.join(contractsDir, "primitives", "Stack.primitive.json");
  const stackContractText = await safeRead(stackContractPath);
  const stackContract = stackContractText ? JSON.parse(stackContractText) : null;
  const primitives: PrimitiveBundle[] = [
    {
      name: "Stack",
      contract: stackContract,
      sources: await gatherPrimitiveSources(rootDir),
    },
  ];

  return { components, primitives, schema, tokensCss, generatedAt: Date.now() };
}

export default function fsdsDataPlugin(): Plugin {
  let rootDir = process.cwd();

  return {
    name: "fsds-data",
    enforce: "pre",
    configResolved(cfg) {
      rootDir = cfg.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_ID;
      return null;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      const bundle = await buildBundle(rootDir);
      return `export default ${JSON.stringify(bundle)};\n`;
    },
    handleHotUpdate(ctx) {
      if (!/packages\/(ds-contracts|ds-react|ds-vue|ds-svelte|ds-angular|ds-lit)\//.test(ctx.file)) {
        return;
      }
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID);
      if (mod) {
        ctx.server.moduleGraph.invalidateModule(mod);
        ctx.server.ws.send({ type: "full-reload" });
      }
    },
  };
}

import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

type Framework = "react" | "vue" | "svelte" | "angular" | "lit";

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

interface SourceFile {
  filename: string;
  code: string;
}

interface ComponentBundle {
  name: string;
  contract: unknown;
  contractPath: string;
  sources: Partial<Record<Framework, { component?: SourceFile; css?: SourceFile; hook?: SourceFile }>>;
}

interface PrimitiveBundle {
  name: string;
  contract: unknown;
  sources: Partial<Record<Framework, SourceFile[]>>;
}

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

async function gatherComponentSources(rootDir: string, componentName: string): Promise<ComponentBundle["sources"]> {
  const sources: ComponentBundle["sources"] = {};
  for (const fw of FRAMEWORKS) {
    const compDir = path.join(rootDir, "packages", `ds-${fw}`, "src", "components", componentName);
    if (!existsSync(compDir)) continue;
    const patterns = FRAMEWORK_FILE_PATTERNS[fw](componentName);
    const slot: { component?: SourceFile; css?: SourceFile; hook?: SourceFile } = {};
    for (const pat of patterns) {
      const file = await tryFile(compDir, pat);
      if (!file) continue;
      if (pat.startsWith("use")) slot.hook = file;
      else slot.component = file;
    }
    const css = await tryFile(compDir, `${componentName}.css`);
    if (css) slot.css = css;
    if (Object.keys(slot).length > 0) sources[fw] = slot;
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
    case "styled":
      return 1;
    case "composite":
      return 2;
    default:
      return 3;
  }
}

async function buildBundle(rootDir: string) {
  const contractsDir = path.join(rootDir, "packages", "ds-contracts");
  const contractFiles = (await readdir(contractsDir))
    .filter((f) => f.endsWith(".contract.json"))
    .sort();

  const schemaText = await safeRead(path.join(contractsDir, "component.contract.schema.json"));
  const schema = schemaText ? JSON.parse(schemaText) : null;

  const components: ComponentBundle[] = [];
  for (const file of contractFiles) {
    const full = path.join(contractsDir, file);
    const text = await safeRead(full);
    if (!text) continue;
    let contract: any;
    try {
      contract = JSON.parse(text);
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
    const la = inferLayerOrder((a.contract as any).layer ?? "");
    const lb = inferLayerOrder((b.contract as any).layer ?? "");
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

  return { components, primitives, schema, generatedAt: Date.now() };
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

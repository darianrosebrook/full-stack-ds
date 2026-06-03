// Vite plugin: Svelte preview pipeline.
//
// Same shape as fsds-react-preview / fsds-vue-preview. Serves an HTML shell
// at /preview/svelte/<Name> and exposes a per-component virtual entry .ts
// that imports the workspace .svelte file and mounts it via Svelte 5's
// mount() API.
//
// The .svelte transform is handled by @sveltejs/vite-plugin-svelte
// (registered in vite.config.ts).

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ViteDevServer } from "vite";
import { buildBundle } from "../../../vite-plugin-fsds-data";
import { defaultPropsFromContract, childLabel, type DemoProps } from "../demos";
import type { ComponentBundle } from "../../types/data";
import {
  decodePropsParam,
  encodePropsParam,
  parsePropsFromQuery,
} from "../preview-props";

const URL_PREFIX = "/preview/svelte/";
const VIRTUAL_ID_PREFIX = "virtual:fsds-preview-svelte/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

function parseShellRequest(url: string) {
  if (!url.startsWith(URL_PREFIX)) return null;
  const afterPrefix = url.slice(URL_PREFIX.length);
  const qIndex = afterPrefix.indexOf("?");
  const tail = qIndex === -1 ? afterPrefix : afterPrefix.slice(0, qIndex);
  const query = qIndex === -1 ? "" : afterPrefix.slice(qIndex + 1);
  if (!/^[A-Z][A-Za-z0-9]*\/?$/.test(tail)) return null;
  return {
    componentName: tail.replace(/\/$/, ""),
    overrideProps: parsePropsFromQuery(query),
  };
}

function parseVirtualEntryId(id: string) {
  const clean = id.startsWith("\0") ? id.slice(1) : id;
  const decoded = (() => {
    try { return decodeURIComponent(clean); } catch { return clean; }
  })();
  if (!decoded.startsWith(VIRTUAL_ID_PREFIX)) return null;
  const tail = decoded.slice(VIRTUAL_ID_PREFIX.length);
  const qIndex = tail.indexOf("?");
  const modulePath = qIndex === -1 ? tail : tail.slice(0, qIndex);
  const propsQuery = qIndex === -1 ? "" : tail.slice(qIndex + 1);
  const match = /^([A-Z][A-Za-z0-9]*)\/entry\.ts$/.exec(modulePath);
  if (!match) return null;
  const propsParam = new URLSearchParams(propsQuery).get("props");
  return { componentName: match[1], overrideProps: decodePropsParam(propsParam) };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPropsLiteral(component: ComponentBundle, overrideProps: DemoProps): string {
  const props = { ...defaultPropsFromContract(component), ...overrideProps };
  const entries = Object.entries(props).map(([k, v]) => {
    if (v === null || v === undefined) return null;
    return `${JSON.stringify(k)}: ${JSON.stringify(v)}`;
  }).filter((s): s is string => s !== null);
  return `{ ${entries.join(", ")} }`;
}

function buildEntrySource(
  componentName: string,
  bundle: Awaited<ReturnType<typeof buildBundle>>,
  overrideProps: DemoProps,
): string {
  const component = bundle.components.find((c) => c.name === componentName);
  if (!component) {
    throw new Error(`fsds-svelte-preview: unknown component "${componentName}"`);
  }
  const absImport = `/packages/ds-svelte/src/components/${componentName}/${componentName}.svelte`;
  const child = childLabel(component);
  const propsLit = renderPropsLiteral(component, overrideProps);
  // Svelte 5's mount() takes props + an optional `children` Snippet. A plain
  // `() => "text"` is not a Snippet — Svelte's `{@render children?.()}` calls
  // it but discards the return value, so the text never lands in the DOM.
  // createRawSnippet lets us synthesize a real Snippet from an HTML string at
  // runtime without compiling a .svelte template. The render function must
  // return HTML wrapping a single element (Svelte warns otherwise via
  // invalid_raw_snippet_render), so we wrap the demo text in a <span>.
  const importLine = child
    ? `import { mount, createRawSnippet } from "svelte";`
    : `import { mount } from "svelte";`;
  const childHtml = child ? `<span>${escapeHtml(child)}</span>` : "";
  const propsArg = child
    ? `{ ...${propsLit}, children: createRawSnippet(() => ({ render: () => ${JSON.stringify(childHtml)} })) }`
    : propsLit;
  return `import Component from ${JSON.stringify(absImport)};
${importLine}

const target = document.getElementById("root");
if (!target) throw new Error("fsds-svelte-preview: #root missing from shell");
mount(Component, { target, props: ${propsArg} });
`;
}

export function sveltePreviewPlugin(): Plugin {
  let cachedBundle: Awaited<ReturnType<typeof buildBundle>> | null = null;

  async function getBundle() {
    if (cachedBundle) return cachedBundle;
    cachedBundle = await buildBundle(REPO_ROOT);
    return cachedBundle;
  }

  function invalidateBundle() { cachedBundle = null; }

  return {
    name: "fsds-svelte-preview",

    resolveId(id) {
      if (parseVirtualEntryId(id)) return id;
      return null;
    },

    async load(id) {
      const parsed = parseVirtualEntryId(id);
      if (!parsed) return null;
      const bundle = await getBundle();
      return buildEntrySource(parsed.componentName, bundle, parsed.overrideProps);
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const parsed = req.url ? parseShellRequest(req.url) : null;
        if (!parsed) return next();
        try {
          const bundle = await getBundle();
          const component = bundle.components.find((c) => c.name === parsed.componentName);
          if (!component) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end(`fsds-svelte-preview: unknown component "${parsed.componentName}"`);
            return;
          }
          const { buildCommonPreviewShellHtml } = await import("../preview-shell-common");
          const propsParam = encodePropsParam(parsed.overrideProps);
          const entryId = propsParam
            ? `${VIRTUAL_ID_PREFIX}${parsed.componentName}/entry.ts?props=${propsParam}`
            : `${VIRTUAL_ID_PREFIX}${parsed.componentName}/entry.ts`;
          const html = buildCommonPreviewShellHtml({
            componentName: parsed.componentName,
            framework: "svelte",
            componentCss: component.sources.svelte?.css?.code,
            tokensCss: bundle.tokensCss,
            entryId,
          });
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(html);
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end(`fsds-svelte-preview error: ${(e as Error).message}`);
        }
      });
    },

    handleHotUpdate(ctx) {
      if (/packages\/(ds-contracts|ds-svelte)\//.test(ctx.file)) {
        invalidateBundle();
      }
    },
  };
}

export function sveltePreviewUrlPrefix(): string { return URL_PREFIX; }
export function sveltePreviewVirtualIdPrefix(): string { return VIRTUAL_ID_PREFIX; }

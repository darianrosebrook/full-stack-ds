// Vite plugin: Vue preview pipeline.
//
// Mirrors src/runtime/react-preview/vite-plugin.ts. Serves an HTML shell at
// /preview/vue/<Name> and exposes a per-component virtual entry .ts module
// that imports the real workspace .vue SFC and mounts it with createApp+h().
//
// The .vue SFC transform is handled by @vitejs/plugin-vue (already registered
// in vite.config.ts) — it sees the workspace path as a normal Vue module and
// transforms it like any other.

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ViteDevServer } from "vite";
import { buildBundle } from "../../../vite-plugin-fsds-data";
import { defaultPropsFromContract, childLabel } from "../demos";
import type { ComponentBundle } from "../../types/data";

// URL prefix inlined as a literal (same Vite-config-loader pitfall as the
// Angular + React plugins). Constants module is the source of truth for
// browser-graph consumers; this literal must stay in sync. The regression
// test in ./vite-plugin.test.ts asserts the match.
const URL_PREFIX = "/preview/vue/";
const VIRTUAL_ID_PREFIX = "virtual:fsds-preview-vue/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, "..", "..", "..");

interface ParsedShellRequest {
  componentName: string;
}

interface ParsedVirtualEntryId {
  componentName: string;
}

function parseShellRequest(url: string): ParsedShellRequest | null {
  if (!url.startsWith(URL_PREFIX)) return null;
  const tail = url.slice(URL_PREFIX.length).split("?")[0];
  if (!/^[A-Z][A-Za-z0-9]*\/?$/.test(tail)) return null;
  return { componentName: tail.replace(/\/$/, "") };
}

function parseVirtualEntryId(id: string): ParsedVirtualEntryId | null {
  const clean = id.startsWith("\0") ? id.slice(1) : id;
  const decoded = (() => {
    try { return decodeURIComponent(clean); } catch { return clean; }
  })();
  if (!decoded.startsWith(VIRTUAL_ID_PREFIX)) return null;
  const tail = decoded.slice(VIRTUAL_ID_PREFIX.length);
  // .ts suffix: Vite needs a known extension to dispatch transforms. Plain TS
  // is enough — the workspace .vue import inside the entry will trigger
  // plugin-vue separately on that file.
  const match = /^([A-Z][A-Za-z0-9]*)\/entry\.ts$/.exec(tail);
  if (!match) return null;
  return { componentName: match[1] };
}

/**
 * Render a JS object literal source from the contract's default props. Strings
 * are JSON-quoted, booleans + numbers pass through. Used inline in the entry's
 * h() call.
 */
function renderPropsLiteral(component: ComponentBundle): string {
  const props = defaultPropsFromContract(component);
  const entries = Object.entries(props).map(([k, v]) => {
    if (v === null || v === undefined) return null;
    if (typeof v === "string") return `${JSON.stringify(k)}: ${JSON.stringify(v)}`;
    if (typeof v === "boolean" || typeof v === "number") return `${JSON.stringify(k)}: ${JSON.stringify(v)}`;
    return `${JSON.stringify(k)}: ${JSON.stringify(v)}`;
  }).filter((s): s is string => s !== null);
  return `{ ${entries.join(", ")} }`;
}

/**
 * Build the per-component entry source. Imports the workspace .vue SFC at
 * its absolute Vite-served path, then mounts it via createApp(h(...)).
 */
function buildEntrySource(componentName: string, bundle: Awaited<ReturnType<typeof buildBundle>>): string {
  const component = bundle.components.find((c) => c.name === componentName);
  if (!component) {
    throw new Error(`fsds-vue-preview: unknown component "${componentName}"`);
  }
  const absImport = `/packages/ds-vue/src/components/${componentName}/${componentName}.vue`;
  const child = childLabel(component);
  const propsLit = renderPropsLiteral(component);
  // h(Component, props, slot) — the third arg becomes default slot content.
  // When child is empty we omit it so void-rendering SFCs aren't given text.
  const renderArg = child
    ? `h(Component, ${propsLit}, () => ${JSON.stringify(child)})`
    : `h(Component, ${propsLit})`;
  return `import { createApp, h } from "vue";
import Component from ${JSON.stringify(absImport)};

createApp({ render: () => ${renderArg} }).mount("#root");
`;
}

export function vuePreviewPlugin(): Plugin {
  let cachedBundle: Awaited<ReturnType<typeof buildBundle>> | null = null;

  async function getBundle() {
    if (cachedBundle) return cachedBundle;
    cachedBundle = await buildBundle(REPO_ROOT);
    return cachedBundle;
  }

  function invalidateBundle() {
    cachedBundle = null;
  }

  return {
    name: "fsds-vue-preview",

    resolveId(id) {
      if (parseVirtualEntryId(id)) return id;
      return null;
    },

    async load(id) {
      const parsed = parseVirtualEntryId(id);
      if (!parsed) return null;
      const bundle = await getBundle();
      return buildEntrySource(parsed.componentName, bundle);
    },

    configureServer(_server: ViteDevServer) {
      _server.middlewares.use(async (req, res, next) => {
        const parsed = req.url ? parseShellRequest(req.url) : null;
        if (!parsed) return next();
        try {
          const bundle = await getBundle();
          const component = bundle.components.find((c) => c.name === parsed.componentName);
          if (!component) {
            res.statusCode = 404;
            res.setHeader("Content-Type", "text/plain");
            res.end(`fsds-vue-preview: unknown component "${parsed.componentName}"`);
            return;
          }
          const { buildCommonPreviewShellHtml } = await import("../preview-shell-common");
          const html = buildCommonPreviewShellHtml({
            componentName: parsed.componentName,
            framework: "vue",
            componentCss: component.sources.vue?.css?.code,
            tokensCss: bundle.tokensCss,
            entryId: `${VIRTUAL_ID_PREFIX}${parsed.componentName}/entry.ts`,
          });
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/html; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(html);
        } catch (e) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end(`fsds-vue-preview error: ${(e as Error).message}`);
        }
      });
    },

    handleHotUpdate(ctx) {
      if (/packages\/(ds-contracts|ds-vue)\//.test(ctx.file)) {
        invalidateBundle();
      }
    },
  };
}

export function vuePreviewUrlPrefix(): string { return URL_PREFIX; }
export function vuePreviewVirtualIdPrefix(): string { return VIRTUAL_ID_PREFIX; }

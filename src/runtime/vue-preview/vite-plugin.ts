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
import { defaultPropsFromContract, childLabel, type DemoProps } from "../demos";
import type { ComponentBundle } from "../../types/data";
import {
  decodePropsParam,
  encodePropsParam,
  parsePropsFromQuery,
} from "../preview-props";

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
  overrideProps: DemoProps;
}

interface ParsedVirtualEntryId {
  componentName: string;
  overrideProps: DemoProps;
}

function parseShellRequest(url: string): ParsedShellRequest | null {
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

function parseVirtualEntryId(id: string): ParsedVirtualEntryId | null {
  const clean = id.startsWith("\0") ? id.slice(1) : id;
  const decoded = (() => {
    try { return decodeURIComponent(clean); } catch { return clean; }
  })();
  if (!decoded.startsWith(VIRTUAL_ID_PREFIX)) return null;
  const tail = decoded.slice(VIRTUAL_ID_PREFIX.length);
  const qIndex = tail.indexOf("?");
  const modulePath = qIndex === -1 ? tail : tail.slice(0, qIndex);
  const propsQuery = qIndex === -1 ? "" : tail.slice(qIndex + 1);
  // .ts suffix: Vite needs a known extension to dispatch transforms. Plain TS
  // is enough — the workspace .vue import inside the entry will trigger
  // plugin-vue separately on that file.
  const match = /^([A-Z][A-Za-z0-9]*)\/entry\.ts$/.exec(modulePath);
  if (!match) return null;
  const propsParam = new URLSearchParams(propsQuery).get("props");
  return { componentName: match[1], overrideProps: decodePropsParam(propsParam) };
}

/**
 * Render a JS object literal source from the contract's default props. Strings
 * are JSON-quoted, booleans + numbers pass through. Used inline in the entry's
 * h() call.
 */
function renderPropsLiteral(component: ComponentBundle, overrideProps: DemoProps): string {
  const props = { ...defaultPropsFromContract(component), ...overrideProps };
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
function buildEntrySource(
  componentName: string,
  bundle: Awaited<ReturnType<typeof buildBundle>>,
  overrideProps: DemoProps,
): string {
  const component = bundle.components.find((c) => c.name === componentName);
  if (!component) {
    throw new Error(`fsds-vue-preview: unknown component "${componentName}"`);
  }
  const absImport = `/packages/ds-vue/src/components/${componentName}/${componentName}.vue`;
  const child = childLabel(component);
  const propsLit = renderPropsLiteral(component, overrideProps);
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
      return buildEntrySource(parsed.componentName, bundle, parsed.overrideProps);
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
          const propsParam = encodePropsParam(parsed.overrideProps);
          const entryId = propsParam
            ? `${VIRTUAL_ID_PREFIX}${parsed.componentName}/entry.ts?props=${propsParam}`
            : `${VIRTUAL_ID_PREFIX}${parsed.componentName}/entry.ts`;
          const html = buildCommonPreviewShellHtml({
            componentName: parsed.componentName,
            framework: "vue",
            componentCss: component.sources.vue?.css?.code,
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

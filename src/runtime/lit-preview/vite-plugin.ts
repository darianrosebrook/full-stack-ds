// Vite plugin: Lit preview pipeline.
//
// Lit components self-register as custom elements (via @customElement /
// customElements.define). So the entry just needs to import the component
// module — that triggers registration — and then inject the element tag
// into #root. No SFC plugin needed; the TS + decorators are handled by
// Vite's built-in TS pipeline.

import * as path from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin, ViteDevServer } from "vite";
import { buildBundle } from "../../../vite-plugin-fsds-data";
import { defaultPropsFromContract, childLabel, elementTag, type DemoProps } from "../demos";
import type { ComponentBundle } from "../../types/data";
import {
  decodePropsParam,
  encodePropsParam,
  parsePropsFromQuery,
} from "../preview-props";

const URL_PREFIX = "/preview/lit/";
const VIRTUAL_ID_PREFIX = "virtual:fsds-preview-lit/";

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

function renderHtmlAttrs(component: ComponentBundle, overrideProps: DemoProps): string {
  const props = { ...defaultPropsFromContract(component), ...overrideProps };
  return Object.entries(props)
    .map(([k, v]) => {
      if (v === null || v === undefined) return "";
      if (typeof v === "boolean") return v ? ` ${k}` : "";
      const s = String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      return ` ${k}="${s}"`;
    })
    .join("");
}

function buildEntrySource(
  componentName: string,
  bundle: Awaited<ReturnType<typeof buildBundle>>,
  overrideProps: DemoProps,
): string {
  const component = bundle.components.find((c) => c.name === componentName);
  if (!component) {
    throw new Error(`fsds-lit-preview: unknown component "${componentName}"`);
  }
  // Import the workspace component module — side effect: customElement
  // registration. Use absolute Vite-served path so siblings (Behavior file,
  // primitives) resolve through the normal graph.
  const absImport = `/packages/ds-lit/src/components/${componentName}/${componentName}.ts`;
  const tag = elementTag(component, "lit");
  const attrs = renderHtmlAttrs(component, overrideProps);
  const child = childLabel(component);
  const inner = child.replace(/</g, "&lt;").replace(/&/g, "&amp;");
  // For Lit, we inject the custom-element tag literally. The component's
  // shadow root + render() produce the rest. Innerhtml is fine for the demo
  // payload since `child` is just the component's name string.
  return `import ${JSON.stringify(absImport)};

const root = document.getElementById("root");
if (!root) throw new Error("fsds-lit-preview: #root missing from shell");
root.innerHTML = ${JSON.stringify(`<${tag}${attrs}>${inner}</${tag}>`)};
`;
}

export function litPreviewPlugin(): Plugin {
  let cachedBundle: Awaited<ReturnType<typeof buildBundle>> | null = null;

  async function getBundle() {
    if (cachedBundle) return cachedBundle;
    cachedBundle = await buildBundle(REPO_ROOT);
    return cachedBundle;
  }

  function invalidateBundle() { cachedBundle = null; }

  return {
    name: "fsds-lit-preview",

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
            res.end(`fsds-lit-preview: unknown component "${parsed.componentName}"`);
            return;
          }
          const { buildCommonPreviewShellHtml } = await import("../preview-shell-common");
          const propsParam = encodePropsParam(parsed.overrideProps);
          const entryId = propsParam
            ? `${VIRTUAL_ID_PREFIX}${parsed.componentName}/entry.ts?props=${propsParam}`
            : `${VIRTUAL_ID_PREFIX}${parsed.componentName}/entry.ts`;
          const html = buildCommonPreviewShellHtml({
            componentName: parsed.componentName,
            framework: "lit",
            componentCss: component.sources.lit?.css?.code,
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
          res.end(`fsds-lit-preview error: ${(e as Error).message}`);
        }
      });
    },

    handleHotUpdate(ctx) {
      if (/packages\/(ds-contracts|ds-lit)\//.test(ctx.file)) {
        invalidateBundle();
      }
    },
  };
}

export function litPreviewUrlPrefix(): string { return URL_PREFIX; }
export function litPreviewVirtualIdPrefix(): string { return VIRTUAL_ID_PREFIX; }

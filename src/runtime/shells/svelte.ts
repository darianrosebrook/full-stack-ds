import { rewriteSvelteSource } from "../rewriteImports";
import { jsLiteral } from "./encode";

interface SvelteShellInput {
  componentName: string;
  componentSource: string;
  css?: string;
  demo: string;
}

const SVELTE_COMPILER = "https://esm.sh/svelte@5.0/compiler";
const SVELTE_INTERNAL_CLIENT = "https://esm.sh/svelte@5.0/internal/client";

/**
 * Svelte 5 compiled in-iframe via svelte/compiler's ESM build. Svelte 5 emits
 * to its internal-client runtime, which esm.sh serves.
 */
export function buildSvelteShell({
  componentName,
  componentSource,
  css,
  demo,
}: SvelteShellInput): string {
  const rewritten = rewriteSvelteSource(componentSource);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; font-family: ui-sans-serif, system-ui, sans-serif; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
  #root { display: contents; }
  #__fsds_err { position: fixed; inset: 12px; padding: 12px; background: #fee; color: #900; font-family: ui-monospace, monospace; font-size: 12px; border: 1px solid #fbb; border-radius: 6px; white-space: pre-wrap; overflow: auto; display: none; }
</style>
${css ? `<style data-fsds="component-css">${css.replace(/<\/style>/g, "<\\/style>")}</style>` : ""}
<script type="importmap">
{
  "imports": {
    "svelte": "https://esm.sh/svelte@5.0",
    "svelte/internal/client": "${SVELTE_INTERNAL_CLIENT}",
    "svelte/internal/disclose-version": "https://esm.sh/svelte@5.0/internal/disclose-version"
  }
}
</script>
</head>
<body>
<div id="root"></div>
<div id="__fsds_err"></div>
<script type="module">
const errEl = document.getElementById("__fsds_err");
function showError(msg) {
  errEl.textContent = String(msg);
  errEl.style.display = "block";
  try { parent.postMessage({ type: "fsds:error", message: String(msg) }, "*"); } catch (e) {}
}
window.addEventListener("error", (e) => showError(e.error?.stack || e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason?.stack || e.reason));

try {
  const { compile } = await import("${SVELTE_COMPILER}");
  const compName = ${JSON.stringify(componentName)};
  const componentSource = ${jsLiteral(rewritten)};
  // Compile component
  const compRes = compile(componentSource, {
    filename: compName + ".svelte",
    generate: "client",
    dev: false,
    css: "external",
  });
  const compBlob = URL.createObjectURL(new Blob([compRes.js.code], { type: "text/javascript" }));
  const demoRes = compile(${jsLiteral(demo)}, {
    filename: "Demo.svelte",
    generate: "client",
    dev: false,
    css: "external",
  });
  // Rewrite component import path to blob URL.
  const demoCode = demoRes.js.code.replace(
    new RegExp("from\\\\s+[\\"']\\\\./" + compName + "\\\\.svelte[\\"']", "g"),
    "from " + JSON.stringify(compBlob)
  );
  const demoBlob = URL.createObjectURL(new Blob([demoCode], { type: "text/javascript" }));
  const [{ mount }, demoMod] = await Promise.all([
    import("svelte"),
    import(demoBlob),
  ]);
  mount(demoMod.default, { target: document.getElementById("root") });
  parent.postMessage({ type: "fsds:ready" }, "*");
} catch (e) {
  showError(e.stack || e.message);
}
</script>
</body>
</html>`;
}

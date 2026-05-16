import { rewriteLitSource } from "../rewriteImports";
import { jsLiteral } from "./encode";

interface LitShellInput {
  componentName: string;
  componentSource: string;
  css?: string;
  demo: string;
}

/**
 * Lit components are TypeScript with decorators. We transpile in-iframe via
 * Babel standalone (decorators + TS) and let the component register itself
 * via `customElements.define`. We then inject the demo HTML into #root.
 */
export function buildLitShell({
  componentName,
  componentSource,
  css,
  demo,
}: LitShellInput): string {
  const rewritten = rewriteLitSource(componentSource);
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
    "lit": "https://esm.sh/lit@3",
    "lit/decorators.js": "https://esm.sh/lit@3/decorators.js"
  }
}
</script>
<script src="https://unpkg.com/@babel/standalone@7.27.0/babel.min.js"></script>
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

async function waitForBabel(timeoutMs = 10000) {
  const start = Date.now();
  while (!window.Babel) {
    if (Date.now() - start > timeoutMs) throw new Error("Babel standalone never loaded");
    await new Promise((r) => setTimeout(r, 50));
  }
}

try {
  await waitForBabel();
  const source = ${jsLiteral(rewritten)};
  const demoHtml = ${jsLiteral(demo)};
  const out = window.Babel.transform(source, {
    filename: ${jsLiteral(componentName + ".ts")},
    presets: [["typescript", { allExtensions: true, onlyRemoveTypeImports: true }]],
    plugins: [
      ["proposal-decorators", { legacy: true }],
      ["proposal-class-properties", { loose: true }],
    ],
    assumptions: { setPublicClassFields: true },
  });
  const blob = URL.createObjectURL(new Blob([out.code], { type: "text/javascript" }));
  await import(blob);
  document.getElementById("root").innerHTML = demoHtml;
  parent.postMessage({ type: "fsds:ready" }, "*");
} catch (e) {
  showError(e?.stack || e?.message || String(e));
}
</script>
</body>
</html>`;
}

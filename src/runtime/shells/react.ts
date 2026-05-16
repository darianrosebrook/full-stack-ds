import { rewriteReactSource } from "../rewriteImports";
import { jsLiteral } from "./encode";

interface ReactShellInput {
  componentName: string;
  componentSource: string;
  css?: string;
  demo: string;
}

const REACT_ESM = "https://esm.sh/react@19?dev";
const REACT_DOM_ESM = "https://esm.sh/react-dom@19/client?dev";
const REACT_JSX_RUNTIME = "https://esm.sh/react@19/jsx-runtime?dev";

/**
 * Builds an HTML string suitable for an iframe srcdoc that:
 *   1. Loads Babel standalone to transpile TS/TSX in the iframe.
 *   2. Sets up an import map for React.
 *   3. Transpiles the component source and demo, joins them into a single
 *      blob-URL module, then imports it.
 *   4. Posts ready/error messages back to the parent.
 */
export function buildReactShell({
  componentSource,
  css,
  demo,
}: ReactShellInput): string {
  const rewritten = rewriteReactSource(componentSource);
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; font-family: ui-sans-serif, system-ui, sans-serif; color: inherit; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
  #root { display: contents; }
  #__fsds_err { position: fixed; inset: 12px; padding: 12px; background: #fee; color: #900; font-family: ui-monospace, monospace; font-size: 12px; border: 1px solid #fbb; border-radius: 6px; white-space: pre-wrap; overflow: auto; display: none; }
</style>
${css ? `<style data-fsds="component-css">${css.replace(/<\/style>/g, "<\\/style>")}</style>` : ""}
<script type="importmap">
{
  "imports": {
    "react": "${REACT_ESM}",
    "react-dom/client": "${REACT_DOM_ESM}",
    "react/jsx-runtime": "${REACT_JSX_RUNTIME}",
    "react/jsx-dev-runtime": "${REACT_JSX_RUNTIME}"
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

const componentSource = ${jsLiteral(rewritten)};
const demoSource = ${jsLiteral(demo)};

function transformWithBabel(code, filename) {
  const out = window.Babel.transform(code, {
    filename,
    presets: [
      ["typescript", { allExtensions: true, isTSX: true }],
      ["react", { runtime: "automatic" }],
    ],
  });
  return out.code;
}

// Wait for the classic-script Babel global to be ready.
async function waitForBabel(timeoutMs = 10000) {
  const start = Date.now();
  while (!window.Babel) {
    if (Date.now() - start > timeoutMs) throw new Error("Babel standalone never loaded");
    await new Promise((r) => setTimeout(r, 50));
  }
}

try {
  await waitForBabel();
  const componentJs = transformWithBabel(componentSource, "Component.tsx");
  const demoJs = transformWithBabel(demoSource, "demo.tsx");
  const componentBlob = URL.createObjectURL(new Blob([componentJs], { type: "text/javascript" }));
  const importMatch = demoJs.match(/from\\s+["']\\.\\/([A-Z][A-Za-z0-9_]*)["']/);
  const expectedName = importMatch ? importMatch[1] : null;
  let demoFinal = demoJs;
  if (expectedName) {
    demoFinal = demoJs.replace(
      new RegExp("from\\\\s+[\\"']\\\\./" + expectedName + "[\\"']", "g"),
      "from " + JSON.stringify(componentBlob)
    );
  }
  const demoBlob = URL.createObjectURL(new Blob([demoFinal], { type: "text/javascript" }));
  await import(demoBlob);
  parent.postMessage({ type: "fsds:ready" }, "*");
} catch (e) {
  showError(e?.stack || e?.message || String(e));
}
</script>
</body>
</html>`;
}

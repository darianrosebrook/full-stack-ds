// HTML shell for /preview/react/<Name>. Loads the per-component virtual
// entry module via Vite's `/@id/` URL — that's the URL Vite uses internally
// for non-file modules, and hitting it causes resolveId/load hooks to fire
// (which is what we need so the plugin's entry-generator runs and Vite's
// React plugin transforms the resulting JSX).
//
// Compared to the old Babel-in-iframe shell, this shell has no inline
// transpiler, no blob-URL juggling, and no import-rewriting. All of that
// is now handled by Vite's existing module graph.

interface ShellInput {
  componentName: string;
  /** Component CSS, inlined as a <style> tag. Empty string is fine. */
  componentCss?: string;
  /** Design-tokens CSS (custom-property declarations). Inlined as a <style>. */
  tokensCss?: string;
  /** Virtual entry module ID — referenced as `/@id/<entryId>` in the script src. */
  entryId: string;
}

// React Fast Refresh preamble. @vitejs/plugin-react normally injects this via
// transformIndexHtml so that transformed component modules can call the
// runtime hooks ($RefreshReg$, $RefreshSig$) without ReferenceError. We bypass
// transformIndexHtml here because Vite's import-analysis runs over inline
// <script type="module"> blocks and rejects /@id/<virtual:...> dynamic imports
// when they're statically analyzable. Inlining the preamble manually keeps
// our HTML opaque to the index transformer while still satisfying plugin-
// react's runtime contract. The 4-line shape is copy/pasted from Vite's own
// emitted preamble — see node_modules/@vitejs/plugin-react/dist/index.mjs.
const REACT_REFRESH_PREAMBLE = `
import { injectIntoGlobalHook } from "/@react-refresh";
injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
`;

const STYLE_RESET = `
  html, body { margin: 0; padding: 0; background: transparent; font-family: ui-sans-serif, system-ui, sans-serif; color: inherit; }
  body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
  #root { display: contents; }
  #__fsds_err { position: fixed; inset: 12px; padding: 12px; background: #fee; color: #900; font-family: ui-monospace, monospace; font-size: 12px; border: 1px solid #fbb; border-radius: 6px; white-space: pre-wrap; overflow: auto; display: none; }
`;

const ERR_BRIDGE = `
const errEl = document.getElementById("__fsds_err");
function showError(msg) {
  errEl.textContent = String(msg);
  errEl.style.display = "block";
  try { parent.postMessage({ type: "fsds:error", message: String(msg) }, "*"); } catch (e) {}
}
window.addEventListener("error", (e) => showError(e.error?.stack || e.message));
window.addEventListener("unhandledrejection", (e) => showError(e.reason?.stack || e.reason));
`;

/**
 * The `/@id/` URL prefix is Vite's internal ID resolver. Modules whose IDs
 * don't map to filesystem paths are reachable through it; we use that for
 * our `virtual:fsds-preview-react/<Name>/entry` virtual.
 *
 * Note: we deliberately do NOT URL-encode the colon/slashes in the entry id
 * — Vite's import-analysis (which runs over `<script type="module">` content
 * after transformIndexHtml) calls normalizeUrl and rejects percent-encoded
 * `/@id/` URLs. The browser handles literal `:` and `/` in URL paths fine,
 * and this matches the format Vite emits in its own injected `<script>`s.
 */
export function buildReactPreviewShellHtml(input: ShellInput): string {
  const { componentName, componentCss, tokensCss, entryId } = input;
  const entryUrl = `/@id/${entryId}`;
  const escapeStyle = (s: string) => s.replace(/<\/style>/g, "<\\/style>");
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${componentName} — React preview</title>
<style>${STYLE_RESET}</style>
${tokensCss ? `<style data-fsds="tokens">${escapeStyle(tokensCss)}</style>` : ""}
${componentCss ? `<style data-fsds="component-css">${escapeStyle(componentCss)}</style>` : ""}
<script type="module">${REACT_REFRESH_PREAMBLE}</script>
</head>
<body>
<div id="root"></div>
<div id="__fsds_err"></div>
<script type="module">
${ERR_BRIDGE}
// Compute the entry URL via concatenation at runtime so Vite's
// import-analysis can't statically resolve it. Vite's analyzer rejects
// /@id/<virtual:...> URLs containing literal colons even though they're
// valid at request time; computing the string here keeps the analyzer
// out of the way while still letting the browser fetch it correctly.
const entryUrl = ${JSON.stringify("/@id/")} + ${JSON.stringify(entryId)};
try {
  await import(/* @vite-ignore */ entryUrl);
  parent.postMessage({ type: "fsds:ready" }, "*");
} catch (e) {
  showError(e?.stack || e?.message || String(e));
}
</script>
</body>
</html>`;
}

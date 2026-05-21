// Shared HTML shell helper for the Vue / Svelte / Lit preview plugins.
//
// React has its own shell module because it needs to inline the React Fast
// Refresh preamble (the four-line $RefreshReg$/$RefreshSig$ setup that
// @vitejs/plugin-react normally injects via transformIndexHtml). Vue's plugin,
// the Svelte plugin, and Lit (no SFC plugin at all) don't need a preamble, so
// they all share this simpler scaffold.
//
// Style + error-bridge + dynamic-import-of-virtual-entry are identical to the
// React shell; the only knobs callers vary are the framework label, the
// entry virtual id, and the injected CSS.

interface CommonShellInput {
  componentName: string;
  /** Human-readable framework label for <title> + error context. */
  framework: "vue" | "svelte" | "lit";
  /** Per-component CSS (regenerated, inlined as a <style>). */
  componentCss?: string;
  /** Global design-tokens CSS, inlined as a <style>. */
  tokensCss?: string;
  /** Virtual entry module id — loaded via /@id/<entryId> at runtime. */
  entryId: string;
}

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

// React Fast Refresh no-op stubs. Vite 8's @vitejs/plugin-react v6 uses an
// oxc-based transform that injects $RefreshSig$/$RefreshReg$ calls into any
// .ts/.tsx file it claims (including the <script lang="ts"> sub-modules
// emitted by plugin-vue, the .svelte.ts rune files in ds-svelte, and any
// plain .ts in ds-lit). The plugin's `exclude` option scopes off the
// wrapper plugin's preamble but the oxc transform still injects calls.
// Rather than hunt the exclude through three layers of internals, we
// stub the globals as no-ops at the top of the shell — any injected
// refresh hook becomes a harmless function call. The React preview shell
// doesn't go through this common builder; it has its own preamble that
// wires up the real refresh runtime.
const REFRESH_STUBS = `
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
`;

export function buildCommonPreviewShellHtml(input: CommonShellInput): string {
  const { componentName, framework, componentCss, tokensCss, entryId } = input;
  const escapeStyle = (s: string) => s.replace(/<\/style>/g, "<\\/style>");
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${componentName} — ${framework} preview</title>
<style>${STYLE_RESET}</style>
${tokensCss ? `<style data-fsds="tokens">${escapeStyle(tokensCss)}</style>` : ""}
${componentCss ? `<style data-fsds="component-css">${escapeStyle(componentCss)}</style>` : ""}
<script>${REFRESH_STUBS}</script>
</head>
<body>
<div id="root"></div>
<div id="__fsds_err"></div>
<script type="module">
${ERR_BRIDGE}
// Compute the entry URL at runtime via concatenation so Vite's
// import-analysis can't statically resolve it. Vite's analyzer rejects
// /@id/<virtual:...> URLs containing literal colons even though they're
// valid at request time; computing the string here keeps the analyzer
// out of the way while still letting the browser fetch it correctly.
// Same pattern as src/runtime/react-preview/shell.ts.
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

// Config-mode entry source for the scratch Properties panel.
//
// The default React preview entry (buildReactDemo) bakes props into the
// component invocation and mounts ONCE — to change a prop you regenerate the
// module (a new URL → a new virtual entry). That rebuild-per-change path is
// what the runtime fact rail asserts against and is left untouched.
//
// This module emits a PARALLEL entry that turns the iframe into a persistent
// render target: it keeps a single createRoot, exposes a re-render closure, and
// listens for `fsds:config` messages from the parent. On each message it
//   - re-renders the component with the merged props (no module rebuild), and
//   - rewrites a `<style data-fsds="overrides">` element with the token CSS,
// so variant/prop/token edits in the panel appear live over the wire.
//
// It also re-posts `fsds:ready` after first mount (the shell already posts it
// once after the dynamic import resolves) so the parent's handshake — "flush
// current config on ready" — has a deterministic signal even if the message
// listener was attached a tick after the shell's ready post.
//
// The emitted source imports React/ReactDOM and the component by ABSOLUTE
// Vite-served paths (same convention as buildEntrySource) so Vite's React
// plugin transforms the JSX and resolves siblings through its graph.

/**
 * Build the config-mode entry module source for a component.
 *
 * @param componentName PascalCase component name (also its default export tag).
 * @param childLabel    Optional text child to render between the tags (mirrors
 *                      buildReactDemo's childLabel handling for components that
 *                      render their children, e.g. Button's label). Pass null
 *                      for self-closing components.
 */
export function buildConfigEntrySource(
  componentName: string,
  childLabel: string | null,
): string {
  const absImport = `/packages/ds-react/src/components/${componentName}/${componentName}.tsx`;
  // The child is emitted as a JS string literal and rendered as a React text
  // node; JSON.stringify escapes quotes/specials safely.
  const childExpr = childLabel == null ? "null" : JSON.stringify(childLabel);

  return `import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { ${componentName} } from ${JSON.stringify(absImport)};

// Persistent render target: one root, re-rendered on each config message.
const container = document.getElementById("root");
const root = createRoot(container);

// Current props, merged across config messages so a message that sets only one
// prop doesn't drop the others.
let currentProps = {};

const CHILD = ${childExpr};

function renderNow() {
  const children = CHILD == null ? [] : [CHILD];
  root.render(createElement(${componentName}, currentProps, ...children));
}

// Token overrides ride in a dedicated <style> element so they layer over the
// component CSS (which is injected earlier in <head>). We create it lazily and
// rewrite its textContent wholesale each message — no diffing needed, the block
// is small and the browser recomputes styles cheaply.
function applyTokenCss(css) {
  let el = document.getElementById("__fsds_overrides");
  if (!el) {
    el = document.createElement("style");
    el.id = "__fsds_overrides";
    el.setAttribute("data-fsds", "overrides");
    document.head.appendChild(el);
  }
  el.textContent = css || "";
}

window.addEventListener("message", (e) => {
  const data = e && e.data;
  if (!data || data.type !== "fsds:config") return;
  if (data.props && typeof data.props === "object") {
    // Replace (not merge-into-stale) so removing a prop in the panel actually
    // clears it: the parent always sends the FULL current prop map.
    currentProps = data.props;
  }
  if (typeof data.tokenCss === "string") {
    applyTokenCss(data.tokenCss);
  }
  try {
    renderNow();
  } catch (err) {
    try { parent.postMessage({ type: "fsds:error", message: String(err && err.stack || err) }, "*"); } catch (_) {}
  }
});

// Initial mount with defaults, then announce readiness so the parent flushes
// its current config (the handshake that fixes the late-mount race).
renderNow();
try { parent.postMessage({ type: "fsds:ready" }, "*"); } catch (_) {}
`;
}

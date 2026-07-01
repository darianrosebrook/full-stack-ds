import type { DemoProps } from "./demos";

export interface ConfigEntryInput {
  childLabel: string | null;
  defaultProps: DemoProps;
  rendererSource: string;
}

/**
 * Framework-neutral config-mode preview entry.
 *
 * The renderer source below is the only framework-specific surface. It must
 * define `renderComponent(props, child)`; this entry owns the shared message
 * bus, full-prop replacement semantics, token CSS override injection, and the
 * ready/error handshake.
 */
export function buildConfigEntrySource({
  childLabel,
  defaultProps,
  rendererSource,
}: ConfigEntryInput): string {
  const childExpr = childLabel == null ? "null" : JSON.stringify(childLabel);
  const defaultPropsExpr = JSON.stringify(defaultProps);

  return `${rendererSource}

const DEFAULT_PROPS = ${defaultPropsExpr};
const CHILD = ${childExpr};

let currentProps = { ...DEFAULT_PROPS };

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

function renderNow() {
  renderComponent(currentProps, CHILD);
}

window.addEventListener("message", (e) => {
  const data = e && e.data;
  if (!data || data.type !== "fsds:config") return;
  if (data.props && typeof data.props === "object") {
    currentProps = data.props;
    try {
      renderNow();
    } catch (err) {
      try { parent.postMessage({ type: "fsds:error", message: String(err && err.stack || err) }, "*"); } catch (_) {}
    }
  }
  if (typeof data.tokenCss === "string") applyTokenCss(data.tokenCss);
});

renderNow();
try { parent.postMessage({ type: "fsds:ready" }, "*"); } catch (_) {}
`;
}

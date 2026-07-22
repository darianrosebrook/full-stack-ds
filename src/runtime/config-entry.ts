import type { DemoProps } from "./demos";

export interface ConfigEntryInput {
  childLabel: string | null;
  defaultProps: DemoProps;
  rendererSource: string;
  /**
   * Names of callback-kind props declared on the component's contract (see
   * demos.ts callbackPropNames). Each one gets wrapped so an invocation is
   * observable from Playwright: recorded to `window.__fsdsCallbackLog` and
   * posted to the parent as an `fsds:callback` message. Data-driven — the
   * entry never special-cases a callback name.
   */
  callbackPropNames?: string[];
}

/**
 * Framework-neutral config-mode preview entry.
 *
 * The renderer source below is the only framework-specific surface. It must
 * define `renderComponent(props, child)`; this entry owns the shared message
 * bus, full-prop replacement semantics, token CSS override injection, the
 * ready/error handshake, and the callback-capture surface.
 */
export function buildConfigEntrySource({
  childLabel,
  defaultProps,
  rendererSource,
  callbackPropNames = [],
}: ConfigEntryInput): string {
  const childExpr = childLabel == null ? "null" : JSON.stringify(childLabel);
  const defaultPropsExpr = JSON.stringify(defaultProps);
  const callbackNamesExpr = JSON.stringify(callbackPropNames);

  return `${rendererSource}

const DEFAULT_PROPS = ${defaultPropsExpr};
const CHILD = ${childExpr};
const CALLBACK_PROP_NAMES = ${callbackNamesExpr};

let currentProps = { ...DEFAULT_PROPS };

window.__fsdsCallbackLog = window.__fsdsCallbackLog || [];

// Wraps each declared callback-kind prop (if present on the incoming props
// object) so an invocation is observable from the parent/Playwright without
// any per-component knowledge here: the wrapped function records the call to
// window.__fsdsCallbackLog AND posts an "fsds:callback" message, then
// forwards to the original handler (if the consumer supplied one) so
// wrapping stays inert for non-preview showcase usage of the same renderer.
function withCallbackCapture(props) {
  if (!CALLBACK_PROP_NAMES.length) return props;
  const wrapped = { ...props };
  for (const name of CALLBACK_PROP_NAMES) {
    const original = props[name];
    if (typeof original !== "function" && original !== undefined) continue;
    wrapped[name] = function (...args) {
      const entry = { name: name, args: args, at: Date.now() };
      window.__fsdsCallbackLog.push(entry);
      try {
        parent.postMessage({ type: "fsds:callback", name: name, args: args }, "*");
      } catch (_) {}
      if (typeof original === "function") return original.apply(this, args);
    };
  }
  return wrapped;
}

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
  renderComponent(withCallbackCapture(currentProps), CHILD);
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

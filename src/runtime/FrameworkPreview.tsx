import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Icon, Skeleton, Spinner, Stack } from "@full-stack-ds/react";
import type { Framework, SourceFile } from "../types/data";
import { buildAngularShell } from "./shells/angular";
import { REACT_PREVIEW_URL_PREFIX } from "./react-preview/constants";
import { VUE_PREVIEW_URL_PREFIX } from "./vue-preview/constants";
import { SVELTE_PREVIEW_URL_PREFIX } from "./svelte-preview/constants";
import { LIT_PREVIEW_URL_PREFIX } from "./lit-preview/constants";

/**
 * Live configuration pushed to a config-mode preview iframe over the wire.
 * New-pipeline preview iframes are persistent render targets by default:
 * instead of rebuilding the module per change, the parent posts this payload
 * as an `fsds:config` message and the iframe re-renders + re-skins live.
 */
export interface PreviewConfig {
  /** Full current prop map for the component (replaces, not merges). */
  props: Record<string, unknown>;
  /** Component-token CSS-custom-property override block (from tokenOverridesToCss). */
  tokenCss: string;
}

interface FrameworkPreviewProps {
  framework: Framework;
  componentName: string;
  componentSource: SourceFile;
  css?: SourceFile;
  /** Global token CSS to inject before the per-component css. */
  tokensCss?: string;
  demo: string;
  height?: number;
  interactive?: boolean;
  /**
   * When present, sends this payload as an `fsds:config` message on change and
   * on the iframe's `fsds:ready` handshake. All five Web DOM previews accept
   * this wire shape; Angular implements it in its synthesized AOT host while
   * retaining the legacy srcdoc shell.
   */
  config?: PreviewConfig;
  /**
   * Live token-override CSS injected into the iframe document AFTER load as a
   * `<style data-fsds="overrides">` element. Unlike `tokensCss` (baked into the
   * server-built shell at the `src` URL, keyed by component), this re-applies on
   * change without reloading — so editing a token in the Properties tab re-skins
   * baked-props previews live. Works for same-origin new-pipeline iframes; this
   * direct DOM path is a no-op for Angular's opaque-origin srcdoc, whose
   * synthesized host applies the equivalent `config.tokenCss` message instead.
   */
  overrideCss?: string;
}

/**
 * Frameworks that use the new Vite-middleware preview pipeline
 * (ADR-PREVIEW-PIPELINE-001). For these, the iframe is loaded via `src` from
 * a real same-origin URL; the dev server's plugin handles HTML + module
 * transforms. Angular keeps the legacy srcDoc shell because its bootstrap
 * needs explicit importmap + JIT-compiler fallback and doesn't fit the
 * uniform middleware shape — see src/runtime/angular-compiler/vite-plugin.ts
 * for the parallel design.
 */
const NEW_PIPELINE_URL_PREFIX: Partial<Record<Framework, string>> = {
  react: REACT_PREVIEW_URL_PREFIX,
  vue: VUE_PREVIEW_URL_PREFIX,
  svelte: SVELTE_PREVIEW_URL_PREFIX,
  lit: LIT_PREVIEW_URL_PREFIX,
};

export function FrameworkPreview({
  framework,
  componentName,
  componentSource,
  css,
  tokensCss,
  overrideCss,
  demo,
  height = 200,
  interactive = true,
  config,
}: FrameworkPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const newPipelinePrefix = NEW_PIPELINE_URL_PREFIX[framework];
  const useNewPipeline = newPipelinePrefix !== undefined;

  // Angular is the only framework still on the legacy srcdoc shell — its
  // bootstrap path needs an explicit importmap + JIT-compiler fallback that
  // doesn't fit the uniform middleware shape. For everyone else we don't
  // build any HTML here; the dev-server plugin synthesizes it.
  const html = useMemo(() => {
    if (useNewPipeline) return null;
    const combinedCss = [tokensCss, css?.code].filter(Boolean).join("\n");
    return buildAngularShell({
      componentName,
      componentSource: componentSource.code,
      css: combinedCss || undefined,
      demo,
    });
  }, [
    useNewPipeline,
    componentName,
    componentSource.code,
    css?.code,
    tokensCss,
    demo,
  ]);

  const src = useNewPipeline ? `${newPipelinePrefix}${componentName}` : null;

  // Reset to loading whenever the iframe reloads. The reload trigger differs
  // by pipeline: under the new pipeline it's the `src` URL changing; under
  // the legacy pipeline it's the rebuilt `srcdoc` HTML. Using a single key
  // here keeps the reset effect uniform across both paths.
  const previewKey = useNewPipeline ? src : html;
  useEffect(() => {
    setStatus("loading");
    setErrMsg(null);
  }, [previewKey]);

  // Keep the latest config in a ref so the ready-handshake handler (registered
  // once, empty deps) can flush the current value without re-subscribing.
  const configRef = useRef(config);
  configRef.current = config;

  // Post the current config to the iframe. Safe to call before ready — but we
  // only call it from the ready handler and on config change after ready, so a
  // pre-mount message is never dropped silently.
  function postConfig() {
    const cfg = configRef.current;
    if (!cfg) return;
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      { type: "fsds:config", props: cfg.props, tokenCss: cfg.tokenCss },
      "*",
    );
  }

  // Listen for ready/error messages from this iframe only. The source-window
  // filter is what isolates multiple FrameworkPreviews mounted in the same page.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
      if (e.data?.type === "fsds:ready") {
        setStatus("ready");
        // Handshake: the iframe just mounted — flush current config so a config
        // set before the iframe booted is applied (fixes the late-mount race).
        postConfig();
      }
      if (e.data?.type === "fsds:error") {
        setStatus("error");
        setErrMsg(String(e.data.message ?? "unknown error"));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Push config to the iframe whenever it changes, once the iframe is ready.
  // Pre-ready changes are caught by the ready handshake above.
  useEffect(() => {
    if (status !== "ready") return;
    postConfig();
  }, [config, status]);

  // Inject live token-override CSS into the iframe document once it's ready.
  // Same-origin (new-pipeline) iframes let us write a <style> directly; this
  // re-skins previews such as the variant matrix without reloading. The
  // legacy srcdoc path is opaque-origin, so contentDocument access throws — we
  // swallow it (override is a new-pipeline-only enhancement).
  useEffect(() => {
    if (status !== "ready" || overrideCss === undefined) return;
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    try {
      let el = doc.getElementById("__fsds_overrides") as HTMLStyleElement | null;
      if (!el) {
        el = doc.createElement("style");
        el.id = "__fsds_overrides";
        el.setAttribute("data-fsds", "overrides");
        doc.head.appendChild(el);
      }
      el.textContent = overrideCss;
    } catch {
      // cross-origin (legacy srcdoc) — override injection not supported there.
    }
  }, [overrideCss, status]);

  // New-pipeline iframes require `allow-same-origin` because they load a
  // same-origin URL whose script makes module fetches; an opaque origin
  // would CORS-block those (ADR-PREVIEW-PIPELINE-001 pitfall #2). Legacy
  // srcdoc iframes stay at the stricter `allow-scripts`-only sandbox.
  const sandbox = useNewPipeline
    ? "allow-scripts allow-same-origin"
    : "allow-scripts";

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <iframe
        ref={iframeRef}
        className="preview-iframe"
        // One of src / srcDoc is set per render; React tolerates `undefined`
        // attributes by omitting them, but we explicitly pass undefined to
        // make the contract obvious.
        src={src ?? undefined}
        srcDoc={html ?? undefined}
        sandbox={sandbox}
        title={`${framework} preview · ${componentName}`}
        style={{ height, pointerEvents: interactive ? "auto" : "none" }}
      />
      {/* Blank-iframe placeholder while the preview boots; the iframe stays
       * mounted so the ready-handshake and runtime-rail assertions hold. */}
      {status === "loading" && (
        <div style={{ position: "absolute", inset: 0 }} aria-hidden>
          <Skeleton variant="block" style={{ width: "100%", height: "100%" }} />
        </div>
      )}
      {status === "loading" && (
        <Stack variant="horizontal" className="preview-status stack-gap-05">
          <Spinner size="sm" ariaHidden />
          Booting {framework}…
        </Stack>
      )}
      {status === "error" && (
        <Alert
          intent="danger"
          level="inline"
          className="preview-status--error"
          icon={<Icon name="triangle-alert" size="sm" />}
        >
          {errMsg ?? "Preview failed"}
        </Alert>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import type { Framework, SourceFile } from "../types/data";
import { buildReactShell } from "./shells/react";
import { buildVueShell } from "./shells/vue";
import { buildSvelteShell } from "./shells/svelte";
import { buildLitShell } from "./shells/lit";
import { buildAngularShell } from "./shells/angular";
import { REACT_PREVIEW_URL_PREFIX } from "./react-preview/constants";

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
}

const SHELL_BUILDERS = {
  react: buildReactShell,
  vue: buildVueShell,
  svelte: buildSvelteShell,
  lit: buildLitShell,
  angular: buildAngularShell,
} as const;

/**
 * Frameworks that use the new Vite-middleware preview pipeline
 * (ADR-PREVIEW-PIPELINE-001). For these, the iframe is loaded via `src` from
 * a real same-origin URL; the dev server's plugin handles HTML + module
 * transforms. Other frameworks continue using the legacy `srcDoc` + Babel-
 * in-iframe path until their plugins land in step 4.
 */
const NEW_PIPELINE_URL_PREFIX: Partial<Record<Framework, string>> = {
  react: REACT_PREVIEW_URL_PREFIX,
};

export function FrameworkPreview({
  framework,
  componentName,
  componentSource,
  css,
  tokensCss,
  demo,
  height = 200,
  interactive = true,
}: FrameworkPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const newPipelinePrefix = NEW_PIPELINE_URL_PREFIX[framework];
  const useNewPipeline = newPipelinePrefix !== undefined;

  // For new-pipeline frameworks, the iframe loads from a same-origin URL and
  // the dev-server plugin synthesizes the HTML. For legacy-pipeline frameworks,
  // we still build a `srcdoc` blob locally. We only build `html` when we're
  // going to use it — building it for React under the new pipeline would
  // pull in dead Babel-shell work on every render.
  const html = useMemo(() => {
    if (useNewPipeline) return null;
    const build = SHELL_BUILDERS[framework];
    const combinedCss = [tokensCss, css?.code].filter(Boolean).join("\n");
    return build({
      componentName,
      componentSource: componentSource.code,
      css: combinedCss || undefined,
      demo,
    });
  }, [
    useNewPipeline,
    framework,
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

  // Listen for ready/error messages from this iframe only. The source-window
  // filter is what isolates multiple FrameworkPreviews mounted in the same page.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (!iframeRef.current || e.source !== iframeRef.current.contentWindow) return;
      if (e.data?.type === "fsds:ready") setStatus("ready");
      if (e.data?.type === "fsds:error") {
        setStatus("error");
        setErrMsg(String(e.data.message ?? "unknown error"));
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // New-pipeline iframes require `allow-same-origin` because they load a
  // same-origin URL whose script makes module fetches; an opaque origin
  // would CORS-block those (ADR-PREVIEW-PIPELINE-001 pitfall #2). Legacy
  // srcdoc iframes stay at the stricter `allow-scripts`-only sandbox.
  const sandbox = useNewPipeline
    ? "allow-scripts allow-same-origin"
    : "allow-scripts";

  return (
    <div style={{ width: "100%" }}>
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
      {(status !== "ready" || errMsg) && (
        <div
          className={`preview-status${status === "error" ? " preview-status--error" : ""}`}
          role={status === "error" ? "alert" : undefined}
        >
          {status === "loading" && (
            <>
              <span className="spinner" />
              Booting {framework}…
            </>
          )}
          {status === "error" && (
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {errMsg ?? "Preview failed"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

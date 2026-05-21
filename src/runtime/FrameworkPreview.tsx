import { useEffect, useMemo, useRef, useState } from "react";
import type { Framework, SourceFile } from "../types/data";
import { buildReactShell } from "./shells/react";
import { buildVueShell } from "./shells/vue";
import { buildSvelteShell } from "./shells/svelte";
import { buildLitShell } from "./shells/lit";
import { buildAngularShell } from "./shells/angular";

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

  const html = useMemo(() => {
    const build = SHELL_BUILDERS[framework];
    const combinedCss = [tokensCss, css?.code].filter(Boolean).join("\n");
    return build({
      componentName,
      componentSource: componentSource.code,
      css: combinedCss || undefined,
      demo,
    });
  }, [framework, componentName, componentSource.code, css?.code, tokensCss, demo]);

  // Reset to loading whenever the iframe will reload (html changes drive srcDoc).
  useEffect(() => {
    setStatus("loading");
    setErrMsg(null);
  }, [html]);

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

  return (
    <div style={{ width: "100%" }}>
      <iframe
        ref={iframeRef}
        className="preview-iframe"
        srcDoc={html}
        sandbox="allow-scripts"
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

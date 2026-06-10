import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTab } from "@full-stack-ds/react";
import type { ComponentBundle, Framework } from "../types/data";
import { bundle } from "../types/bundle";
import {
  FrameworkPreview,
  type PreviewConfig,
} from "../runtime/FrameworkPreview";
import { CodeViewer } from "../components/CodeViewer";
import { buildTraceIndex } from "../trace/buildTraceIndex";
import { buildDemo } from "../runtime/demos";
import {
  buildPropMap,
  materialTokenRows,
  tokenOverridesToCss,
} from "../components/properties-panel/control-derivation";
import type { TraceSelection } from "../trace/types";
import { ComponentViewTabs } from "./ComponentViewTabs";

interface DeveloperViewProps {
  component: ComponentBundle;
  trace: TraceSelection | null;
  onTrace: (selection: TraceSelection | null) => void;
  /** Live overrides from the Properties tab (lifted to App). */
  propOverrides?: Record<string, unknown>;
  tokenOverrides?: Record<string, string>;
}

const FRAMEWORK_TABS: { key: Framework; label: string; dot: string }[] = [
  { key: "react", label: "React", dot: "lang-react" },
  { key: "vue", label: "Vue", dot: "lang-vue" },
  { key: "svelte", label: "Svelte", dot: "lang-svelte" },
  { key: "angular", label: "Angular", dot: "lang-angular" },
  { key: "lit", label: "Lit", dot: "lang-lit" },
];

export function DeveloperView({
  component,
  trace,
  onTrace,
  propOverrides,
  tokenOverrides,
}: DeveloperViewProps) {
  const availableFrameworks = useMemo<Framework[]>(
    () => FRAMEWORK_TABS.filter((t) => component.sources[t.key]?.component).map((t) => t.key),
    [component],
  );
  const [framework, setFramework] = useState<Framework>(availableFrameworks[0] ?? "react");

  const source = component.sources[framework];
  const componentFile = source?.component;
  const cssFile = source?.css;
  const hookFile = source?.hook;

  const traceIndex = useMemo(() => {
    if (!componentFile) return { framework, componentName: component.name, hits: [] };
    return buildTraceIndex(framework, component.name, componentFile.code, component.contract);
  }, [framework, componentFile, component]);

  const demo = useMemo(() => buildDemo(framework, component), [framework, component]);

  // Properties-tab overrides → preview. The React preview runs in config mode
  // (fsds:config wire; props + token CSS re-apply with no module rebuild),
  // EXCEPT for compound components — config mode renders a single root + text
  // child, which is wrong for them. Non-react frameworks and compounds fall
  // back to overrideCss injection: token re-skin works, prop overrides don't
  // reach the baked-props demo (an accepted limit; Angular's srcdoc path is a
  // no-op even for overrideCss).
  const isCompound = Boolean(component.contract.compoundParts);
  const useConfigMode = framework === "react" && !isCompound;
  const tokenCss = useMemo(() => {
    // Material rows so inherited box-model slots also expand resolvesTo —
    // a profile-sourced ref override must hit its semantic var to win over
    // the component-scoped declaration in <Name>.tokens.css.
    return tokenOverridesToCss(tokenOverrides ?? {}, materialTokenRows(component));
  }, [component, tokenOverrides]);
  const config = useMemo<PreviewConfig | undefined>(() => {
    if (!useConfigMode) return undefined;
    return {
      props: buildPropMap(component.contract, propOverrides ?? {}),
      tokenCss,
    };
  }, [useConfigMode, component, propOverrides, tokenCss]);
  const overrideCss = useConfigMode ? undefined : tokenCss || undefined;

  const handleHitClick = (hit: import("../trace/types").TraceHit) => {
    onTrace({ hit, framework, componentName: component.name });
  };

  return (
    <div className="page">
      <p className="page-eyebrow">{(component.contract.layer ?? "component").toUpperCase()}</p>
      <h1 className="page-title">{component.name}</h1>
      <p className="page-lede">
        Inspect the source for {component.name} across every emitted framework.
        Highlighted tokens map back to the contract field that produced them —
        click any to see the contract path in the panel on the right.
      </p>

      <ComponentViewTabs componentName={component.name} activeTab="developer" />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "var(--fsds-core-spacing-size-08) 0 var(--fsds-core-spacing-size-06)" }}>
        <Tabs
          appearance="pills"
          value={framework}
          onValueChange={(next) => {
            setFramework(next as Framework);
            onTrace(null);
          }}
          aria-label="Target framework"
          className="fw-tabs"
        >
          <TabsList>
            {FRAMEWORK_TABS.map((t) => {
              const available = availableFrameworks.includes(t.key);
              return (
                <TabsTab
                  key={t.key}
                  value={t.key}
                  disabled={!available}
                  className="fw-tab"
                >
                  <span className={`lang-dot ${t.dot}`} />
                  {t.label}
                </TabsTab>
              );
            })}
          </TabsList>
        </Tabs>
        <span className="muted" style={{ fontSize: "var(--fsds-core-typography-ramp-2)" }}>
          {traceIndex.hits.length} traced region{traceIndex.hits.length === 1 ? "" : "s"}
        </span>
      </div>

      <p className="muted fw-readiness" style={{ fontSize: "var(--fsds-core-typography-ramp-2)", marginTop: 0 }}>
        Generated source:{" "}
        {FRAMEWORK_TABS.map((t, i) => {
          const present = Boolean(component.sources[t.key]?.component);
          return (
            <span key={t.key}>
              {i > 0 ? " · " : ""}
              <span className={present ? "" : "subtle"}>
                {t.label} {present ? "✓" : "—"}
              </span>
            </span>
          );
        })}
        <span className="subtle"> (build-artifact presence; not a runtime or admission claim)</span>
      </p>

      {!componentFile ? (
        <div className="panel panel--inset muted">No source available for {framework}.</div>
      ) : (
        <>
          <section className="section" style={{ marginTop: 0 }}>
            <header className="section-header">
              <h2 className="section-title">Live preview</h2>
              <span className="section-meta">in-iframe {framework}</span>
            </header>
            <div className="panel">
              <div className="panel-toolbar">
                <span>{framework}</span>
                <span className="subtle">demo harness</span>
              </div>
              <div className="preview-frame">
                <FrameworkPreview
                  key={`${framework}-${component.name}`}
                  framework={framework}
                  componentName={component.name}
                  componentSource={componentFile}
                  css={cssFile}
                  tokensCss={bundle.tokensCss}
                  demo={demo}
                  height={280}
                  config={config}
                  overrideCss={overrideCss}
                />
              </div>
            </div>
          </section>

          <section className="section">
            <header className="section-header">
              <h2 className="section-title">Component source</h2>
              <span className="section-meta">{componentFile.filename}</span>
            </header>
            <CodeViewer
              code={componentFile.code}
              filename={componentFile.filename}
              hits={traceIndex.hits}
              onHitClick={handleHitClick}
              selectedHitIndex={
                trace && trace.framework === framework
                  ? traceIndex.hits.findIndex(
                      (h) =>
                        h.start.line === trace.hit.start.line &&
                        h.start.column === trace.hit.start.column &&
                        h.contractPath === trace.hit.contractPath,
                    )
                  : null
              }
            />
          </section>

          {hookFile && (
            <section className="section">
              <header className="section-header">
                <h2 className="section-title">Hook / behavior</h2>
                <span className="section-meta">{hookFile.filename}</span>
              </header>
              <CodeViewer code={hookFile.code} filename={hookFile.filename} />
            </section>
          )}

          {cssFile && (
            <section className="section">
              <header className="section-header">
                <h2 className="section-title">Styles</h2>
                <span className="section-meta">{cssFile.filename}</span>
              </header>
              <CodeViewer code={cssFile.code} filename={cssFile.filename} />
            </section>
          )}
        </>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { Links, Tabs, TabsList, TabsTab } from "@full-stack-ds/react";
import type { ComponentBundle, Framework } from "../types/data";
import type { Route } from "../router";
import { buildHref } from "../router";
import { bundle } from "../types/bundle";
import { FrameworkPreview } from "../runtime/FrameworkPreview";
import { CodeViewer } from "../components/CodeViewer";
import { buildTraceIndex } from "../trace/buildTraceIndex";
import { buildDemo } from "../runtime/demos";
import type { TraceSelection } from "../trace/types";

interface DeveloperViewProps {
  component: ComponentBundle;
  route: Route;
  trace: TraceSelection | null;
  onTrace: (selection: TraceSelection | null) => void;
}

const FRAMEWORK_TABS: { key: Framework; label: string; dot: string }[] = [
  { key: "react", label: "React", dot: "lang-react" },
  { key: "vue", label: "Vue", dot: "lang-vue" },
  { key: "svelte", label: "Svelte", dot: "lang-svelte" },
  { key: "angular", label: "Angular", dot: "lang-angular" },
  { key: "lit", label: "Lit", dot: "lang-lit" },
];

export function DeveloperView({ component, trace, onTrace }: DeveloperViewProps) {
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

      <nav className="tabs" aria-label="View mode">
        <Links
          className="tab"
          href={buildHref({ kind: "component", name: component.name, tab: "design" })}
        >
          Design
        </Links>
        <Links
          className="tab tab--active"
          href={buildHref({ kind: "component", name: component.name, tab: "developer" })}
          aria-current="page"
        >
          Developer
        </Links>
      </nav>

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
        <div className="card card--inset muted">No source available for {framework}.</div>
      ) : (
        <>
          <section className="section" style={{ marginTop: 0 }}>
            <header className="section-header">
              <h2 className="section-title">Live preview</h2>
              <span className="section-meta">in-iframe {framework}</span>
            </header>
            <div className="card">
              <div className="card-toolbar">
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

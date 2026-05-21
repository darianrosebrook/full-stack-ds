import type { ComponentBundle } from "../types/data";
import type { Route } from "../router";
import { buildHref } from "../router";
import { bundle } from "../types/bundle";
import { Anatomy } from "./sections/Anatomy";
import { PropsTable } from "./sections/PropsTable";
import { VariantsMatrix } from "./sections/VariantsMatrix";
import { StatesGrid } from "./sections/StatesGrid";
import { TokensTable } from "./sections/TokensTable";
import { A11yPanel } from "./sections/A11yPanel";
import { FrameworkPreview } from "../runtime/FrameworkPreview";
import { buildReactDemo } from "../runtime/demos";

interface DesignViewProps {
  component: ComponentBundle;
  route: Route;
}

export function DesignView({ component }: DesignViewProps) {
  const reactSource = component.sources.react;
  const hero = reactSource?.component ? (
    <FrameworkPreview
      framework="react"
      componentName={component.name}
      componentSource={reactSource.component}
      css={reactSource.css}
      tokensCss={bundle.tokensCss}
      demo={buildReactDemo(component)}
      height={260}
    />
  ) : (
    <div className="muted" style={{ padding: "var(--space-7)", textAlign: "center" }}>
      No React source available for {component.name}.
    </div>
  );

  return (
    <div className="page">
      <p className="page-eyebrow">{(component.contract.layer ?? "component").toUpperCase()}</p>
      <h1 className="page-title">{component.name}</h1>
      <p className="page-lede">
        {component.contract.description ?? "Component contract."}
      </p>

      <div className="tabs">
        <a
          className="tab tab--active"
          href={buildHref({ kind: "component", name: component.name, tab: "design" })}
        >
          Design
        </a>
        <a
          className="tab"
          href={buildHref({ kind: "component", name: component.name, tab: "developer" })}
        >
          Developer
        </a>
      </div>

      <section className="section">
        <div className="card">
          <div className="card-toolbar">
            <span>Live preview · React</span>
            <a
              className="muted"
              href={buildHref({ kind: "component", name: component.name, tab: "developer" })}
            >
              See all 5 frameworks →
            </a>
          </div>
          <div className="preview-frame">{hero}</div>
        </div>
      </section>

      {component.contract.anatomy && (
        <section className="section">
          <header className="section-header">
            <h2 className="section-title">Anatomy</h2>
            <span className="section-meta">contract.anatomy</span>
          </header>
          <Anatomy contract={component.contract} />
        </section>
      )}

      {component.contract.variants && Object.keys(component.contract.variants).length > 0 && (
        <section className="section">
          <header className="section-header">
            <h2 className="section-title">Variants</h2>
            <span className="section-meta">contract.variants</span>
          </header>
          <VariantsMatrix component={component} />
        </section>
      )}

      {component.contract.states && component.contract.states.length > 0 && (
        <section className="section">
          <header className="section-header">
            <h2 className="section-title">States</h2>
            <span className="section-meta">contract.states</span>
          </header>
          <StatesGrid contract={component.contract} />
        </section>
      )}

      {component.contract.props?.styled?.members && (
        <section className="section">
          <header className="section-header">
            <h2 className="section-title">Props</h2>
            <span className="section-meta">contract.props.styled.members</span>
          </header>
          <PropsTable members={component.contract.props.styled.members} />
        </section>
      )}

      {component.contract.a11y && (
        <section className="section">
          <header className="section-header">
            <h2 className="section-title">Accessibility</h2>
            <span className="section-meta">contract.a11y</span>
          </header>
          <A11yPanel a11y={component.contract.a11y} />
        </section>
      )}

      {component.contract.tokens && Object.keys(component.contract.tokens).length > 0 && (
        <section className="section">
          <header className="section-header">
            <h2 className="section-title">Design tokens</h2>
            <span className="section-meta">contract.tokens</span>
          </header>
          <TokensTable tokens={component.contract.tokens} />
        </section>
      )}
    </div>
  );
}

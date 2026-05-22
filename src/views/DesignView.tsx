import type { ComponentBundle } from "../types/data";
import type { Route } from "../router";
import { buildHref } from "../router";
import { Anatomy } from "./sections/Anatomy";
import { PropsTable } from "./sections/PropsTable";
import { VariantsMatrix } from "./sections/VariantsMatrix";
import { StatesGrid } from "./sections/StatesGrid";
import { TokensTable } from "./sections/TokensTable";
import { A11yPanel } from "./sections/A11yPanel";
import { UsageExamples } from "./sections/UsageExamples";

interface DesignViewProps {
  component: ComponentBundle;
  route: Route;
}

export function DesignView({ component }: DesignViewProps) {
  const hasUsage = component.usage.length > 0;

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

      {hasUsage ? (
        <section className="section">
          <header className="section-header">
            <h2 className="section-title">Examples</h2>
            <span className="section-meta">
              {component.name}.usage.jsonl · rendered with @full-stack-ds/react
            </span>
          </header>
          <UsageExamples component={component} />
        </section>
      ) : (
        <section className="section">
          <div className="muted" style={{ padding: "var(--space-7)", textAlign: "center" }}>
            No usage examples curated yet for {component.name}.
          </div>
        </section>
      )}

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

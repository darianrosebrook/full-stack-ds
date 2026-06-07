import type { ComponentBundle } from "../types/data";
import { ComponentViewTabs } from "./ComponentViewTabs";
import { TokensTable } from "./sections/TokensTable";

interface ComponentTokensViewProps {
  component: ComponentBundle;
}

export function ComponentTokensView({ component }: ComponentTokensViewProps) {
  const tokens = component.contract.tokens ?? {};
  const tokenCount = Object.keys(tokens).length;

  return (
    <div className="page">
      <p className="page-eyebrow">
        {(component.contract.layer ?? "component").toUpperCase()}
      </p>
      <h1 className="page-title">{component.name}</h1>
      <p className="page-lede">
        Component token facts declared by {component.name}.tokens.json and
        attached as contract.tokens.
      </p>

      <ComponentViewTabs componentName={component.name} activeTab="tokens" />

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">Component-level token slots</h2>
          <span className="section-meta">
            {tokenCount} slot{tokenCount === 1 ? "" : "s"} · contract.tokens
          </span>
        </header>
        {tokenCount > 0 ? (
          <TokensTable tokens={tokens} />
        ) : (
          <div className="panel panel--inset muted">
            No component tokens declared for {component.name}.
          </div>
        )}
      </section>
    </div>
  );
}

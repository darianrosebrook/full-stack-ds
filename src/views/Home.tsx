import { Card, Stat, Chip } from "@full-stack-ds/react";
import type { Bundle } from "../types/data";
import { buildHref } from "../router";

interface HomeProps {
  bundle: Bundle;
}

const FRAMEWORK_LABELS = [
  { key: "react", label: "React 19", dot: "lang-react" },
  { key: "vue", label: "Vue 3", dot: "lang-vue" },
  { key: "svelte", label: "Svelte 5", dot: "lang-svelte" },
  { key: "angular", label: "Angular 17+", dot: "lang-angular" },
  { key: "lit", label: "Lit 3", dot: "lang-lit" },
] as const;

const NON_WEB_LABELS = [
  { key: "react-native", label: "React Native", dot: "lang-react" },
  { key: "swiftui", label: "SwiftUI", dot: "lang-swift" },
  { key: "uikit", label: "UIKit", dot: "lang-uikit" },
  { key: "jetpack-compose", label: "Jetpack Compose", dot: "lang-jetpack" },
] as const;

export function Home({ bundle }: HomeProps) {
  const componentCount = bundle.components.length;
  const totalSources = bundle.components.reduce(
    (acc, c) => acc + Object.keys(c.sources).length,
    0,
  );
  const tokenCount = bundle.components.reduce((acc, c) => {
    const tokens = c.contract.tokens;
    if (!tokens) return acc;
    return (
      acc +
      Object.values(tokens).reduce(
        (sum, group) => sum + Object.keys(group ?? {}).length,
        0,
      )
    );
  }, 0);

  const samples = bundle.components.slice(0, 6);

  return (
    <div className="page">
      <p className="page-eyebrow">Contract-driven design system</p>
      <h1 className="page-title">
        One contract.
        <br />
        Five frameworks.
        <br />
        Zero divergence.
      </h1>
      <p className="page-lede">
        Every component on this site is described by a single JSON contract.
        That contract is the source of truth — five framework emitters (React,
        Vue, Svelte, Angular, Lit) read it and produce idiomatic, native source
        for each runtime. This showcase lets you compare them side-by-side and
        trace every line back to the field that produced it.
      </p>
      <p className="muted" style={{ marginTop: "calc(-1 * var(--space-3))" }}>
        Why one contract, five frameworks, one primitive? The constraint exists
        to test an architectural claim about compositional systems generally —
        read it on the{" "}
        <a href={buildHref({ kind: "architecture" })}>Architecture</a> page.
      </p>

      <div className="home-stats">
        <div className="home-stat">
          <Stat size="lg">{componentCount}</Stat>
          <div className="home-stat-label">Components</div>
        </div>
        <div className="home-stat">
          <Stat size="lg">5</Stat>
          <div className="home-stat-label">Target frameworks</div>
        </div>
        <div className="home-stat">
          <Stat size="lg">{totalSources}</Stat>
          <div className="home-stat-label">Generated files indexed</div>
        </div>
        <div className="home-stat">
          <Stat size="lg">{tokenCount}</Stat>
          <div className="home-stat-label">Design tokens declared</div>
        </div>
      </div>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">Target frameworks</h2>
          <span className="section-meta">in-browser preview, all five</span>
        </header>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {FRAMEWORK_LABELS.map((fw) => (
            <Card key={fw.key} density="inset">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                }}
              >
                <span
                  className={`lang-dot ${fw.dot}`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "currentColor",
                  }}
                />
                <strong style={{ fontSize: "var(--fs-400)" }}>
                  {fw.label}
                </strong>
              </div>
              <p
                className="muted"
                style={{
                  marginTop: "var(--space-3)",
                  marginBottom: 0,
                  fontSize: "var(--fs-200)",
                }}
              >
                {fw.key === "react" && "TSX, hooks, controllable state."}
                {fw.key === "vue" && "SFC with composition API."}
                {fw.key === "svelte" && "Svelte 5 runes ($props, $derived)."}
                {fw.key === "angular" && "Standalone components + signals."}
                {fw.key === "lit" && "Lit 3 with reactive controllers."}
              </p>
            </Card>
          ))}
        </div>
        <header className="section-header">
          <h2 className="section-title">Non-Web frameworks</h2>
          <span className="section-meta">code only previews</span>
        </header>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "var(--space-4)",
          }}
        >
          {NON_WEB_LABELS.map((fw) => (
            <Card key={fw.key} density="inset">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                }}
              >
                <span
                  className={`lang-dot ${fw.dot}`}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: "currentColor",
                  }}
                />
                <strong style={{ fontSize: "var(--fs-400)" }}>
                  {fw.label}
                </strong>
              </div>
              <p
                className="muted"
                style={{
                  marginTop: "var(--space-3)",
                  marginBottom: 0,
                  fontSize: "var(--fs-200)",
                }}
              >
                {fw.key === "react-native" && "TSX, hooks, native primitives."}
                {fw.key === "swiftui" && "View structs, @Binding state."}
                {fw.key === "uikit" && "UIControl subclass + target/action."}
                {fw.key === "jetpack-compose" && "@Composable, hoisted state."}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="section">
        <header className="section-header">
          <h2 className="section-title">Start exploring</h2>
          <a
            className="muted"
            href={buildHref({
              kind: "component",
              name: "Button",
              tab: "design",
            })}
          >
            See Button →
          </a>
        </header>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "var(--space-5)",
          }}
        >
          {samples.map((c) => (
            <a
              key={c.name}
              className="card card--inset"
              href={buildHref({
                kind: "component",
                name: c.name,
                tab: "design",
              })}
              style={{ display: "block" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--space-3)",
                }}
              >
                <strong>{c.name}</strong>
                <Chip size="small">{c.contract.layer}</Chip>
              </div>
              <p
                className="muted"
                style={{
                  marginTop: "var(--space-3)",
                  marginBottom: 0,
                  fontSize: "var(--fs-200)",
                }}
              >
                {c.contract.description ?? "—"}
              </p>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

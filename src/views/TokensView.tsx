import { useMemo, useState } from "react";
import type { Bundle, TokenDefinition } from "../types/data";
import { buildHref } from "../router";

interface TokensViewProps {
  bundle: Bundle;
}

interface TokenIndexEntry {
  name: string;
  definition: TokenDefinition;
  components: string[];
  groups: string[];
}

function isColorish(val: string | undefined): boolean {
  if (!val) return false;
  return /^#|^rgb|^hsl|^var\(/.test(val);
}

export function TokensView({ bundle }: TokensViewProps) {
  const [filter, setFilter] = useState("");

  const tokens = useMemo<TokenIndexEntry[]>(() => {
    const map = new Map<string, TokenIndexEntry>();
    for (const c of bundle.components) {
      const groups = c.contract.tokens ?? {};
      for (const [group, defs] of Object.entries(groups)) {
        for (const [name, def] of Object.entries(defs ?? {})) {
          if (!map.has(name)) {
            map.set(name, { name, definition: def, components: [], groups: [] });
          }
          const entry = map.get(name)!;
          if (!entry.components.includes(c.name)) entry.components.push(c.name);
          if (!entry.groups.includes(group)) entry.groups.push(group);
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [bundle]);

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return tokens;
    return tokens.filter(
      (t) =>
        t.name.toLowerCase().includes(needle) ||
        (t.definition.resolvesTo ?? "").toLowerCase().includes(needle) ||
        t.components.some((c) => c.toLowerCase().includes(needle)),
    );
  }, [tokens, filter]);

  return (
    <div className="page">
      <p className="page-eyebrow">FOUNDATIONS</p>
      <h1 className="page-title">Design tokens</h1>
      <p className="page-lede">
        {tokens.length} tokens declared across {bundle.components.length}{" "}
        components. Tokens are the contract between visual design and emitted
        CSS — every value resolves through a semantic layer before reaching a
        component.
      </p>

      <input
        type="search"
        placeholder="Filter tokens, references, or components…"
        aria-label="Filter tokens, references, or components"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        style={{
          width: "100%",
          padding: "var(--space-4) var(--space-5)",
          marginBottom: "var(--space-5)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-3)",
          background: "var(--bg-surface)",
          color: "var(--fg-default)",
          font: "inherit",
        }}
      />

      <div className="card">
        <table className="tokens-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Resolves to</th>
              <th>Fallback</th>
              <th>Used by</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.name}>
                <td>{t.name}</td>
                <td className="muted">{t.definition.resolvesTo ?? "—"}</td>
                <td>
                  {isColorish(t.definition.fallback) && (
                    <span
                      className="token-swatch"
                      style={{ background: t.definition.fallback }}
                      aria-hidden
                    />
                  )}
                  {t.definition.fallback ?? "—"}
                </td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                    {t.components.slice(0, 6).map((c) => (
                      <a
                        key={c}
                        className="chip"
                        href={buildHref({ kind: "component", name: c, tab: "design" })}
                      >
                        {c}
                      </a>
                    ))}
                    {t.components.length > 6 && (
                      <span className="chip subtle">+{t.components.length - 6}</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="subtle" style={{ textAlign: "center", padding: "var(--space-8)" }}>
                  No tokens match "{filter}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

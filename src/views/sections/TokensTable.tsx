import type { TokenDefinition } from "../../types/data";

interface TokensTableProps {
  tokens: Record<string, Record<string, TokenDefinition>>;
}

function isColorish(val: string | undefined): boolean {
  if (!val) return false;
  return /^#|^rgb|^hsl|^var\(/.test(val);
}

export function TokensTable({ tokens }: TokensTableProps) {
  const groups = Object.entries(tokens);

  return (
    <div className="card">
      <div className="card-toolbar">
        <span>{groups.length} state group{groups.length === 1 ? "" : "s"}</span>
        <span className="subtle">
          token → resolves → CSS property
        </span>
      </div>
      {groups.map(([groupName, entries]) => (
        <div key={groupName}>
          <div
            style={{
              padding: "var(--space-3) var(--space-5)",
              fontSize: "var(--fs-100)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--fg-subtle)",
              borderBottom: "1px solid var(--border-subtle)",
              background: "var(--bg-canvas)",
            }}
          >
            {groupName}
          </div>
          <table className="tokens-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Resolves to</th>
                <th>Fallback</th>
                <th>Property</th>
                <th>Layer</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(entries).map(([name, def]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td className="muted">{def.resolvesTo ?? "—"}</td>
                  <td>
                    {isColorish(def.fallback) && (
                      <span
                        className="token-swatch"
                        style={{ background: def.fallback }}
                        aria-hidden
                      />
                    )}
                    {def.fallback ?? "—"}
                  </td>
                  <td className="muted">{def.property ?? "—"}</td>
                  <td className="muted">{def.layer ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

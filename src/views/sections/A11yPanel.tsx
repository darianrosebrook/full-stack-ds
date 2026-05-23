import { Card, List } from "@full-stack-ds/react";
import type { A11y } from "../../types/data";

interface A11yPanelProps {
  a11y: A11y;
}

export function A11yPanel({ a11y }: A11yPanelProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--fsds-core-spacing-size-06)",
      }}
    >
      <Card density="inset">
        <h3 style={{ marginTop: 0, marginBottom: "var(--fsds-core-spacing-size-05)", fontSize: "var(--fsds-core-typography-ramp-3)" }}>Semantics</h3>
        <List
          as="dl"
          style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--fsds-core-spacing-size-05) var(--fsds-core-spacing-size-06)", margin: 0, fontSize: "var(--fsds-core-typography-ramp-2)" }}
        >
          <dt className="muted">Role</dt>
          <dd style={{ margin: 0 }}>
            {a11y.role ? <code>{a11y.role}</code> : <span className="subtle">implicit from tag</span>}
          </dd>
          <dt className="muted">Labeling</dt>
          <dd style={{ margin: 0 }}>
            {a11y.labeling && a11y.labeling.length > 0 ? (
              a11y.labeling.map((l) => (
                <code key={l} style={{ marginRight: "var(--fsds-core-spacing-size-04)" }}>
                  {l}
                </code>
              ))
            ) : (
              <span className="subtle">—</span>
            )}
          </dd>
        </List>
        {a11y.notes && a11y.notes.length > 0 && (
          <ul style={{ marginTop: "var(--fsds-core-spacing-size-06)", paddingLeft: "var(--fsds-core-spacing-size-06)", color: "var(--fsds-semantic-color-foreground-secondary)", fontSize: "var(--fsds-core-typography-ramp-2)" }}>
            {a11y.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        )}
      </Card>

      <Card density="inset">
        <h3 style={{ marginTop: 0, marginBottom: "var(--fsds-core-spacing-size-05)", fontSize: "var(--fsds-core-typography-ramp-3)" }}>Keyboard</h3>
        {a11y.keyboard && a11y.keyboard.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--fsds-core-typography-ramp-2)" }}>
            <tbody>
              {a11y.keyboard.map((k, i) => (
                <tr key={i}>
                  <td style={{ padding: "var(--fsds-core-spacing-size-04) var(--fsds-core-spacing-size-05) var(--fsds-core-spacing-size-04) 0", width: "0.1%", whiteSpace: "nowrap" }}>
                    {k.key.split("|").map((part, j) => (
                      <span key={j}>
                        {j > 0 && <span className="subtle" style={{ margin: "0 var(--fsds-core-spacing-size-04)" }}>or</span>}
                        <span className="kbd">{part}</span>
                      </span>
                    ))}
                  </td>
                  <td className="muted" style={{ padding: "var(--fsds-core-spacing-size-04) 0" }}>{k.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <span className="subtle">No declared keyboard interactions.</span>
        )}
      </Card>
    </div>
  );
}
